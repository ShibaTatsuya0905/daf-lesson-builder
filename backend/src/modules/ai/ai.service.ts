import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import crypto from 'crypto';
import prisma from '../../common/prisma';
import { ExamSkill } from './examSchema';
import { CaseDNA, CaseDiscoveryResult, CaseMemoryEntry, CaseEngine, CaseCandidate } from './caseEngine';
import { ExamBlueprintEngine, PreparedExamSkeleton, SkeletonBlock } from './examBlueprintEngine';
import { ExamValidator, ExamValidationResult, ValidationIssue } from './examValidator';

class GenerationBudget {
  constructor(public maxModelCalls: number = 25) {}
  consume() {
    this.maxModelCalls--;
    if (this.maxModelCalls < 0) {
      throw new Error('Đã vượt quá ngân sách gọi AI cho phiên làm việc này.');
    }
  }
}

export interface SpeakingExamSession {
  sessionId: string;
  provider: string;
  level: string;
  topic: string;
  caseDNA?: CaseDNA;
  currentPart: number;
  totalParts: number;
  currentPartTitle: string;
  turnsInCurrentPart: number;
  maxTurnsPerPart: number;
  candidateCard: {
    title: string;
    situation: string;
    leitpunkte: string[];
  };
  isFinished: boolean;
  history: Array<{ role: 'ai' | 'user'; text: string }>;
  evaluation?: {
    totalScore: number;
    maxScore: number;
    passed: boolean;
    criteria: {
      taskCompletion: { score: number; max: number; feedback: string };
      coherenceInteraction: { score: number; max: number; feedback: string };
      vocabulary: { score: number; max: number; feedback: string };
      grammarPronunciation: { score: number; max: number; feedback: string };
    };
    strengths: string[];
    corrections: Array<{ spoken: string; corrected: string; explanation: string }>;
    generalFeedback: string;
  };
}

export class AIService {
  private ai: GoogleGenerativeAI;
  private fileManager: GoogleAIFileManager;
  private modelPool = ['gemini-flash-latest', 'gemini-flash-lite-latest', 'gemini-3.8-flash', 'gemini-3.5-flash'];
  private inMemoryFallbackCases: CaseMemoryEntry[] = [];
  private exponentialBackoffDelays = [1500, 3000, 6000];

  constructor() {
    this.ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    this.fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY || '');
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private cleanJson(text: string): string {
    try {
      const parsed = JSON.parse(text);
      return JSON.stringify(parsed);
    } catch {
      let clean = text.trim();
      const fenced = clean.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
      if (fenced) clean = fenced[1].trim();

      const firstObject = clean.indexOf('{');
      const lastObject = clean.lastIndexOf('}');
      const firstArray = clean.indexOf('[');
      const lastArray = clean.lastIndexOf(']');

      const objectValid = firstObject !== -1 && lastObject !== -1 && firstObject < lastObject;
      const arrayValid = firstArray !== -1 && lastArray !== -1 && firstArray < lastArray;

      if (arrayValid && (!objectValid || firstArray < firstObject)) {
        clean = clean.substring(firstArray, lastArray + 1);
      } else if (objectValid) {
        clean = clean.substring(firstObject, lastObject + 1);
      }

      clean = clean.replace(/,\s*([}\]])/g, '$1');
      return clean.trim();
    }
  }

  private async executeWithFallback(
    executeFn: (model: any) => Promise<any>,
    budget: GenerationBudget,
    jsonMode: boolean = false
  ) {
    let lastError: any = null;

    for (const modelName of this.modelPool) {
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          budget.consume();
          
          console.log(`🤖 [AI Engine] Đang kết nối model: ${modelName} (Lần thử ${attempt + 1}/3)...`);

          const model = this.ai.getGenerativeModel(
            {
              model: modelName,
              ...(jsonMode ? { generationConfig: { responseMimeType: 'application/json' } } : {}),
            },
            { timeout: 60000 }
          );
          return await executeFn(model);
        } catch (err: any) {
          lastError = err;
          if (err.status === 400 || err.status === 401 || err.status === 403) {
            console.error(`[AI Engine] Lỗi ${err.status} model ${modelName}:`, err.message);
            throw err;
          }
          if (err.status === 404) {
            console.warn(`[AI Engine] Model ${modelName} không phản hồi (404). Chuyển sang model kế tiếp...`);
            break; 
          }
          if (err.status === 429 || err.status === 503) {
            console.warn(`[AI Engine] Quá tải/Hết Quota ở ${modelName}. Chờ ${this.exponentialBackoffDelays[attempt] / 1000}s để thử lại...`);
            if (attempt < 2) {
              await this.sleep(this.exponentialBackoffDelays[attempt] || 5000);
              continue;
            } else {
              break;
            }
          }
          console.error(`[AI Engine] Lỗi không xác định ở model ${modelName}:`, err.message);
          throw err;
        }
      }
    }
    throw lastError || new Error('Tất cả model AI đều gặp sự cố hoặc cạn kiệt quota.');
  }

  async slicePdfFile(file: Express.Multer.File, startPage: number, endPage: number): Promise<Uint8Array> {
    try {
      const existingPdfBytes = fs.readFileSync(file.path);
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const subDoc = await PDFDocument.create();
      const totalPages = pdfDoc.getPageCount();
      const start = Math.max(1, startPage);
      const end = Math.min(totalPages, endPage);
      const pageIndices: number[] = [];
      for (let i = start - 1; i < end; i++) pageIndices.push(i);
      const copiedPages = await subDoc.copyPages(pdfDoc, pageIndices);
      copiedPages.forEach((page: any) => subDoc.addPage(page));
      return await subDoc.save();
    } finally {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    }
  }

  private safeParseArray(value: unknown): string[] {
    if (Array.isArray(value)) return value;
    if (typeof value !== 'string') return [];
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private async getRecentMemory(provider: string, level: string): Promise<CaseMemoryEntry[]> {
    let dbEntries: CaseMemoryEntry[] = [];
    const caseMemoryModel = (prisma as any).caseMemory;

    if (caseMemoryModel) {
      try {
        const records = await caseMemoryModel.findMany({
          where: { provider, level },
          take: 100,
          orderBy: { createdAt: 'desc' },
        });
        dbEntries = records.map((e: any) => ({
          id: e.id,
          provider: e.provider || provider,
          level: e.level || level,
          activeSkills: this.safeParseArray(e.activeSkills) as ExamSkill[],
          topic: e.topic || '',
          title: e.title || '',
          domain: e.domain || '',
          subdomain: e.subdomain || '',
          context: e.context || '',
          situationType: e.situationType || '',
          conflictType: e.conflictType || '',
          roles: this.safeParseArray(e.roles),
          location: e.location || '',
          options: e.options || '',
          fingerprintHash: e.fingerprintHash || '',
          semanticFingerprint: e.semanticFingerprint || '',
          timestamp: new Date(e.createdAt).getTime(),
        }));
      } catch (err) {
        console.error('Lỗi truy vấn Case Memory từ Database:', err);
      }
    }

    const ramEntries = this.inMemoryFallbackCases.filter(
      (m) => m.provider === provider && m.level === level
    );

    const mergedMap = new Map<string, CaseMemoryEntry>();
    [...dbEntries, ...ramEntries].forEach((item) => {
      if (!mergedMap.has(item.fingerprintHash)) {
        mergedMap.set(item.fingerprintHash, item);
      }
    });

    return Array.from(mergedMap.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 100);
  }

  private async saveMemoryEntry(entry: CaseMemoryEntry): Promise<void> {
    const caseMemoryModel = (prisma as any).caseMemory;
    if (caseMemoryModel) {
      try {
        await caseMemoryModel.create({
          data: {
            provider: entry.provider,
            level: entry.level,
            activeSkills: JSON.stringify(entry.activeSkills),
            topic: (entry.topic || '').slice(0, 190),
            title: (entry.title || '').slice(0, 190),
            domain: (entry.domain || '').slice(0, 190),
            subdomain: (entry.subdomain || '').slice(0, 190),
            context: (entry.context || '').slice(0, 190),
            situationType: (entry.situationType || '').slice(0, 190),
            conflictType: (entry.conflictType || '').slice(0, 190),
            roles: JSON.stringify(entry.roles || []).slice(0, 190),
            location: (entry.location || '').slice(0, 190),
            options: (entry.options || '').slice(0, 190),
            fingerprintHash: entry.fingerprintHash,
            semanticFingerprint: entry.semanticFingerprint,
          },
        });
        this.inMemoryFallbackCases.push(entry);
        if (this.inMemoryFallbackCases.length > 200) this.inMemoryFallbackCases.shift();
        return;
      } catch (err) {
        console.error('Lỗi ghi Case Memory vào Database:', err);
      }
    }
    this.inMemoryFallbackCases.push(entry);
    if (this.inMemoryFallbackCases.length > 200) {
      this.inMemoryFallbackCases.shift();
    }
  }

  private async exploreAndRankCaseDNA(
    topic: string,
    level: string,
    provider: string,
    activeSkills: ExamSkill[],
    skeleton: PreparedExamSkeleton,
    budget: GenerationBudget
  ): Promise<CaseDNA> {
    const activeSkillsList = activeSkills.join(', ');
    const memory = await this.getRecentMemory(provider, level);

    const taskOverview = skeleton.skeletonBlocks.map((b) => ({
      taskId: b.taskId,
      skill: b.skill,
      teil: b.teil,
      taskType: b.data.taskType,
      answerType: b.data.answerType,
      points: b.data.maxPoints,
    }));

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const nonce = crypto.randomUUID();
        const recentMemoryEntries = memory.slice(0, 15).map((m) => ({
          title: m.title,
          domain: m.domain,
          subdomain: m.subdomain,
          context: m.context,
          situationType: m.situationType,
          conflictType: m.conflictType,
          roles: m.roles,
          options: m.options,
        }));

        const memoryPrompt =
          recentMemoryEntries.length > 0
            ? `RECENT PATTERNS TO STRICTLY AVOID DUPLICATING:\n${JSON.stringify(recentMemoryEntries, null, 2)}`
            : 'RECENT PATTERNS: None. Full exploration space available.';

        const explorationPrompt = `You are the Lead Assessment & Case Discovery Architect for ${provider} examinations (${level}).
Generate 3 diverse candidate scenarios for the topic: "${topic}".
The topic is NOT a rigid template. Do not assume the most obvious interpretation is the only valid one.

CRITICAL SYNTAX INSTRUCTION:
- Return ONLY 100% valid JSON.
- NEVER use unescaped double quotes inside German strings. Use German typographical quotes like „...“ or single quotes like '...'.

NONCE: ${nonce}
${memoryPrompt}

TARGET BLUEPRINT TASKS TO GROUND THE SCENARIO IN:
${JSON.stringify(taskOverview, null, 2)}

CEFR & LEVEL CONSTRAINTS:
- Keep the scenario aligned with ${level} for ${provider}.
- For TestDaF (TDN3-5): ground in academic, university study, scientific research, campus administration, or higher education policy contexts.
- All roles and conflicts must be authentic and culturally realistic for the DACH region.
- You MUST generate at least 3 distinct roles in the "roles" array.
- You MUST generate at least 2 stakeholder positions in "stakeholderPositions".
- The "stakeholderPositions" MUST contain at least 2 differing/conflicting positions.
- The "subScenariosBySkill" MUST include detailed descriptions (at least 20 chars) for ALL active skills: [${activeSkillsList}].

Return ONLY a valid JSON object matching this schema:
{
  "topicAnalysis": {
    "rawTopic": "${topic}",
    "domain": "string",
    "relatedDomains": ["string"],
    "subdomains": ["string"],
    "commonClichesToAvoid": ["string"],
    "freshAngles": ["string"]
  },
  "candidates": [
    {
      "candidateId": "cand_1",
      "dna": {
        "id": "CASE_${nonce}_1",
        "title": "A descriptive title (min 5 chars)",
        "domain": "A valid domain (min 3 chars)",
        "subdomain": "A valid subdomain (min 3 chars)",
        "situationType": "planning",
        "thematicUniverse": "Detailed thematic universe (min 15 chars)",
        "specificContext": "Detailed specific context (min 10 chars)",
        "roles": [
          {
            "role": "Role 1",
            "motivation": "Motivation 1",
            "perspective": "Perspective 1",
            "priority": "Priority 1",
            "constraint": "Constraint 1"
          },
          {
            "role": "Role 2",
            "motivation": "Motivation 2",
            "perspective": "Perspective 2",
            "priority": "Priority 2",
            "constraint": "Constraint 2"
          },
          {
            "role": "Role 3",
            "motivation": "Motivation 3",
            "perspective": "Perspective 3",
            "priority": "Priority 3",
            "constraint": "Constraint 3"
          }
        ],
        "coreConflict": {
          "type": "Conflict type",
          "stakeholderPositions": [
            {
              "role": "Role 1",
              "position": "Position 1",
              "reason": "Reason 1"
            },
            {
              "role": "Role 2",
              "position": "Position 2",
              "reason": "Reason 2"
            }
          ],
          "dilemma": "Detailed dilemma description (min 10 chars)",
          "tradeOffs": ["Tradeoff 1", "Tradeoff 2"],
          "compromisePotential": "Compromise potential"
        },
        "concreteData": {
          "location": "Location",
          "date": "Date",
          "duration": "Duration",
          "budget": "Budget",
          "quantity": "Quantity",
          "statistics": ["Stat 1", "Stat 2"],
          "deadline": "Deadline",
          "options": ["Option 1", "Option 2"]
        },
        "cefrLevel": "${level}",
        "pedagogicalGoal": "Detailed pedagogical goal (min 10 chars)",
        "generationFingerprint": "",
        "semanticFingerprint": "",
        "subScenariosBySkill": {
          ${activeSkills.map(s => `"${s.toLowerCase()}": "Detailed description of the specific sub-scenario for ${s.toLowerCase()} (at least 20 chars)"`).join(',\n          ')}
        }
      },
      "scores": {
        "realism": 0.9,
        "novelty": 0.9,
        "cefrFit": 0.9,
        "pedagogicalValue": 0.9,
        "topicRelevance": 0.9
      }
    }
  ]
}`;

        const rawResult = await this.executeWithFallback(
          async (model) => model.generateContent(explorationPrompt),
          budget,
          true
        );

        const cleanedText = this.cleanJson(rawResult.response.text());
        const parsed: CaseDiscoveryResult = JSON.parse(cleanedText);
        if (!parsed || !Array.isArray(parsed.candidates) || parsed.candidates.length === 0) continue;

        const validCandidates = parsed.candidates.filter(
          (c) => c && typeof c === 'object' && c.dna && typeof c.dna === 'object' && c.scores && typeof c.scores === 'object'
        );

        if (validCandidates.length === 0) continue;

        validCandidates.forEach((c) => {
          c.dna.subScenariosBySkill = CaseEngine.normalizeSubScenarios(c.dna.subScenariosBySkill as any);
        });

        const evaluatedCandidates = CaseEngine.evaluateCandidateSet(
          validCandidates,
          memory,
          level,
          provider,
          activeSkills
        );

        const strongPicks = evaluatedCandidates.filter((c: CaseCandidate) => c.selectionVerdict === 'STRONG_CANDIDATE');

        if (strongPicks.length > 0) {
          strongPicks.sort((a, b) => (b.scores.total || 0) - (a.scores.total || 0));
          return strongPicks[0].dna;
        } else {
          console.warn(`[Case Engine] Lần thử ${attempt}: Chưa có kịch bản nào vượt qua CEFR Validator.`);
          evaluatedCandidates.forEach((c: any) => console.log(` - Kịch bản ${c.candidateId} bị từ chối do: ${c.selectionVerdict}`));
        }
      } catch (parseOrGenError) {
        if (attempt === 3) {
          throw parseOrGenError;
        }
        await this.sleep(1000);
      }
    }

    throw new Error('Case Engine không tìm được kịch bản đạt chuẩn sau 3 lần tạo.');
  }

  private async repairTargetedQuestions(
    task: SkeletonBlock,
    currentPayload: any,
    questionErrors: ValidationIssue[],
    caseDNA: CaseDNA,
    level: string,
    budget: GenerationBudget
  ): Promise<any> {
    const nonce = crypto.randomUUID();
    const subScenarioContext =
      caseDNA.subScenariosBySkill[task.skill.toLowerCase() as keyof typeof caseDNA.subScenariosBySkill] ||
      caseDNA.thematicUniverse;

    const sourceTextReference =
      task.skill === 'LESEN'
        ? `SOURCE READING TEXT:\n${currentPayload.readingText || 'N/A'}`
        : task.skill === 'HOEREN'
        ? `SOURCE AUDIO TRANSCRIPT:\n${currentPayload.transcript || 'N/A'}`
        : 'N/A';

    const errorIndices = Array.from(
      new Set(questionErrors.map((i) => i.questionIndex).filter((idx): idx is number => idx !== undefined))
    );

    const questionsToFix = errorIndices.map((idx) => ({
      questionIndex: idx,
      currentQuestion: currentPayload.quizQuestions?.[idx] || {},
      errors: questionErrors.filter((e) => e.questionIndex === idx).map((e) => `${e.field}: ${e.message}`),
    }));

    const quizContract = task.contract.quiz;

    const prompt = `You are a Surgical Question Repair Specialist for a German Exam Task (${level}).

NONCE: ${nonce}
TASK: ${task.taskId} (${task.data.taskType} | ${task.data.answerType})
CONTEXT: ${subScenarioContext}

QUIZ CONTRACT CONSTRAINTS:
${JSON.stringify(quizContract, null, 2)}

${sourceTextReference}

QUESTIONS THAT FAILED VALIDATION (FIX ONLY THESE):
${JSON.stringify(questionsToFix, null, 2)}

INSTRUCTIONS:
1. Return a JSON object with a "repairs" array.
2. For each repaired question, provide "questionIndex" and the complete "repairedQuestion" object.
3. Every repaired question MUST contain a non-empty "question" field containing the question or statement text.
4. Obey the Quiz Contract constraints strictly:
   - If correctAnswerMode is 'boolean': options must be exactly 2 items.
   - If correctAnswerMode is 'multiple': use "correctAnswerIndices": [X, Y] with ${quizContract?.minCorrectAnswers || 2} to ${quizContract?.maxCorrectAnswers || 3} items. Never use correctAnswerIndex.
   - If correctAnswerMode is 'single': options must have exactly ${quizContract?.optionCount || 3} choices and valid correctAnswerIndex.
   - If correctAnswerMode is 'matching': "question" must be the statement/premise to match, and provide "correctMatch": "...".
   - If correctAnswerMode is 'text': provide "correctAnswer": "..." with the exact short answer key.
5. Output 100% valid JSON. Do not use unescaped double quotes inside strings.

Return schema:
{
  "repairs": [
    {
      "questionIndex": 0,
      "repairedQuestion": {
        "id": "q1",
        "question": "Full statement or question text here...",
        "options": ["A", "B", "C"],
        "correctAnswerIndex": 0,
        "correctAnswer": "Exact short answer keyword or phrase",
        "correctMatch": "A",
        "explanation": "..."
      }
    }
  ]
}`;

    const rawResult = await this.executeWithFallback(async (model) => model.generateContent(prompt), budget, true);

    const parsed = JSON.parse(this.cleanJson(rawResult.response.text()));
    const nextPayload = { ...currentPayload, quizQuestions: [...(currentPayload.quizQuestions || [])] };

    if (Array.isArray(parsed.repairs)) {
      parsed.repairs.forEach((r: any) => {
        if (Number.isInteger(r.questionIndex) && r.repairedQuestion) {
          nextPayload.quizQuestions[r.questionIndex] = r.repairedQuestion;
        }
      });
    }

    return nextPayload;
  }

  private async generateTaskPayloadsWithTargetedRetry(
    tasksToGenerate: SkeletonBlock[],
    caseDNA: CaseDNA,
    provider: string,
    level: string,
    fileParts: any[],
    previousPayloads: Record<string, any>,
    previousErrors: ValidationIssue[] = [],
    budget: GenerationBudget
  ): Promise<Record<string, any>> {
    const nonce = crypto.randomUUID();
    const taskErrors = previousErrors.filter((i) => i.questionIndex === undefined);

    const previousErrorsFeedback =
      taskErrors.length > 0
        ? `CRITICAL VALIDATION ERRORS:\n${taskErrors.map((i) => `- Task [${i.taskId}]: ${i.message}`).join('\n')}\nStrictly fix these issues.`
        : '';

    const failedTasksContext = tasksToGenerate
      .map((b) => {
        const prev = previousPayloads[b.taskId];
        return prev ? `PREVIOUS CONTENT FOR ${b.taskId}:\n${JSON.stringify(prev, null, 2)}` : '';
      })
      .filter(Boolean)
      .join('\n\n');

    const taskSpecsPrompt = tasksToGenerate.map((b) => ({
      taskId: b.taskId,
      skill: b.skill,
      teil: b.teil,
      taskType: b.data.taskType,
      answerType: b.data.answerType,
      responseMode: b.data.responseMode,
      requiredItemCount: b.data.expectedItemCount,
      contractFields: Array.from(b.contract.allowedFields),
      quizConstraints: b.contract.quiz,
      subScenarioContext:
        caseDNA.subScenariosBySkill[b.skill.toLowerCase() as keyof typeof caseDNA.subScenariosBySkill] ||
        caseDNA.thematicUniverse,
    }));

    const prompt = `You are the Lead Content Developer for ${provider} (${level}).
Fill the content slots for the following Exam Blueprint Tasks:

NONCE: ${nonce}
${previousErrorsFeedback}

THEMATIC UNIVERSE:
"${caseDNA.thematicUniverse}"
Context: ${caseDNA.specificContext}
Conflict: ${caseDNA.coreConflict.stakeholderPositions.map((s) => s.role).join(' vs ')}
Concrete Data: ${JSON.stringify(caseDNA.concreteData)}

TARGET TASKS TO POPULATE WITH CONSTRAINTS:
${JSON.stringify(taskSpecsPrompt, null, 2)}

${failedTasksContext}

INSTRUCTIONS:
1. Return a JSON object with a "taskPayloads" dictionary keyed by EXACT "taskId".
2. For each task, populate ONLY the fields declared in its "contractFields". Do NOT return metadata fields.
3. Item constraints per task:
   - Provide EXACTLY "requiredItemCount" items if quizQuestions is required.
   - For EVERY question object in "quizQuestions", you MUST provide a non-empty "question" field (for matching tasks, put the statement/premise to match into "question"). NEVER leave "question" empty.
   - Respect "quizConstraints" for each task:
     * If boolean: options must be 2 items.
     * If multiple: use "correctAnswerIndices": [0, 2].
     * If single: options must match optionCount.
     * If matching: "question" must be the statement/premise to match, and provide "correctMatch": "...".
     * If text / short answer: provide "correctAnswer": "The exact short answer keyword or phrase".
4. If "rubric" is in contractFields (e.g. for SCHREIBEN), provide a CEFR scoring object with integers. Do NOT return null.
5. Output 100% valid JSON. Never produce unescaped double quotes inside strings.

Return schema:
{
  "taskPayloads": {
    "${tasksToGenerate[0]?.taskId || 'TASK_ID_HERE'}": {
      "title": "...",
      "instructions": "...",
      "readingText": "...",
      "transcript": "...",
      "sampleSolution": "...",
      "sentenceStarters": ["...", "..."],
      "quizQuestions": [
        {
          "id": "q1",
          "question": "Full statement or question text here...",
          "options": ["A", "B", "C"],
          "correctAnswerIndex": 0,
          "correctAnswer": "Exact short answer keyword or phrase",
          "correctMatch": "A",
          "explanation": "..."
        }
      ],
      "rubric": {
        "taskCompletion": 5,
        "coherence": 5,
        "vocabulary": 5,
        "grammar": 5
      }
    }
  }
}`;

    const rawResult = await this.executeWithFallback(
      async (model) => model.generateContent(fileParts.length > 0 ? [prompt, ...fileParts] : prompt),
      budget,
      true
    );

    const parsed = JSON.parse(this.cleanJson(rawResult.response.text()));
    return parsed.taskPayloads || parsed;
  }

  async generateExam(params: {
    topic: string;
    level: string;
    duration: number;
    parts: string[];
    certificate?: string;
    files?: Express.Multer.File[];
  }) {
    const budget = new GenerationBudget(25);
    const uploadedFiles: any[] = [];

    try {
      if (params.files && params.files.length > 0) {
        for (const file of params.files) {
          const res = await this.fileManager.uploadFile(file.path, {
            mimeType: file.mimetype,
            displayName: file.originalname,
          });
          uploadedFiles.push(res.file);
        }
      }

      console.log(`🚀 [Exam Engine] Bắt đầu khởi tạo đề thi: ${params.certificate} Niveau ${params.level}`);
      const blueprint = ExamBlueprintEngine.resolveBlueprint(params.certificate || 'GOETHE', params.level);

      const reqSkills: ExamSkill[] = [];
      if (params.parts.includes('Leseverstehen')) reqSkills.push('LESEN');
      if (params.parts.includes('Sprachbausteine')) reqSkills.push('SPRACHBAUSTEINE');
      if (params.parts.includes('Hörverstehen')) reqSkills.push('HOEREN');
      if (params.parts.includes('Schreiben')) reqSkills.push('SCHREIBEN');
      if (params.parts.includes('Sprechen') || params.parts.includes('Mündlicher Ausdruck')) reqSkills.push('SPRECHEN');

      if (reqSkills.length === 0) {
        throw new Error('Vui lòng chọn ít nhất 1 kỹ năng thi hợp lệ để tạo đề.');
      }

      const skeleton: PreparedExamSkeleton = ExamBlueprintEngine.createSkeleton(blueprint, reqSkills);

      console.log(`⏳ [Bước 1/3] Đang phân tích và xây dựng kịch bản tình huống (${params.level})...`);
      const caseDNA = await this.exploreAndRankCaseDNA(
        params.topic,
        blueprint.level,
        blueprint.provider,
        reqSkills,
        skeleton,
        budget
      );
      console.log(`✅ [Bước 1/3] Kịch bản hoàn tất: "${caseDNA.title}"`);

      const accumulatedPayloads: Record<string, any> = {};
      let tasksNeedingFullGeneration: SkeletonBlock[] = [...skeleton.skeletonBlocks];
      let questionsNeedingRepair: Record<string, ValidationIssue[]> = {};

      let finalExam: any = null;
      let lastValidation: ExamValidationResult | null = null;

      for (let attempt = 1; attempt <= 3; attempt++) {
        if (tasksNeedingFullGeneration.length === 0 && Object.keys(questionsNeedingRepair).length === 0) break;

        for (const [taskId, qErrors] of Object.entries(questionsNeedingRepair)) {
          const skeletonBlock = skeleton.skeletonBlocks.find((b) => b.taskId === taskId);
          if (skeletonBlock && accumulatedPayloads[taskId]) {
            console.log(`🔧 Đang sửa lại các câu hỏi chưa đạt tại ${taskId}...`);
            accumulatedPayloads[taskId] = await this.repairTargetedQuestions(
              skeletonBlock,
              accumulatedPayloads[taskId],
              qErrors,
              caseDNA,
              blueprint.level,
              budget
            );
          }
        }
        questionsNeedingRepair = {};

        if (tasksNeedingFullGeneration.length > 0) {
          console.log(`⏳ [Bước 2/3] Đang biên soạn nội dung chi tiết cho ${tasksNeedingFullGeneration.length} phần thi (Lần thử ${attempt})...`);
          const fileParts = uploadedFiles.map((f) => ({ fileData: { mimeType: f.mimeType, fileUri: f.uri } }));
          const taskErrors = lastValidation ? lastValidation.issues.filter((i) => i.questionIndex === undefined) : [];

          const newPayloads = await this.generateTaskPayloadsWithTargetedRetry(
            tasksNeedingFullGeneration,
            caseDNA,
            blueprint.provider,
            blueprint.level,
            fileParts,
            accumulatedPayloads,
            taskErrors,
            budget
          );

          for (const [tId, pLoad] of Object.entries(newPayloads)) {
            accumulatedPayloads[tId] = {
              ...(accumulatedPayloads[tId] || {}),
              ...(pLoad || {}),
            };
          }
          console.log(`✅ [Bước 2/3] Đã biên soạn xong dữ liệu các phần thi!`);
        }

        finalExam = ExamBlueprintEngine.mergeContentIntoSkeleton(skeleton, accumulatedPayloads);
        finalExam.title = `${blueprint.provider} ${blueprint.level}: ${caseDNA.title}`;
        finalExam.topic = caseDNA.title;
        finalExam.objectives = `Offizieller Modelltest ${blueprint.blueprintId}: ${caseDNA.pedagogicalGoal}`;

        console.log(`🔍 [Bước 3/3] Đang kiểm định cấu trúc qua ExamValidator...`);
        lastValidation = ExamValidator.validateExam(finalExam, skeleton.skeletonBlocks);

        if (lastValidation.isValid) {
          console.log(`🎉 Đề thi đạt chuẩn 100%! Đang lưu và hoàn tất...`);
          await this.saveMemoryEntry({
            provider: blueprint.provider,
            level: blueprint.level,
            activeSkills: reqSkills,
            topic: params.topic,
            title: caseDNA.title,
            domain: caseDNA.domain,
            subdomain: caseDNA.subdomain,
            context: caseDNA.specificContext,
            situationType: caseDNA.situationType,
            conflictType: caseDNA.coreConflict?.type || '',
            roles: caseDNA.roles.map((r) => r.role),
            location: caseDNA.concreteData?.location || '',
            options: [...(caseDNA.concreteData?.options || [])].sort().join(','),
            fingerprintHash: caseDNA.generationFingerprint,
            semanticFingerprint: caseDNA.semanticFingerprint,
            timestamp: Date.now(),
          });

          return finalExam;
        }

        tasksNeedingFullGeneration = [];
        questionsNeedingRepair = {};

        const taskLevelErrorIds = new Set<string>();
        lastValidation.issues.forEach((issue) => {
          if (issue.severity === 'ERROR') {
            if (issue.questionIndex === undefined) {
              taskLevelErrorIds.add(issue.taskId);
            }
          }
        });

        lastValidation.issues.forEach((issue) => {
          if (issue.severity === 'ERROR') {
            if (taskLevelErrorIds.has(issue.taskId)) {
              const blockToRegen = skeleton.skeletonBlocks.find((b) => b.taskId === issue.taskId);
              if (blockToRegen && !tasksNeedingFullGeneration.some((b) => b.taskId === issue.taskId)) {
                tasksNeedingFullGeneration.push(blockToRegen);
              }
            } else if (issue.questionIndex !== undefined) {
              if (!questionsNeedingRepair[issue.taskId]) questionsNeedingRepair[issue.taskId] = [];
              questionsNeedingRepair[issue.taskId].push(issue);
            }
          }
        });
      }

      if (lastValidation && !lastValidation.isValid) {
        const errorSummary = lastValidation.issues
          .filter((i) => i.severity === 'ERROR')
          .map((i) => `[${i.taskId}]: ${i.message}`)
          .join(' | ');
        throw new Error(`Đề thi không vượt qua cổng kiểm định chuẩn sau 3 lần tạo: ${errorSummary}`);
      }

      return finalExam;
    } finally {
      if (params.files) {
        params.files.forEach((f) => {
          if (fs.existsSync(f.path)) fs.unlinkSync(f.path);
        });
      }
      for (const f of uploadedFiles) {
        try {
          await this.fileManager.deleteFile(f.name);
        } catch (e) {}
      }
    }
  }

  async detectTableOfContents(file: Express.Multer.File) {
    let uploadedFile: any = null;
    try {
      const res = await this.fileManager.uploadFile(file.path, {
        mimeType: file.mimetype,
        displayName: file.originalname,
      });
      uploadedFile = res.file;
      const prompt = `Extract all Lektions with startPage and endPage. Return JSON array: [{"lektionNumber": 1, "title": "Title", "theme": "Theme", "startPage": 8, "endPage": 14}]`;
      const result = await this.executeWithFallback(
        async (model) =>
          model.generateContent([
            prompt,
            { fileData: { mimeType: uploadedFile.mimeType, fileUri: uploadedFile.uri } },
          ]),
        new GenerationBudget(5),
        true
      );
      return JSON.parse(this.cleanJson(result.response.text()));
    } finally {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      if (uploadedFile) {
        try {
          await this.fileManager.deleteFile(uploadedFile.name);
        } catch (e) {}
      }
    }
  }

  async scanDocument(files: Express.Multer.File[]) {
    const uploadedFiles: any[] = [];
    try {
      for (const file of files) {
        const res = await this.fileManager.uploadFile(file.path, {
          mimeType: file.mimetype,
          displayName: file.originalname,
        });
        uploadedFiles.push(res.file);
      }
      const fileParts = uploadedFiles.map((f) => ({ fileData: { mimeType: f.mimeType, fileUri: f.uri } }));
      const prompt = `Analyze document and break into blocks (Lesen, Wortschatz, Grammatik...). Return JSON.`;
      const result = await this.executeWithFallback(
        async (model) => model.generateContent([prompt, ...fileParts]),
        new GenerationBudget(5),
        true
      );
      return JSON.parse(this.cleanJson(result.response.text()));
    } finally {
      files.forEach((f) => {
        if (fs.existsSync(f.path)) fs.unlinkSync(f.path);
      });
      for (const f of uploadedFiles) {
        try {
          await this.fileManager.deleteFile(f.name);
        } catch (e) {}
      }
    }
  }

  async generateLesson(params: { topic: string; level: string; duration: number; focusAreas: string[] }) {
    const prompt = `You are an expert DaF Curriculum Designer.
Generate a structured German lesson matching CEFR ${params.level}.
Topic: "${params.topic}"
Target Duration: ${params.duration} minutes
Focus Areas: ${JSON.stringify(params.focusAreas)}

Return a JSON array of pedagogical blocks covering Einstieg, Wortschatz, Grammatik, and Anwendung:
[
  {
    "type": "Einstieg|Wortschatz|Grammatik|Sprechen|Lesen|Quiz",
    "title": "Block Title",
    "duration": 15,
    "tags": ["Tag1"],
    "data": {
      "instructions": "German instructions",
      "vocabulary": [{"article": "der", "german": "Tisch", "translation": "bàn", "plural": "Tische", "example": "..."}],
      "quizQuestions": []
    }
  }
]`;
    const result = await this.executeWithFallback(
      async (model) => model.generateContent(prompt),
      new GenerationBudget(5),
      true
    );
    return JSON.parse(this.cleanJson(result.response.text() || '[]'));
  }

  async enrichVocabulary(topic: string) {
    const prompt = `You are a DaF Lexicographer.
Generate 5 high-yield German vocabulary items for the topic: "${topic}".
Return a strictly formatted JSON array:
[
  {
    "article": "der|die|das|-",
    "german": "Wort",
    "translation": "Nghĩa tiếng Việt chuẩn",
    "plural": "Pluralform oder -",
    "example": "Authentischer Beispielsatz auf Deutsch."
  }
]`;
    const result = await this.executeWithFallback(
      async (model) => model.generateContent(prompt),
      new GenerationBudget(5),
      true
    );
    return JSON.parse(this.cleanJson(result.response.text() || '[]'));
  }

  private async evaluateSpeakingSession(
    session: SpeakingExamSession,
    budget: GenerationBudget
  ) {
    const prompt = `You are an Official Senior CEFR Oral Examiner for ${session.provider} (Niveau ${session.level}).
Topic: "${session.topic}"
Situation Universe: "${session.caseDNA?.thematicUniverse || session.topic}"

COMPLETE CANDIDATE EXAM TRANSCRIPT:
${JSON.stringify(session.history, null, 2)}

Evaluate the candidate's spoken performance rigorously according to official CEFR criteria.
Scoring: Exactly 25 points maximum per criterion (Total = 100 points).
Pass threshold: 60 points.

Criteria:
1. Aufgabenerfüllung (Task Completion): Coverage of Leitpunkte, relevance, substance.
2. Kohärenz & Interaktion (Coherence & Interaction): Connectors, reactive dialogue, turn-taking.
3. Wortschatz & Ausdruck (Vocabulary & Range): Idiomatic expressions, topic-specific vocabulary, variety.
4. Grammatik & Aussprache (Grammar & Pronunciation): Sentence structure, verb placement, adjective endings, fluency.

Extract concrete spoken mistakes and provide the correct native German phrasing in "corrections".

Return ONLY a valid JSON object matching this schema:
{
  "totalScore": 75,
  "maxScore": 100,
  "passed": true,
  "criteria": {
    "taskCompletion": { "score": 20, "max": 25, "feedback": "Detailed feedback in German" },
    "coherenceInteraction": { "score": 18, "max": 25, "feedback": "Detailed feedback in German" },
    "vocabulary": { "score": 19, "max": 25, "feedback": "Detailed feedback in German" },
    "grammarPronunciation": { "score": 18, "max": 25, "feedback": "Detailed feedback in German" }
  },
  "strengths": ["Strength 1 in German", "Strength 2 in German"],
  "corrections": [
    {
      "spoken": "Incorrect sentence spoken by candidate",
      "corrected": "Correct native German sentence",
      "explanation": "Grammatical explanation in German or Vietnamese"
    }
  ],
  "generalFeedback": "Comprehensive summary evaluation in German"
}`;

    const rawResult = await this.executeWithFallback(
      async (model) => model.generateContent(prompt),
      budget,
      true
    );

    return JSON.parse(this.cleanJson(rawResult.response.text()));
  }

  async simulateSpeakingTurn(
    level: string,
    topic: string,
    history: { role: 'ai' | 'user'; text: string }[],
    certificate: string = 'Goethe-Zertifikat',
    sessionState?: SpeakingExamSession
  ): Promise<SpeakingExamSession> {
    const budget = new GenerationBudget(15);
    const resolvedProvider = certificate.toUpperCase().includes('TELC')
      ? 'TELC'
      : certificate.toUpperCase().includes('OESD') || certificate.toUpperCase().includes('ÖSD')
      ? 'OESD'
      : certificate.toUpperCase().includes('TESTDAF')
      ? 'TESTDAF'
      : 'GOETHE';

    if (!sessionState || !sessionState.caseDNA) {
      const blueprint = ExamBlueprintEngine.resolveBlueprint(resolvedProvider, level);
      const skeleton = ExamBlueprintEngine.createSkeleton(blueprint, ['SPRECHEN']);
      const caseDNA = await this.exploreAndRankCaseDNA(topic, level, resolvedProvider, ['SPRECHEN'], skeleton, budget);

      const totalParts = skeleton.skeletonBlocks.length || 3;
      const initialPartBlock = skeleton.skeletonBlocks[0];

      const initialCardPrompt = `You are designing Teil 1 of the official ${resolvedProvider} ${level} oral examination.
Topic Universe: "${caseDNA.thematicUniverse}"
Context: ${caseDNA.specificContext}
Conflict: ${caseDNA.coreConflict.dilemma}
Part Task Type: ${initialPartBlock?.data.taskType || 'Gemeinsam planen'}

Generate a realistic candidate examination card (Kandidatenblatt) for Teil 1 in German.
Return ONLY valid JSON:
{
  "title": "${initialPartBlock?.title || 'Teil 1: Gemeinsam planen'}",
  "situation": "Authentic situation description for candidate in German (2-3 sentences)",
  "leitpunkte": ["Leitpunkt 1", "Leitpunkt 2", "Leitpunkt 3", "Leitpunkt 4"]
}`;

      const cardResult = await this.executeWithFallback(
        async (model) => model.generateContent(initialCardPrompt),
        budget,
        true
      );
      const initialCard = JSON.parse(this.cleanJson(cardResult.response.text()));

      const greetingPrompt = `You are the lead oral examiner for ${resolvedProvider} ${level}.
Exam Topic: "${caseDNA.title}"
Task: ${initialCard.title}
Situation: ${initialCard.situation}

Welcome the candidate warmly in native German, explain the task instructions for Teil 1 clearly, and ask the opening question to start the exam. Keep it natural and authentic.`;

      const greetingResult = await this.executeWithFallback(
        async (model) => model.generateContent(greetingPrompt),
        budget,
        false
      );

      const examinerGreeting = greetingResult.response.text().trim();

      return {
        sessionId: crypto.randomUUID(),
        provider: resolvedProvider,
        level,
        topic,
        caseDNA,
        currentPart: 1,
        totalParts,
        currentPartTitle: initialCard.title,
        turnsInCurrentPart: 0,
        maxTurnsPerPart: 3,
        candidateCard: initialCard,
        isFinished: false,
        history: [{ role: 'ai', text: examinerGreeting }],
      };
    }

    const state: SpeakingExamSession = {
      ...sessionState,
      history: [...history],
    };

    state.turnsInCurrentPart++;

    if (state.turnsInCurrentPart >= state.maxTurnsPerPart) {
      if (state.currentPart < state.totalParts) {
        state.currentPart++;
        state.turnsInCurrentPart = 0;

        const nextPartBlock = ExamBlueprintEngine.createSkeleton(
          ExamBlueprintEngine.resolveBlueprint(state.provider, state.level),
          ['SPRECHEN']
        ).skeletonBlocks[state.currentPart - 1];

        const nextCardPrompt = `Generate Kandidatenblatt for Teil ${state.currentPart} of ${state.provider} ${state.level}.
Topic Universe: "${state.caseDNA?.thematicUniverse}"
Part: ${nextPartBlock?.title || `Teil ${state.currentPart}`}
Return ONLY valid JSON:
{
  "title": "${nextPartBlock?.title || `Teil ${state.currentPart}`}",
  "situation": "Situation description in German",
  "leitpunkte": ["Punkt 1", "Punkt 2", "Punkt 3", "Punkt 4"]
}`;

        const nextCardResult = await this.executeWithFallback(
          async (model) => model.generateContent(nextCardPrompt),
          budget,
          true
        );
        state.candidateCard = JSON.parse(this.cleanJson(nextCardResult.response.text()));
        state.currentPartTitle = state.candidateCard.title;

        const transitionPrompt = `You are the oral examiner for ${state.provider} ${state.level}.
The candidate just finished the previous part.
Conclude the previous part politely in German, introduce the new part: "${state.candidateCard.title}", explain what the candidate should do now, and invite them to speak.`;

        const transitionResult = await this.executeWithFallback(
          async (model) => model.generateContent(transitionPrompt),
          budget,
          false
        );

        const transitionSpeech = transitionResult.response.text().trim();
        state.history.push({ role: 'ai', text: transitionSpeech });
        return state;
      } else {
        state.isFinished = true;

        const evaluation = await this.evaluateSpeakingSession(state, budget);
        state.evaluation = evaluation;

        const closingPrompt = `You are the oral examiner for ${state.provider} ${state.level}.
The exam has officially concluded. Thank the candidate warmly in German and tell them the exam is over and their evaluation is ready. (Max 2 sentences).`;

        const closingResult = await this.executeWithFallback(
          async (model) => model.generateContent(closingPrompt),
          budget,
          false
        );

        const closingSpeech = closingResult.response.text().trim();
        state.history.push({ role: 'ai', text: closingSpeech });

        await this.saveMemoryEntry({
          provider: state.provider,
          level: state.level,
          activeSkills: ['SPRECHEN'],
          topic: state.topic,
          title: state.caseDNA?.title || state.topic,
          domain: state.caseDNA?.domain || 'Alltag',
          subdomain: state.caseDNA?.subdomain || 'Kommunikation',
          context: state.caseDNA?.specificContext || state.topic,
          situationType: state.caseDNA?.situationType || 'dialogue',
          conflictType: state.caseDNA?.coreConflict?.type || 'oral_exam',
          roles: (state.caseDNA?.roles || []).map((r) => r.role),
          location: state.caseDNA?.concreteData?.location || '',
          options: [...(state.caseDNA?.concreteData?.options || [])].sort().join(','),
          fingerprintHash: state.caseDNA?.generationFingerprint || crypto.randomUUID(),
          semanticFingerprint: state.caseDNA?.semanticFingerprint || crypto.randomUUID(),
          timestamp: Date.now(),
        });

        return state;
      }
    }

    const conversationPrompt = `You are the active oral examiner for ${state.provider} ${state.level}.
Current Part: "${state.currentPartTitle}"
Task Card Situation: "${state.candidateCard.situation}"
Leitpunkte: ${JSON.stringify(state.candidateCard.leitpunkte)}

Complete Conversation So Far:
${JSON.stringify(state.history, null, 2)}

Respond to the candidate's latest response naturally in German as a native examiner.
Acknowledge their point, ask a follow-up question or react to move the dialogue forward. Do not lecture. Max 2-3 sentences.`;

    const turnResult = await this.executeWithFallback(
      async (model) => model.generateContent(conversationPrompt),
      budget,
      false
    );

    const examinerReply = turnResult.response.text().trim();
    state.history.push({ role: 'ai', text: examinerReply });
    return state;
  }
}