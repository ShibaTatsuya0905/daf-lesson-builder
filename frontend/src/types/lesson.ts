export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type SocialForm = 'PLENUM' | 'PARTNERARBEIT' | 'GRUPPENARBEIT' | 'EINZELARBEIT';
export type ArticleType = 'der' | 'die' | 'das' | '-';
export type ViewMode = 'teacher' | 'student' | 'preview';
export type SaveStatus = 'saved' | 'saving' | 'unsaved';

export interface VocabularyWord {
  id: string;
  german: string;
  translation: string;
  article: ArticleType;
  plural: string;
  example: string;
}

export interface QuizQuestionItem {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation?: string;
}

export interface FlashcardItem {
  id: string;
  front: string;
  back: string;
  hint?: string;
}

export interface BlockContentData {
  instructions?: string;
  teacherNotes?: string;
  socialForm?: SocialForm;
  materials?: string;
  goal?: string;
  questions?: string[];
  sentenceStarters?: string[];
  readingText?: string;
  audioUrl?: string;
  transcript?: string;
  wordBank?: string[];
  vocabulary?: VocabularyWord[];
  quizQuestions?: QuizQuestionItem[];
  flashcards?: FlashcardItem[];
}

export interface Block {
  id: string;
  type: string;
  title: string;
  content: string;
  duration: number;
  isCollapsed?: boolean;
  tags?: string[];
  description?: string;
  data?: BlockContentData;
}

export interface LessonInfo {
  id?: string;
  title: string;
  topic: string;
  level: CEFRLevel;
  objectives: string;
  targetDuration: number;
  createdAt?: string;
}

export interface ActivityTemplateOption {
  type: string;
  title: string;
  description: string;
  category: string;
  defaultDuration: number;
  tags: string[];
  initialContent?: string;
  initialData?: BlockContentData;
}

export interface LessonTemplate {
  id: string;
  name: string;
  description: string;
  level: CEFRLevel;
  duration: number;
  icon: string;
  defaultTopic: string;
  blocks: Omit<Block, 'id'>[];
}

export interface BookModel {
  id: string;
  title: string;
  publisher: string;
  level: string;
  coverUrl?: string;
}

export interface LektionModel {
  id: string;
  bookId: string;
  lektionNumber: number;
  title: string;
  theme?: string;
  contents?: LektionContentModel[];
}

export interface LektionContentModel {
  id: string;
  lektionId: string;
  type: string;
  data: any;
}