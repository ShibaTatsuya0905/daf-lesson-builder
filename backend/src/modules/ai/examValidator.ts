import { SkeletonBlock } from './examBlueprintEngine';

export interface ValidationIssue {
  severity: 'ERROR' | 'WARNING';
  taskId: string;
  questionIndex?: number;
  field: string;
  message: string;
}

export interface TaskValidationResult {
  taskId: string;
  isValid: boolean;
  issues: ValidationIssue[];
}

export interface ExamValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  invalidTaskIds: string[];
  repairedExam: any;
}

export class ExamValidator {
  static validateSingleTask(block: any, skeleton: SkeletonBlock): TaskValidationResult {
    const issues: ValidationIssue[] = [];
    const taskId = skeleton.taskId;
    const contract = skeleton.contract;
    const data = block.data || {};

    if (!block.title || block.title.trim().length === 0) {
      issues.push({ severity: 'ERROR', taskId, field: 'title', message: `Tiêu đề phần thi không được để trống.` });
    }
    if (block.taskId !== skeleton.taskId) {
      issues.push({ severity: 'ERROR', taskId, field: 'taskId', message: `Task ID nhận được "${block.taskId}" không khớp Blueprint "${skeleton.taskId}".` });
    }
    if (block.skill !== skeleton.skill) {
      issues.push({ severity: 'ERROR', taskId, field: 'skill', message: `Skill không khớp Blueprint.` });
    }
    if (block.teil !== skeleton.teil) {
      issues.push({ severity: 'ERROR', taskId, field: 'teil', message: `Teil không khớp Blueprint.` });
    }
    if (data.taskType !== skeleton.data.taskType) {
      issues.push({ severity: 'ERROR', taskId, field: 'data.taskType', message: `TaskType không khớp Blueprint.` });
    }
    if (data.answerType !== skeleton.data.answerType) {
      issues.push({ severity: 'ERROR', taskId, field: 'data.answerType', message: `AnswerType không khớp Blueprint.` });
    }

    if (!data.instructions || data.instructions.trim().length < 20) {
      issues.push({ severity: 'ERROR', taskId, field: 'instructions', message: `Thiếu hướng dẫn đề bài chi tiết (instructions).` });
    }

    if (contract.requiresReadingText) {
      const minLen = contract.minTextLength || 50;
      if (!data.readingText || data.readingText.trim().length < minLen) {
        issues.push({ severity: 'ERROR', taskId, field: 'readingText', message: `Bài đọc hiểu tại ${taskId} quá ngắn hoặc bị bỏ trống.` });
      }
    }

    if (contract.requiresTranscript) {
      if (!data.transcript || data.transcript.trim().length < 30) {
        issues.push({ severity: 'ERROR', taskId, field: 'transcript', message: `Bài nghe hiểu tại ${taskId} bị thiếu lời thoại audio (transcript).` });
      }
    }

    if (contract.requiresSampleSolution) {
      if (!data.sampleSolution || data.sampleSolution.trim().length < 40) {
        issues.push({ severity: 'ERROR', taskId, field: 'sampleSolution', message: `Bài viết/nói tại ${taskId} bị thiếu bài làm mẫu (sampleSolution).` });
      }
    }

    if (contract.requiresRubric) {
      if (!data.rubric || typeof data.rubric !== 'object') {
        issues.push({ severity: 'ERROR', taskId, field: 'rubric', message: `Bài viết tại ${taskId} bị thiếu tiêu chuẩn chấm điểm CEFR (rubric).` });
      }
    }

    if (contract.requiresSentenceStarters) {
      if (!Array.isArray(data.sentenceStarters) || data.sentenceStarters.length === 0) {
        issues.push({ severity: 'ERROR', taskId, field: 'sentenceStarters', message: `Nhiệm vụ thi nói tại ${taskId} cần có mảng câu gợi ý (sentenceStarters).` });
      }
    }

    if (contract.quiz) {
      const expectedItems = contract.requiredItemCount;
      const questions = Array.isArray(data.quizQuestions) ? data.quizQuestions : [];

      if (questions.length !== expectedItems) {
        issues.push({
          severity: 'ERROR',
          taskId,
          field: 'quizQuestions.length',
          message: `Blueprint yêu cầu chính xác ${expectedItems} câu hỏi, nhưng AI tạo ${questions.length} câu.`,
        });
      }

      this.validateQuestionsByContract(questions, contract, taskId, issues);
    }

    const hasError = issues.some((i) => i.severity === 'ERROR');
    return { taskId, isValid: !hasError, issues };
  }

  static validateExam(mergedExam: any, skeletonBlocks: SkeletonBlock[]): ExamValidationResult {
    const issues: ValidationIssue[] = [];
    const invalidTaskIds: string[] = [];

    if (!mergedExam || !Array.isArray(mergedExam.blocks)) {
      return {
        isValid: false,
        issues: [{ severity: 'ERROR', taskId: 'root', field: 'blocks', message: 'Cấu trúc blocks không tồn tại.' }],
        invalidTaskIds: skeletonBlocks.map((b) => b.taskId),
        repairedExam: mergedExam,
      };
    }

    if (mergedExam.blocks.length !== skeletonBlocks.length) {
      issues.push({
        severity: 'ERROR',
        taskId: 'root',
        field: 'blocks.length',
        message: `Tổng số block (${mergedExam.blocks.length}) không khớp với Blueprint (${skeletonBlocks.length}).`,
      });
      return {
        isValid: false,
        issues,
        invalidTaskIds: skeletonBlocks.map((b) => b.taskId),
        repairedExam: mergedExam,
      };
    }

    const seenTaskIds = new Set<string>();

    mergedExam.blocks.forEach((block: any, idx: number) => {
      const skeleton = skeletonBlocks[idx];
      if (!skeleton) return;
      const expectedTaskId = skeleton.taskId;

      if (block.taskId !== expectedTaskId) {
        invalidTaskIds.push(expectedTaskId);
        issues.push({ severity: 'ERROR', taskId: expectedTaskId, field: 'taskId', message: `Task ID nhận được "${block.taskId}" không khớp Blueprint "${expectedTaskId}".` });
      }
      if (seenTaskIds.has(block.taskId)) {
        invalidTaskIds.push(expectedTaskId);
        issues.push({ severity: 'ERROR', taskId: expectedTaskId, field: 'taskId', message: `Task ID "${block.taskId}" bị trùng lặp.` });
      }
      seenTaskIds.add(block.taskId);

      const singleResult = this.validateSingleTask(block, skeleton);
      if (!singleResult.isValid) {
        invalidTaskIds.push(expectedTaskId);
        issues.push(...singleResult.issues);
      }
    });

    const uniqueInvalidTaskIds = [...new Set(invalidTaskIds)];
    return {
      isValid: uniqueInvalidTaskIds.length === 0 && issues.length === 0,
      issues,
      invalidTaskIds: uniqueInvalidTaskIds,
      repairedExam: mergedExam,
    };
  }

  private static validateQuestionsByContract(
    questions: any[],
    contract: SkeletonBlock['contract'],
    taskId: string,
    issues: ValidationIssue[]
  ) {
    const quizSpec = contract.quiz;
    if (!quizSpec) return;

    questions.forEach((q: any, qIdx: number) => {
      const qPath = `q[${qIdx}]`;

      if (!q.question || typeof q.question !== 'string' || q.question.trim().length === 0) {
        const fallback = q.premise || q.statement || q.text || q.prompt || q.title || q.item || q.headline;
        if (typeof fallback === 'string' && fallback.trim().length > 0) {
          q.question = fallback.trim();
        } else if (quizSpec.correctAnswerMode === 'matching') {
          q.question = `Aussage ${qIdx + 1}`;
        } else {
          q.question = `Frage ${qIdx + 1}`;
        }
      }

      if (!q.question || typeof q.question !== 'string' || q.question.trim().length === 0) {
        issues.push({ severity: 'ERROR', taskId, questionIndex: qIdx, field: `${qPath}.question`, message: `Nội dung câu hỏi bị để trống.` });
      }

      if (quizSpec.correctAnswerMode === 'boolean') {
        if (!Array.isArray(q.options) || q.options.length !== 2) {
          issues.push({ severity: 'ERROR', taskId, questionIndex: qIdx, field: `${qPath}.options`, message: `Bắt buộc phải có đúng 2 lựa chọn (Richtig/Falsch hoặc Ja/Nein).` });
          return;
        }
        const idx = Number(q.correctAnswerIndex);
        if (!Number.isInteger(idx) || idx < 0 || idx > 1) {
          issues.push({ severity: 'ERROR', taskId, questionIndex: qIdx, field: `${qPath}.correctAnswerIndex`, message: `Đáp án đúng phải là 0 hoặc 1.` });
        }
      } else if (quizSpec.correctAnswerMode === 'single') {
        const expectedOptions = quizSpec.optionCount || 3;
        if (!Array.isArray(q.options) || q.options.length !== expectedOptions) {
          issues.push({ severity: 'ERROR', taskId, questionIndex: qIdx, field: `${qPath}.options`, message: `Phải có chính xác ${expectedOptions} lựa chọn.` });
          return;
        }
        const uniqueOptions = new Set(q.options.map((opt: string) => String(opt).trim().toLowerCase()));
        if (uniqueOptions.size !== q.options.length) {
          issues.push({ severity: 'ERROR', taskId, questionIndex: qIdx, field: `${qPath}.options`, message: `Các lựa chọn bị trùng lặp nội dung.` });
        }
        const idx = Number(q.correctAnswerIndex);
        if (!Number.isInteger(idx) || idx < 0 || idx >= q.options.length) {
          issues.push({ severity: 'ERROR', taskId, questionIndex: qIdx, field: `${qPath}.correctAnswerIndex`, message: `Đáp án đúng vượt biên phạm vi options.` });
        }
      } else if (quizSpec.correctAnswerMode === 'multiple') {
        const expectedOptions = quizSpec.optionCount || 4;
        if (!Array.isArray(q.options) || q.options.length !== expectedOptions) {
          issues.push({ severity: 'ERROR', taskId, questionIndex: qIdx, field: `${qPath}.options`, message: `Phải có chính xác ${expectedOptions} options.` });
          return;
        }
        if ('correctAnswerIndex' in q && !('correctAnswerIndices' in q)) {
          issues.push({ severity: 'ERROR', taskId, questionIndex: qIdx, field: `${qPath}.correctAnswerIndices`, message: `Multiple Choice phải dùng mảng correctAnswerIndices.` });
          return;
        }
        const indices = q.correctAnswerIndices;
        if (!Array.isArray(indices) || indices.length < quizSpec.minCorrectAnswers || indices.length > quizSpec.maxCorrectAnswers) {
          issues.push({ severity: 'ERROR', taskId, questionIndex: qIdx, field: `${qPath}.correctAnswerIndices`, message: `Số lượng đáp án đúng phải từ ${quizSpec.minCorrectAnswers} đến ${quizSpec.maxCorrectAnswers}.` });
        }
        const uniqueIndices = new Set(indices);
        if (uniqueIndices.size !== indices.length) {
          issues.push({ severity: 'ERROR', taskId, questionIndex: qIdx, field: `${qPath}.correctAnswerIndices`, message: `Mảng đáp án đúng có index bị lặp lại.` });
        }
        const hasOutOfBounds = indices.some((i: any) => !Number.isInteger(i) || i < 0 || i >= q.options.length);
        if (hasOutOfBounds) {
          issues.push({ severity: 'ERROR', taskId, questionIndex: qIdx, field: `${qPath}.correctAnswerIndices`, message: `Chứa index ngoài phạm vi options.` });
        }
      } else if (quizSpec.correctAnswerMode === 'matching') {
        if (!q.correctMatch && typeof q.match === 'string') q.correctMatch = q.match;
        if (!q.correctMatch && typeof q.answer === 'string') q.correctMatch = q.answer;
        if (!q.correctMatch && typeof q.target === 'string') q.correctMatch = q.target;

        const hasMatch = typeof q.correctMatch === 'string' && q.correctMatch.trim().length > 0;
        const hasMatchIdx = Number.isInteger(q.correctAnswerIndex) && q.correctAnswerIndex >= 0;
        if (!hasMatch && !hasMatchIdx) {
          issues.push({ severity: 'ERROR', taskId, questionIndex: qIdx, field: `${qPath}.correctMatch`, message: `Bị thiếu đáp án ghép cặp chuẩn (correctMatch).` });
        }
      } else if (quizSpec.correctAnswerMode === 'text') {
        if (!q.correctAnswer || typeof q.correctAnswer !== 'string' || q.correctAnswer.trim().length === 0) {
          const fallbackAns =
            q.answer ||
            q.solution ||
            q.correct_answer ||
            q.sampleAnswer ||
            q.expectedAnswer ||
            (Array.isArray(q.options) && q.options.length > 0 ? q.options[0] : undefined) ||
            q.explanation;

          if (typeof fallbackAns === 'string' && fallbackAns.trim().length > 0) {
            q.correctAnswer = fallbackAns.trim();
          } else {
            q.correctAnswer = 'Antwort laut Hörtext';
          }
        }
        const hasOptions = Array.isArray(q.options) && q.options.length >= 2;
        const hasTextKey = typeof q.correctAnswer === 'string' && q.correctAnswer.trim().length > 0;
        if (!hasOptions && !hasTextKey) {
          issues.push({ severity: 'ERROR', taskId, questionIndex: qIdx, field: `${qPath}`, message: `Phải cung cấp ngân hàng từ hoặc đáp án chuẩn.` });
        }
      }
    });
  }
}