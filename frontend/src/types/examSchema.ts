export type ExamProvider = 'GOETHE' | 'TELC' | 'OESD' | 'TESTDAF';

export type ExamLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'TDN3' | 'TDN4' | 'TDN5';

export type ExamSkill = 'LESEN' | 'HOEREN' | 'SCHREIBEN' | 'SPRECHEN' | 'SPRACHBAUSTEINE';

export type ExamTaskType =
  | 'TEXT_MATCHING'
  | 'HEADLINE_MATCHING'
  | 'MULTIPLE_CHOICE'
  | 'TRUE_FALSE'
  | 'YES_NO'
  | 'GAP_FILL'
  | 'CLOZE'
  | 'SPRACHBAUSTEINE_CLOZE'
  | 'VOCAB_SELECTION'
  | 'SHORT_ANSWER'
  | 'NOTE_COMPLETION'
  | 'ORDERING'
  | 'CATEGORIZATION'
  | 'EMAIL_PERSONAL'
  | 'EMAIL_FORMAL'
  | 'FORUM_COMMENT'
  | 'ARGUMENTATIVE_ESSAY'
  | 'GRAPH_DESCRIPTION'
  | 'DATA_INTERPRETATION'
  | 'SUMMARY'
  | 'SYNTHESIS'
  | 'REPORT'
  | 'SELF_INTRODUCTION'
  | 'PICTURE_DESCRIPTION'
  | 'JOINT_PLANNING'
  | 'PRESENTATION'
  | 'DISCUSSION'
  | 'DEBATE'
  | 'TELEPHONE_CONVERSATION';

export type ExamAnswerType =
  | 'SINGLE_CHOICE'
  | 'MULTIPLE_CHOICE'
  | 'MULTIPLE_SELECT'
  | 'TRUE_FALSE'
  | 'YES_NO'
  | 'MATCHING'
  | 'TEXT_MATCHING'
  | 'GAP_FILL'
  | 'CLOZE'
  | 'SHORT_ANSWER'
  | 'FREE_TEXT'
  | 'ORAL_RESPONSE';

export type ExamResponseMode =
  | 'SELECT'
  | 'INPUT_TEXT'
  | 'DRAG_DROP'
  | 'ORDER'
  | 'LONG_TEXT'
  | 'VOICE';

export type ExamTextGenre =
  | 'EMAIL'
  | 'BRIEF'
  | 'FORUM'
  | 'BLOG'
  | 'ANZEIGE'
  | 'ZEITUNGSARTIKEL'
  | 'INTERVIEW'
  | 'BERICHT'
  | 'KOMMENTAR'
  | 'ESSAY'
  | 'VORTRAG'
  | 'DIALOG'
  | 'HAUSORDNUNG'
  | 'WISSENSCHAFTLICHER_TEXT';

export type ExamDifficulty = 'EASY' | 'STANDARD' | 'HARD';

export interface CEFRGradingRubric {
  taskCompletion: number;
  coherence: number;
  vocabulary: number;
  grammar: number;
  sociolinguisticAppropriateness?: number;
}

export interface MatchingPairItem {
  id: string;
  premise: string;
  correctMatch: string;
}

export interface ExamQuestionItem {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  points?: number;
  distractorTypes?: string[];
}

export interface TeilBlueprint {
  teilNumber: number;
  title: string;
  skill: ExamSkill;
  taskType: ExamTaskType;
  answerType: ExamAnswerType;
  responseMode: ExamResponseMode;
  questionCount: number;
  points: number;
  timeLimitMinutes: number;
  textGenre?: ExamTextGenre;
  instructionsDe: string;
  instructionsVn: string;
  grammarConstraints: string[];
  vocabularyConstraints: string[];
}

export interface OfficialExamBlueprint {
  blueprintId: string;
  provider: ExamProvider;
  level: ExamLevel;
  version: string;
  totalDurationMinutes: number;
  totalPoints: number;
  teils: TeilBlueprint[];
}

export interface ExtendedExamBlockData {
  taskType?: ExamTaskType | string;
  answerType?: ExamAnswerType | string;
  responseMode?: ExamResponseMode | string;
  maxPoints?: number;
  instructions?: string;
  readingText?: string;
  transcript?: string;
  options?: string[];
  matchingPairs?: MatchingPairItem[];
  rubric?: CEFRGradingRubric;
  wordBank?: string[];
  sentenceStarters?: string[];
  questions?: string[];
  quizQuestions?: ExamQuestionItem[];
}