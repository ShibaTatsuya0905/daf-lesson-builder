export type ExamProvider = 'GOETHE' | 'TELC' | 'OESD' | 'TESTDAF';

export type ExamLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'TDN3' | 'TDN4' | 'TDN5';

export type ExamSkill = 'LESEN' | 'HOEREN' | 'SCHREIBEN' | 'SPRECHEN' | 'SPRACHBAUSTEINE';

export type ExamMode = 'PAPER' | 'DIGITAL';

export type TaskType =
  | 'MULTIPLE_CHOICE'
  | 'SINGLE_CHOICE'
  | 'TRUE_FALSE'
  | 'YES_NO'
  | 'TRUE_FALSE_NOT_GIVEN'
  | 'MATCHING'
  | 'ADVERTISEMENT_MATCHING'
  | 'HEADLINE_MATCHING'
  | 'FORUM_MATCHING'
  | 'TEXT_MATCHING'
  | 'CLOZE'
  | 'TEXT_RECONSTRUCTION'
  | 'SHORT_ANSWER'
  | 'FORM_FILLING'
  | 'EMAIL_PERSONAL'
  | 'EMAIL_FORMAL'
  | 'LETTER'
  | 'FORUM_POST'
  | 'FORUM_COMMENT'
  | 'ARGUMENTATION'
  | 'ARGUMENTATIVE_ESSAY'
  | 'GRAPH_DESCRIPTION'
  | 'GRAPH_DESCRIPTION_AND_ARGUMENTATION'
  | 'DATA_INTERPRETATION'
  | 'PRESENTATION'
  | 'DISCUSSION'
  | 'ROLE_PLAY'
  | 'JOINT_PLANNING'
  | 'PICTURE_DESCRIPTION'
  | 'SELF_INTRODUCTION'
  | 'SPRACHBAUSTEINE_CLOZE';

export type AnswerType =
  | 'CHOICE'
  | 'SINGLE_CHOICE'
  | 'MULTIPLE_CHOICE'
  | 'TRUE_FALSE'
  | 'YES_NO'
  | 'NOT_GIVEN'
  | 'MATCHING'
  | 'CLOZE'
  | 'SHORT_TEXT'
  | 'SHORT_ANSWER'
  | 'LONG_TEXT'
  | 'FREE_TEXT'
  | 'SPEAKING'
  | 'ORAL_RESPONSE';

export type ResponseMode = 'SELECT' | 'INPUT_TEXT' | 'DRAG_DROP' | 'ORDER' | 'LONG_TEXT' | 'VOICE';

export interface ExamContentSpec {
  topicCategory: string;
  context: string;
  textGenre: string;
  grammarFocus?: string[];
  vocabularyFocus?: string[];
  cefrLevel: ExamLevel;
  difficulty?: 'EASY' | 'STANDARD' | 'HARD';
}

export interface ExamScoringSpec {
  method: 'objective' | 'rubric';
  rawPoints?: number;
  pointsPerItem?: number;
  humanEvaluation: boolean;
  criteria?: string[];
  conversionRequired?: boolean;
  conversionMethod?: string;
}

export interface GenerationRules {
  mustFollowOfficialStructure: boolean;
  fixedItemCount: boolean;
  fixedTaskType: boolean;
  fixedAnswerType: boolean;
  allowExtraItems: boolean;
  allowExtraOptions: boolean;
  requireEvidenceFromSource: boolean;
  topicConstraints?: string[];
  languageConstraints?: string[];
  forbiddenPatterns?: string[];
  instructions: string[];
}

export interface TaskBlueprint {
  teil: number;
  unit: 'ITEM' | 'TASK';
  title?: string;
  taskType: TaskType;
  itemCount: number;
  answerType: AnswerType;
  responseMode: ResponseMode;
  textCount?: number;
  audioReplay?: number;
  optionsCount?: number;
  preparationMinutes?: number;
  responseMinutes?: number;
  durationMinutes?: number;
  requiresAudio?: boolean;
  requiresImage?: boolean;
  requiresGraph?: boolean;
  requiresInputText?: boolean;
  rawPoints?: number;
  content: ExamContentSpec;
  scoring: ExamScoringSpec;
  generationRules: GenerationRules;
}

export interface ExamModuleBlueprint {
  moduleId: string;
  skill: ExamSkill;
  durationMinutes?: number;
  totalItems?: number;
  totalRawPoints?: number;
  tasks: TaskBlueprint[];
}

export interface OfficialExamBlueprint {
  blueprintId: string;
  provider: ExamProvider;
  level: ExamLevel;
  version: string;
  paperOrDigital: ExamMode;
  metadata?: Record<string, unknown>;
  modules: ExamModuleBlueprint[];
}

export interface ExtendedExamBlockData {
  taskType?: TaskType | string;
  answerType?: AnswerType | string;
  responseMode?: ResponseMode | string;
  maxPoints?: number;
  instructions?: string;
  readingText?: string;
  transcript?: string;
  options?: string[];
  sampleSolution?: string;
  rubric?: any;
  wordBank?: string[];
  sentenceStarters?: string[];
  questions?: string[];
  quizQuestions?: any[];
}