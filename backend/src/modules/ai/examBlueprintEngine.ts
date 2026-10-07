import { OFFICIAL_EXAM_BLUEPRINTS } from './examBlueprints';
import { OfficialExamBlueprint, ExamSkill, TaskBlueprint } from './examSchema';

const CERTIFICATE_ALIASES: Record<string, string> = {
  'GOETHE': 'GOETHE',
  'GOETHE-ZERTIFIKAT': 'GOETHE',
  'GOETHE ZERTIFIKAT': 'GOETHE',
  'TELC': 'TELC',
  'TELC DEUTSCH': 'TELC',
  'OESD': 'OESD',
  'ÖSD': 'OESD',
  'OESD ZERTIFIKAT': 'OESD',
  'ÖSD ZERTIFIKAT': 'OESD',
  'TESTDAF': 'TESTDAF',
};

const ALLOWED_AI_FIELDS_BY_SKILL: Record<string, Set<string>> = {
  LESEN: new Set(['instructions', 'readingText', 'quizQuestions']),
  HOEREN: new Set(['instructions', 'transcript', 'quizQuestions']),
  SCHREIBEN: new Set(['instructions', 'sampleSolution', 'rubric']),
  SPRECHEN: new Set(['instructions', 'dialogueScenario', 'sampleSolution', 'sentenceStarters', 'keyPoints']),
  SPRACHBAUSTEINE: new Set(['instructions', 'gapText', 'quizQuestions', 'wordBank']),
};

export interface TaskContentContract {
  taskId: string;
  skill: ExamSkill;
  teil: number;
  taskType: string;
  answerType: string;
  responseMode: string;
  allowedFields: Set<string>;
  requiredItemCount: number;
  minTextLength?: number;
  quiz?: {
    optionCount?: number;
    minCorrectAnswers: number;
    maxCorrectAnswers: number;
    correctAnswerMode: 'single' | 'multiple' | 'boolean' | 'matching' | 'text';
    matchingFormat?: 'KEY_VALUE' | 'PREMISE_TARGET';
  };
  requiresReadingText: boolean;
  requiresTranscript: boolean;
  requiresSampleSolution: boolean;
  requiresRubric: boolean;
  requiresSentenceStarters: boolean;
}

export interface SkeletonBlock {
  taskId: string;
  skill: ExamSkill;
  teil: number;
  type: string;
  title: string;
  duration: number;
  tags: string[];
  contract: TaskContentContract;
  data: {
    taskType: string;
    answerType: string;
    responseMode: string;
    maxPoints: number;
    expectedItemCount: number;
    [key: string]: any;
  };
}

export interface PreparedExamSkeleton {
  blueprint: OfficialExamBlueprint;
  activeModules: Array<{
    skill: ExamSkill;
    tasks: TaskBlueprint[];
  }>;
  totalDurationMinutes: number;
  totalPoints: number;
  skeletonBlocks: SkeletonBlock[];
}

export class ExamBlueprintEngine {
  static resolveBlueprint(cert: string, level: string, mode: 'PAPER' | 'DIGITAL' = 'PAPER'): OfficialExamBlueprint {
    const rawCert = (cert || '').trim().toUpperCase();
    const resolvedProvider = CERTIFICATE_ALIASES[rawCert];

    if (!resolvedProvider) {
      throw new Error(`Kỳ thi/chứng chỉ không được hỗ trợ: ${cert}`);
    }

    const cleanLevel = (level || 'B1').toUpperCase().replace(/[\.\s]/g, '');
    let blueprintId = `${resolvedProvider}_${cleanLevel}_2026`;
    
    if (resolvedProvider === 'TESTDAF') {
      blueprintId = `${resolvedProvider}_${cleanLevel}_${mode}_2026`;
    }

    const blueprint = OFFICIAL_EXAM_BLUEPRINTS[blueprintId];
    
    if (!blueprint) {
      throw new Error(`Không tìm thấy cấu hình Blueprint cho: ${blueprintId}`);
    }

    return blueprint;
  }

  static getTaskContentContract(task: TaskBlueprint, skill: ExamSkill, taskId: string): TaskContentContract {
    const cleanSkill = String(skill || '').toUpperCase() as ExamSkill;

    const isFreeText =
      task.answerType === 'FREE_TEXT' ||
      task.responseMode === 'LONG_TEXT' ||
      ['SCHREIBEN', 'SPRECHEN'].includes(cleanSkill);

    const allowedFields = new Set<string>(['instructions', 'title']);

    let quizSpec: TaskContentContract['quiz'] = undefined;

    if (cleanSkill === 'LESEN') {
      allowedFields.add('readingText');
      if (!isFreeText) allowedFields.add('quizQuestions');
    } else if (cleanSkill === 'HOEREN') {
      allowedFields.add('transcript');
      if (!isFreeText) allowedFields.add('quizQuestions');
    } else if (cleanSkill === 'SCHREIBEN') {
      allowedFields.add('sampleSolution');
      allowedFields.add('rubric');
    } else if (cleanSkill === 'SPRECHEN') {
      allowedFields.add('dialogueScenario');
      allowedFields.add('sampleSolution');
      allowedFields.add('sentenceStarters');
      allowedFields.add('keyPoints');
    } else if (cleanSkill === 'SPRACHBAUSTEINE') {
      allowedFields.add('gapText');
      allowedFields.add('quizQuestions');
      allowedFields.add('wordBank');
    }

    if (!isFreeText) {
      if (task.answerType === 'TRUE_FALSE' || task.answerType === 'YES_NO') {
        quizSpec = { optionCount: 2, minCorrectAnswers: 1, maxCorrectAnswers: 1, correctAnswerMode: 'boolean' };
      } else if (task.answerType === 'NOT_GIVEN') {
        quizSpec = { optionCount: 3, minCorrectAnswers: 1, maxCorrectAnswers: 1, correctAnswerMode: 'single' };
      } else if (task.answerType === 'SINGLE_CHOICE' || task.answerType === 'CHOICE') {
        quizSpec = { optionCount: task.optionsCount || 3, minCorrectAnswers: 1, maxCorrectAnswers: 1, correctAnswerMode: 'single' };
      } else if (task.answerType === 'MULTIPLE_CHOICE') {
        quizSpec = { optionCount: task.optionsCount || 4, minCorrectAnswers: 1, maxCorrectAnswers: 3, correctAnswerMode: 'multiple' };
      } else if (task.answerType === 'MATCHING') {
        quizSpec = { minCorrectAnswers: 1, maxCorrectAnswers: 1, correctAnswerMode: 'matching', matchingFormat: 'KEY_VALUE' };
      } else {
        quizSpec = { minCorrectAnswers: 1, maxCorrectAnswers: 1, correctAnswerMode: 'text' };
      }
    }

    return {
      taskId,
      skill: cleanSkill,
      teil: task.teil,
      taskType: task.taskType,
      answerType: task.answerType,
      responseMode: task.responseMode,
      allowedFields,
      requiredItemCount: task.itemCount ?? 0,
      minTextLength: cleanSkill === 'LESEN' ? 50 : undefined,
      quiz: quizSpec,
      requiresReadingText: cleanSkill === 'LESEN',
      requiresTranscript: cleanSkill === 'HOEREN',
      requiresSampleSolution: isFreeText,
      requiresRubric: cleanSkill === 'SCHREIBEN',
      requiresSentenceStarters: cleanSkill === 'SPRECHEN',
    };
  }

  static createSkeleton(blueprint: OfficialExamBlueprint, activeSkills: ExamSkill[]): PreparedExamSkeleton {
    const supportedSkills = new Set(blueprint.modules.map((m) => m.skill.toUpperCase()));
    const unsupported = activeSkills.filter((s) => !supportedSkills.has(String(s).toUpperCase() as ExamSkill));

    if (unsupported.length > 0) {
      throw new Error(`Kỳ thi ${blueprint.blueprintId} không hỗ trợ các kỹ năng: ${unsupported.join(', ')}`);
    }

    const activeSkillsUpper = new Set(activeSkills.map((s) => String(s).toUpperCase()));
    const activeModules = blueprint.modules.filter((m) => activeSkillsUpper.has(m.skill.toUpperCase()));
    const skeletonBlocks: SkeletonBlock[] = [];
    
    let totalDuration = 0;
    let totalPoints = 0;

    activeModules.forEach((mod) => {
      const cleanModSkill = String(mod.skill).toUpperCase() as ExamSkill;
      
      if (mod.durationMinutes) {
        totalDuration += mod.durationMinutes;
      }

      mod.tasks.forEach((task, taskIdx) => {
        const taskId = `${blueprint.blueprintId}_${cleanModSkill}_T${task.teil}_TASK_${taskIdx + 1}`
          .replace(/[^A-Z0-9_]/gi, '_')
          .toUpperCase();

        let blockType = 'Lesen';
        if (cleanModSkill === 'SCHREIBEN') blockType = 'Schreiben';
        else if (cleanModSkill === 'HOEREN') blockType = 'Hören';
        else if (cleanModSkill === 'SPRECHEN') blockType = 'Sprechen';
        else if (cleanModSkill === 'SPRACHBAUSTEINE') blockType = 'Quiz';

        if (!mod.durationMinutes) {
          totalDuration += (task.durationMinutes || 0);
        }
        
        totalPoints += (task.rawPoints || 0);

        const contract = this.getTaskContentContract(task, cleanModSkill, taskId);

        skeletonBlocks.push({
          taskId,
          skill: cleanModSkill,
          teil: task.teil,
          type: blockType,
          title: task.title || `Teil ${task.teil}: ${task.taskType}`,
          duration: task.durationMinutes || 0,
          tags: [`🎯 ${blueprint.provider}`, `Niveau ${blueprint.level}`, `${cleanModSkill}`],
          contract,
          data: {
            taskType: task.taskType,
            answerType: task.answerType,
            responseMode: task.responseMode,
            maxPoints: task.rawPoints || 0,
            expectedItemCount: task.itemCount ?? 0,
          },
        });
      });
    });

    this.validateSkeleton(skeletonBlocks);

    return {
      blueprint,
      activeModules,
      totalDurationMinutes: totalDuration,
      totalPoints,
      skeletonBlocks,
    };
  }

  private static validateSkeleton(blocks: SkeletonBlock[]) {
    const seenIds = new Set<string>();
    blocks.forEach((b) => {
      if (seenIds.has(b.taskId)) {
        throw new Error(`Lỗi cấu hình Blueprint: Trùng lặp taskId ${b.taskId}`);
      }
      seenIds.add(b.taskId);
      if (!b.skill || !b.data.taskType || !b.data.answerType || !b.data.responseMode) {
        throw new Error(`Lỗi metadata cốt lõi tại ${b.taskId}`);
      }
    });
  }

  static mergeContentIntoSkeleton(skeleton: PreparedExamSkeleton, aiPayloads: Record<string, any>): any {
    const finalBlocks = skeleton.skeletonBlocks.map((baseBlock) => {
      const cleanSkill = String(baseBlock.skill || '').toUpperCase();
      const aiContent = aiPayloads[baseBlock.taskId] || {};
      const contract = baseBlock.contract;

      const safeAiData = Object.fromEntries(
        Object.entries(aiContent).filter(([key]) => contract.allowedFields.has(key))
      );

      const aiTitle =
        typeof aiContent.title === 'string' && aiContent.title.trim().length > 0
          ? aiContent.title.trim()
          : undefined;

      const mergedData: Record<string, any> = {
        ...safeAiData,
        taskType: baseBlock.data.taskType,
        answerType: baseBlock.data.answerType,
        responseMode: baseBlock.data.responseMode,
        maxPoints: baseBlock.data.maxPoints,
        expectedItemCount: baseBlock.data.expectedItemCount,
      };

      if (['SCHREIBEN', 'SPRECHEN'].includes(cleanSkill)) {
        delete mergedData.quizQuestions;
      }

      return {
        taskId: baseBlock.taskId,
        skill: baseBlock.skill,
        teil: baseBlock.teil,
        type: baseBlock.type,
        duration: baseBlock.duration,
        tags: baseBlock.tags,
        title: aiTitle || baseBlock.title,
        data: mergedData,
      };
    });

    return {
      title: `${skeleton.blueprint.provider} ${skeleton.blueprint.level}`,
      level: skeleton.blueprint.level,
      targetDuration: skeleton.totalDurationMinutes,
      totalPoints: skeleton.totalPoints,
      blocks: finalBlocks,
    };
  }
}