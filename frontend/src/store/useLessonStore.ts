import { create } from 'zustand';
import { arrayMove } from '@dnd-kit/sortable';
import { apiRequest } from '../services/apiClient';
import {
  Block,
  BlockContentData,
  LessonInfo,
  LessonTemplate,
  SaveStatus,
  ViewMode,
  QuizQuestionItem,
  FlashcardItem,
} from '../types/lesson';
import { aiService } from '../services/aiService';

export type { Block };

export const LESSON_TEMPLATES: LessonTemplate[] = [
  {
    id: 'tpl-a1-standard',
    name: '🇩🇪 A1 Standardlektion (Freizeit & Hobbys)',
    description: 'Cấu trúc bài giảng 45 phút chuẩn: Khởi động, Từ vựng, Hội thoại cặp, Trắc nghiệm.',
    level: 'A1',
    duration: 45,
    icon: '📚',
    defaultTopic: 'Freizeit & Hobbys',
    blocks: [
      {
        type: 'Einstieg',
        title: '01 Einstieg & Aktivierung',
        content: '',
        duration: 5,
        isCollapsed: false,
        tags: ['💬 Frage', '👥 Plenum'],
        data: {
          socialForm: 'PLENUM',
          instructions: '<p>Zeige Bilder zu Hobbys und frage die Schüler: <em>"Was machst du am Wochenende gern?"</em></p>',
          teacherNotes: 'Tập trung tạo không khí cởi mở, không bắt bẻ lỗi ngữ pháp ngay lúc này.',
          questions: ['Was machst du am Samstag gern?', 'Spielst du gern Fußball?'],
          materials: 'Bildkarten, Beamer',
        },
      },
      {
        type: 'Wortschatz',
        title: '02 Neuer Wortschatz: Hobbys',
        content: '',
        duration: 12,
        isCollapsed: false,
        tags: ['📚 Wortschatz', '🎯 Vokabeln'],
        data: {
          instructions: '<p>Giới thiệu từ vựng mới về sở thích kèm mạo từ der/die/das:</p>',
          vocabulary: [
            { id: 'v1', article: 'das', german: 'Hobby', translation: 'sở thích', plural: 'Hobbys', example: 'Mein Hobby ist Schwimmen.' },
            { id: 'v2', article: '-', german: 'Fußball spielen', translation: 'chơi bóng đá', plural: '-', example: 'Ich spiele jeden Sonntag Fußball.' },
            { id: 'v3', article: '-', german: 'schwimmen gehen', translation: 'đi bơi', plural: '-', example: 'Wir gehen im Sommer schwimmen.' },
            { id: 'v4', article: 'die', german: 'Gitarre', translation: 'đàn ghi-ta', plural: 'Gitarren', example: 'Er spielt fantastisch Gitarre.' },
            { id: 'v5', article: 'das', german: 'Buch', translation: 'quyển sách', plural: 'Bücher', example: 'Ich lese gern Bücher.' },
          ],
        },
      },
      {
        type: 'Sprechen',
        title: '03 Partnerinterview: Was machst du gern?',
        content: '',
        duration: 15,
        isCollapsed: false,
        tags: ['🗣 Sprechen', '👥 Partnerarbeit'],
        data: {
          socialForm: 'PARTNERARBEIT',
          goal: 'Học viên đối thoại tự nhiên, hỏi và trả lời về hoạt động yêu thích.',
          instructions: '<p>Học viên làm việc theo cặp 2 người, luân phiên hỏi và ghi lại câu trả lời của bạn.</p>',
          sentenceStarters: [
            'Was machst du gern in der Freizeit?',
            'Ich spiele gern...',
            'Und wie oft machst du das?',
            'Ich mache das jeden Tag / am Wochenende.',
          ],
          questions: ['Spielst du auch ein Instrument?', 'Liest du gern Bücher?'],
        },
      },
      {
        type: 'Quiz',
        title: '04 Exit Ticket: Schnelltest',
        content: '',
        duration: 8,
        isCollapsed: false,
        tags: ['🎯 Quiz', '⏱ Schnelltest'],
        data: {
          quizQuestions: [
            {
              id: 'q1',
              question: 'Welcher Artikel gehört zu "Hobby"?',
              options: ['der', 'die', 'das'],
              correctAnswerIndex: 2,
              explanation: 'Es heißt: das Hobby, die Hobbys.',
            },
            {
              id: 'q2',
              question: 'Welches Verb passt: "... Gitarre"?',
              options: ['machen', 'spielen', 'gehen'],
              correctAnswerIndex: 1,
              explanation: 'Động từ đi kèm nhạc cụ luôn là "spielen" (Gitarre spielen).',
            },
          ],
        },
      },
      {
        type: 'Text',
        title: '05 Hausaufgabe & Abschluss',
        content: '<p><strong>Hausaufgabe:</strong> Schreibe 3 Sätze über deine Hobbys ins Übungsheft (Viết 3 câu về sở thích cá nhân vào vở bài tập).</p>',
        duration: 5,
        isCollapsed: false,
        tags: ['📝 Hausaufgabe'],
      },
    ],
  },
  {
    id: 'tpl-a2-leseverstehen',
    name: '🇩🇪 A2 Leseverstehen & Diskussion',
    description: 'Giáo án rèn kỹ năng Đọc hiểu văn bản, Khai thác từ mới và Thảo luận nhóm (60 phút).',
    level: 'A2',
    duration: 60,
    icon: '📖',
    defaultTopic: 'Reisen & Urlaub',
    blocks: [
      {
        type: 'Einstieg',
        title: '01 Assoziogramm: Urlaub',
        content: '',
        duration: 8,
        isCollapsed: false,
        tags: ['💬 Brainstorming', '👥 Plenum'],
        data: {
          socialForm: 'PLENUM',
          instructions: '<p>Viết từ "Urlaub" lên bảng, học sinh kể nhanh các từ liên quan (Strand, Hotel, Berge...).</p>',
          materials: 'Tafel, Marker',
        },
      },
      {
        type: 'Lesen',
        title: '02 Lesetext: Mein Traumurlaub',
        content: '',
        duration: 20,
        isCollapsed: false,
        tags: ['📖 Lesen', '❓ Fragen'],
        data: {
          readingText: '<p><strong>Mein letzter Urlaub in den Bergen</strong></p><p>Letztes Jahr bin ich mit meiner Familie nach Österreich gefahren. Wir haben in einem kleinen Hotel übernachtet. Jeden Tag sind wir gewandert und haben die frische Luft genossen. Das Essen war köstlich und die Menschen waren sehr gastfreundlich.</p>',
          questions: [
            'Wohin ist der Autor letztes Jahr gefahren?',
            'Wo hat die Familie übernachtet?',
            'Was haben sie jeden Tag gemacht?',
          ],
        },
      },
      {
        type: 'Wortschatz',
        title: '03 Schlüsselbegriffe aus dem Text',
        content: '',
        duration: 12,
        isCollapsed: false,
        tags: ['📚 Wortschatz'],
        data: {
          vocabulary: [
            { id: 'v1', article: 'die', german: 'Berge', translation: 'vùng núi', plural: '-', example: 'Wir fahren in die Berge.' },
            { id: 'v2', article: 'das', german: 'Hotel', translation: 'khách sạn', plural: 'Hotels', example: 'Das Hotel ist sehr modern.' },
            { id: 'v3', article: '-', german: 'wandern', translation: 'đi bộ đường dài leo núi', plural: '-', example: 'Sie wandern im Wald.' },
          ],
        },
      },
      {
        type: 'Sprechen',
        title: '04 Diskussion: Meer oder Berge?',
        content: '',
        duration: 20,
        isCollapsed: false,
        tags: ['🗣 Sprechen', '👥 Kiến tập'],
        data: {
          socialForm: 'GRUPPENARBEIT',
          instructions: '<p>Thảo luận nhóm 4 người: Bạn thích đi biển hay đi núi hơn? Tại sao?</p>',
          sentenceStarters: [
            'Ich fahre lieber ans Meer / in die Berge, weil...',
            'Meiner Meinung nach ist...',
            'Im Urlaub möchte ich am liebsten...',
          ],
        },
      },
    ],
  },
];

interface LessonStore {
  lessonInfo: LessonInfo;
  blocks: Block[];
  templates: LessonTemplate[];
  myLessons: LessonInfo[];
  viewMode: ViewMode;
  saveStatus: SaveStatus;
  theme: 'light' | 'dark';
  audioSpeed: number;
  fontSize: 'normal' | 'medium' | 'large';

  isSidebarOpen: boolean;
  isQuickToolbarOpen: boolean;
  isAddActivityModalOpen: boolean;
  isTemplateModalOpen: boolean;
  isAIModalOpen: boolean;
  isExportModalOpen: boolean;
  isSmartBookModalOpen: boolean;
  isPdfScannerModalOpen: boolean;
  isAdminViewOpen: boolean;
  isExamModalOpen: boolean;
  isSpeakingModalOpen: boolean;
  isSettingsModalOpen: boolean;
  isPdfCutterModalOpen: boolean;

  history: { lessonInfo: LessonInfo; blocks: Block[] }[];
  historyIndex: number;

  setViewMode: (mode: ViewMode) => void;
  toggleTheme: () => void;
  setAudioSpeed: (speed: number) => void;
  setFontSize: (size: 'normal' | 'medium' | 'large') => void;

  toggleSidebar: () => void;
  toggleQuickToolbar: () => void;
  openAddActivityModal: () => void;
  closeAddActivityModal: () => void;
  openTemplateModal: () => void;
  closeTemplateModal: () => void;
  openAIModal: () => void;
  closeAIModal: () => void;
  openExportModal: () => void;
  closeExportModal: () => void;
  openSmartBookModal: () => void;
  closeSmartBookModal: () => void;
  openPdfScannerModal: () => void; 
  closePdfScannerModal: () => void;
  toggleAdminView: (open?: boolean) => void;
  openExamModal: () => void;
  closeExamModal: () => void;
  openSpeakingModal: () => void;
  closeSpeakingModal: () => void;
  openSettingsModal: () => void;
  closeSettingsModal: () => void;
  openPdfCutterModal: () => void;
  closePdfCutterModal: () => void;

  updateLessonInfo: (fields: Partial<LessonInfo>) => void;
  addBlock: (type: string, title?: string, duration?: number, initialContent?: string, tags?: string[], initialData?: BlockContentData) => void;
  updateBlockContent: (id: string, content: string) => void;
  updateBlockTitle: (id: string, title: string) => void;
  updateBlockDuration: (id: string, duration: number) => void;
  updateBlockData: (id: string, patch: Partial<BlockContentData>) => void;
  deleteBlock: (id: string) => void;
  duplicateBlock: (id: string) => void;
  toggleBlockCollapse: (id: string) => void;
  reorderBlocks: (activeId: string, overId: string) => void;

  generateFlashcardsFromVocab: (sourceBlockId: string) => void;
  generateQuizFromVocab: (sourceBlockId: string) => void;
  generateSpeakingFromVocab: (sourceBlockId: string) => void;
  enrichVocabWithAI: (sourceBlockId: string) => Promise<void>;

  applyTemplate: (templateId: string, customTopic?: string) => void;
  createEmptyLesson: () => void;
  importFromBook: (lektionId: string) => Promise<void>;

  fetchMyLessons: () => Promise<void>;
  loadLessonById: (id: string) => Promise<void>;
  deleteLessonFromCloud: (id: string) => Promise<void>;

  undo: () => void;
  redo: () => void;
  triggerAutosave: () => void;
}

const DEFAULT_LESSON_INFO: LessonInfo = {
  title: 'Neue Lektion',
  topic: '',
  level: 'A1',
  objectives: '',
  targetDuration: 45,
};

export const useLessonStore = create<LessonStore>((set, get) => {
  const pushHistoryAndSave = (lessonInfo: LessonInfo, blocks: Block[]) => {
    const { history, historyIndex } = get();
    const updatedHistory = history.slice(0, historyIndex + 1);
    updatedHistory.push({
      lessonInfo: JSON.parse(JSON.stringify(lessonInfo)),
      blocks: JSON.parse(JSON.stringify(blocks)),
    });
    if (updatedHistory.length > 30) updatedHistory.shift();

    set({
      lessonInfo,
      blocks,
      history: updatedHistory,
      historyIndex: updatedHistory.length - 1,
      saveStatus: 'unsaved',
    });

    if ((window as any).__dafAutosaveTimer) {
      clearTimeout((window as any).__dafAutosaveTimer);
    }
    (window as any).__dafAutosaveTimer = setTimeout(() => {
      get().triggerAutosave();
    }, 1500);
  };

  const initialTheme = (localStorage.getItem('daf_theme') as 'light' | 'dark') || 'light';
  const initialSpeed = Number(localStorage.getItem('daf_audio_speed')) || 0.9;
  const initialFontSize = (localStorage.getItem('daf_font_size') as 'normal' | 'medium' | 'large') || 'normal';

  return {
    lessonInfo: DEFAULT_LESSON_INFO,
    blocks: [],
    templates: LESSON_TEMPLATES,
    myLessons: [],
    viewMode: 'teacher',
    saveStatus: 'saved',
    theme: initialTheme,
    audioSpeed: initialSpeed,
    fontSize: initialFontSize,

    isSidebarOpen: true,
    isQuickToolbarOpen: true,
    isAddActivityModalOpen: false,
    isTemplateModalOpen: false,
    isAIModalOpen: false,
    isExportModalOpen: false,
    isSmartBookModalOpen: false,
    isPdfScannerModalOpen: false,
    isAdminViewOpen: false,
    isExamModalOpen: false,
    isSpeakingModalOpen: false,
    isSettingsModalOpen: false,
    isPdfCutterModalOpen: false,

    history: [{ lessonInfo: DEFAULT_LESSON_INFO, blocks: [] }],
    historyIndex: 0,

    setViewMode: (viewMode) => set({ viewMode }),

    toggleTheme: () => {
      const current = get().theme;
      const next = current === 'light' ? 'dark' : 'light';
      localStorage.setItem('daf_theme', next);
      if (next === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      set({ theme: next });
    },

    setAudioSpeed: (speed) => {
      localStorage.setItem('daf_audio_speed', String(speed));
      set({ audioSpeed: speed });
    },

    setFontSize: (size) => {
      localStorage.setItem('daf_font_size', size);
      if (size === 'large') {
        document.documentElement.classList.add('font-size-large');
        document.documentElement.classList.remove('font-size-medium');
      } else if (size === 'medium') {
        document.documentElement.classList.add('font-size-medium');
        document.documentElement.classList.remove('font-size-large');
      } else {
        document.documentElement.classList.remove('font-size-large', 'font-size-medium');
      }
      set({ fontSize: size });
    },

    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    toggleQuickToolbar: () => set((state) => ({ isQuickToolbarOpen: !state.isQuickToolbarOpen })),
    openAddActivityModal: () => set({ isAddActivityModalOpen: true }),
    closeAddActivityModal: () => set({ isAddActivityModalOpen: false }),
    openTemplateModal: () => set({ isTemplateModalOpen: true }),
    closeTemplateModal: () => set({ isTemplateModalOpen: false }),
    openAIModal: () => set({ isAIModalOpen: true }),
    closeAIModal: () => set({ isAIModalOpen: false }),
    openExportModal: () => set({ isExportModalOpen: true }),
    closeExportModal: () => set({ isExportModalOpen: false }),
    openSmartBookModal: () => set({ isSmartBookModalOpen: true }),
    closeSmartBookModal: () => set({ isSmartBookModalOpen: false }),
    openPdfScannerModal: () => set({ isPdfScannerModalOpen: true }), 
    closePdfScannerModal: () => set({ isPdfScannerModalOpen: false }),
    toggleAdminView: (open) => set((state) => ({ isAdminViewOpen: open !== undefined ? open : !state.isAdminViewOpen })),
    openExamModal: () => set({ isExamModalOpen: true }),
    closeExamModal: () => set({ isExamModalOpen: false }),
    openSpeakingModal: () => set({ isSpeakingModalOpen: true }),
    closeSpeakingModal: () => set({ isSpeakingModalOpen: false }),
    openSettingsModal: () => set({ isSettingsModalOpen: true }),
    closeSettingsModal: () => set({ isSettingsModalOpen: false }),
    openPdfCutterModal: () => set({ isPdfCutterModalOpen: true }),
    closePdfCutterModal: () => set({ isPdfCutterModalOpen: false }),

    updateLessonInfo: (fields) => {
      const updated = { ...get().lessonInfo, ...fields };
      pushHistoryAndSave(updated, get().blocks);
    },

    addBlock: (type, customTitle, duration, initialContent = '', tags = [], initialData) => {
      const { blocks, lessonInfo } = get();
      const count = blocks.filter((b) => b.type.toLowerCase() === type.toLowerCase()).length + 1;
      const newBlock: Block = {
        id: `block-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        type,
        title: customTitle || `${type} ${count > 1 ? `(${count})` : ''}`.trim(),
        content: initialContent,
        duration: duration || 10,
        isCollapsed: false,
        tags: tags.length > 0 ? tags : [`📌 ${type}`],
        data: initialData || {},
      };
      pushHistoryAndSave(lessonInfo, [...blocks, newBlock]);
    },

    updateBlockContent: (id, content) => {
      const { blocks, lessonInfo } = get();
      const updated = blocks.map((b) => (b.id === id ? { ...b, content } : b));
      pushHistoryAndSave(lessonInfo, updated);
    },

    updateBlockTitle: (id, title) => {
      const { blocks, lessonInfo } = get();
      const updated = blocks.map((b) => (b.id === id ? { ...b, title } : b));
      pushHistoryAndSave(lessonInfo, updated);
    },

    updateBlockDuration: (id, duration) => {
      const { blocks, lessonInfo } = get();
      const updated = blocks.map((b) => (b.id === id ? { ...b, duration } : b));
      pushHistoryAndSave(lessonInfo, updated);
    },

    updateBlockData: (id, patch) => {
      const { blocks, lessonInfo } = get();
      const updated = blocks.map((b) =>
        b.id === id ? { ...b, data: { ...(b.data || {}), ...patch } } : b
      );
      pushHistoryAndSave(lessonInfo, updated);
    },

    deleteBlock: (id) => {
      const { blocks, lessonInfo } = get();
      const updated = blocks.filter((b) => b.id !== id);
      pushHistoryAndSave(lessonInfo, updated);
    },

    duplicateBlock: (id) => {
      const { blocks, lessonInfo } = get();
      const index = blocks.findIndex((b) => b.id === id);
      if (index === -1) return;
      const cloned: Block = {
        ...JSON.parse(JSON.stringify(blocks[index])),
        id: `block-${Date.now()}`,
        title: `${blocks[index].title} (Kopie)`,
      };
      const updated = [...blocks];
      updated.splice(index + 1, 0, cloned);
      pushHistoryAndSave(lessonInfo, updated);
    },

    toggleBlockCollapse: (id) => {
      set((state) => ({
        blocks: state.blocks.map((b) => (b.id === id ? { ...b, isCollapsed: !b.isCollapsed } : b)),
      }));
    },

    reorderBlocks: (activeId, overId) => {
      const { blocks, lessonInfo } = get();
      const oldIndex = blocks.findIndex((b) => b.id === activeId);
      const newIndex = blocks.findIndex((b) => b.id === overId);
      if (oldIndex === -1 || newIndex === -1) return;
      pushHistoryAndSave(lessonInfo, arrayMove(blocks, oldIndex, newIndex));
    },

    generateFlashcardsFromVocab: (sourceBlockId: string) => {
      const { blocks } = get();
      const source = blocks.find((b) => b.id === sourceBlockId);
      const vocabList = source?.data?.vocabulary || [];
      if (vocabList.length === 0) return;

      const flashcards: FlashcardItem[] = vocabList.map((v) => ({
        id: `c-${Date.now()}-${v.id}`,
        front: `${v.article !== '-' ? v.article + ' ' : ''}${v.german}`,
        back: v.translation,
        hint: v.plural ? `Plural: ${v.plural}` : v.example,
      }));

      get().addBlock(
        'Karteikarten',
        `Flashcards: ${source?.title || 'Wortschatz'}`,
        8,
        '',
        ['🃏 Flashcards', '🔄 Wiederholung'],
        { flashcards }
      );
    },

    generateQuizFromVocab: (sourceBlockId: string) => {
      const { blocks } = get();
      const source = blocks.find((b) => b.id === sourceBlockId);
      const vocabList = source?.data?.vocabulary || [];
      if (vocabList.length === 0) return;

      const quizQuestions: QuizQuestionItem[] = vocabList.slice(0, 5).map((v, i) => {
        if (v.article && v.article !== '-') {
          return {
            id: `q-${Date.now()}-${i}`,
            question: `Welcher Artikel gehört zu "${v.german}"?`,
            options: ['der', 'die', 'das'],
            correctAnswerIndex: v.article === 'der' ? 0 : v.article === 'die' ? 1 : 2,
            explanation: `Richtig ist: ${v.article} ${v.german}`,
          };
        }
        return {
          id: `q-${Date.now()}-${i}`,
          question: `Was bedeutet "${v.german}" auf Vietnamesisch?`,
          options: [v.translation, 'không xác định', 'từ ngẫu nhiên'],
          correctAnswerIndex: 0,
          explanation: `${v.german} = ${v.translation}`,
        };
      });

      get().addBlock(
        'Quiz',
        `Mini-Quiz: ${source?.title || 'Wortschatz'}`,
        5,
        '',
        ['🎯 Quiz', '⏱ Schnelltest'],
        { quizQuestions }
      );
    },

    generateSpeakingFromVocab: (sourceBlockId: string) => {
      const { blocks } = get();
      const source = blocks.find((b) => b.id === sourceBlockId);
      const vocabList = source?.data?.vocabulary || [];
      const wordSamples = vocabList.slice(0, 3).map((v) => v.german).join(', ');

      get().addBlock(
        'Sprechen',
        `Sprechübung mit Wortschatz`,
        12,
        '',
        ['🗣 Sprechen', '👥 Partnerarbeit'],
        {
          socialForm: 'PARTNERARBEIT',
          goal: `Vận dụng các từ vựng (${wordSamples}) vào giao tiếp đối thoại thực tế.`,
          instructions: '<p>Tauscht euch zu zweit aus. Verwendet mindestens 3 neue Vokabeln aus der Liste.</p>',
          sentenceStarters: [
            'Was denkst du über...?',
            'Ich finde, dass...',
            'Magst du eigentlich...?',
          ],
        }
      );
    },

    enrichVocabWithAI: async (sourceBlockId: string) => {
      const { blocks, lessonInfo } = get();
      const source = blocks.find((b) => b.id === sourceBlockId);
      if (!source) return;

      const newWords = await aiService.enrichVocabulary(lessonInfo.topic || source.title);
      const currentVocab = source.data?.vocabulary || [];
      get().updateBlockData(sourceBlockId, {
        vocabulary: [...currentVocab, ...newWords],
      });
    },

    applyTemplate: (templateId, customTopic) => {
      const tpl = LESSON_TEMPLATES.find((t) => t.id === templateId) || LESSON_TEMPLATES[0];
      const topic = customTopic || tpl.defaultTopic;
      const newInfo: LessonInfo = {
        title: `${tpl.name.replace(/^[^\w\s]+/, '').trim()}`,
        topic,
        level: tpl.level,
        objectives: `Die Lernenden beherrschen Wortschatz und Strukturen zum Thema "${topic}".`,
        targetDuration: tpl.duration,
      };

      const newBlocks: Block[] = tpl.blocks.map((b, idx) => ({
        ...JSON.parse(JSON.stringify(b)),
        id: `block-${Date.now()}-${idx}`,
      }));

      pushHistoryAndSave(newInfo, newBlocks);
      set({ isTemplateModalOpen: false });
    },
    
    createEmptyLesson: () => {
      const emptyInfo: LessonInfo = { title: 'Neue Lektion', topic: '', level: 'A1', objectives: '', targetDuration: 45 };
      pushHistoryAndSave(emptyInfo, []);
    },

    importFromBook: async (lektionId: string) => {
      try {
        const res = await apiRequest(`/books/lektion/${lektionId}`);
        if (!res.ok) return;
        
        const lektion = await res.json();
        const vocabContent = lektion.contents?.find((c: any) => c.type === 'VOCAB');
        const redemittelContent = lektion.contents?.find((c: any) => c.type === 'REDEMITTEL');

        const newBlocks: Block[] = [];
        
        newBlocks.push({
          id: `block-${Date.now()}-1`,
          type: 'Einstieg',
          title: '01 Einstieg: ' + lektion.theme,
          content: '',
          duration: 5,
          isCollapsed: false,
          tags: ['💬 Frage', '📚 Buch'],
          data: { instructions: `<p>Aktivierung zum Thema: <strong>${lektion.title}</strong></p>` },
        });

        if (vocabContent && vocabContent.data) {
          newBlocks.push({
            id: `block-${Date.now()}-2`,
            type: 'Wortschatz',
            title: '02 Wortschatz: ' + lektion.theme,
            content: '',
            duration: 15,
            isCollapsed: false,
            tags: ['📚 Wortschatz', '🎯 Vokabeln'],
            data: { vocabulary: vocabContent.data },
          });
        }

        if (redemittelContent && redemittelContent.data) {
          newBlocks.push({
            id: `block-${Date.now()}-3`,
            type: 'Sprechen',
            title: '03 Kommunikation',
            content: '',
            duration: 15,
            isCollapsed: false,
            tags: ['🗣 Sprechen', '👥 Partnerarbeit'],
            data: {
              socialForm: 'PARTNERARBEIT',
              instructions: '<p>Tauscht euch mit den Redemitteln aus dem Buch aus.</p>',
              sentenceStarters: redemittelContent.data,
            },
          });
        }

        const newInfo: LessonInfo = {
          title: `Lektion ${lektion.lektionNumber} · ${lektion.theme}`,
          topic: lektion.theme,
          level: 'A1', 
          objectives: `Lernziele aus Lektion ${lektion.lektionNumber}: ${lektion.title}`,
          targetDuration: 45,
        };

        pushHistoryAndSave(newInfo, newBlocks);
        set({ isSmartBookModalOpen: false });
      } catch (err) {
        console.error(err);
      }
    },

    fetchMyLessons: async () => {
      if (!localStorage.getItem('daf_access_token')) return;
      try {
        const res = await apiRequest('/lessons');
        if (res.ok) {
          const data = await res.json();
          set({ myLessons: data.data || [] });
        }
      } catch (err) {}
    },

    loadLessonById: async (id: string) => {
      try {
        const res = await apiRequest(`/lessons/${id}`);
        if (res.ok) {
          const data = await res.json();
          const { blocks, ...info } = data;
          set({ lessonInfo: info, blocks: blocks || [], saveStatus: 'saved', historyIndex: 0, history: [{ lessonInfo: info, blocks: blocks || [] }] });
        }
      } catch (err) {}
    },

    deleteLessonFromCloud: async (id: string) => {
      try {
        await apiRequest(`/lessons/${id}`, { method: 'DELETE' });
        get().fetchMyLessons();
        if (get().lessonInfo.id === id) {
          get().createEmptyLesson();
        }
      } catch (err) {}
    },

    undo: () => {
      const { history, historyIndex } = get();
      if (historyIndex > 0) {
        const nextIndex = historyIndex - 1;
        set({
          historyIndex: nextIndex,
          lessonInfo: history[nextIndex].lessonInfo,
          blocks: history[nextIndex].blocks,
          saveStatus: 'unsaved',
        });
      }
    },

    redo: () => {
      const { history, historyIndex } = get();
      if (historyIndex < history.length - 1) {
        const nextIndex = historyIndex + 1;
        set({
          historyIndex: nextIndex,
          lessonInfo: history[nextIndex].lessonInfo,
          blocks: history[nextIndex].blocks,
          saveStatus: 'unsaved',
        });
      }
    },

    triggerAutosave: async () => {
      const token = localStorage.getItem('daf_access_token');
      if (!token) return;
      set({ saveStatus: 'saving' });

      try {
        const { lessonInfo, blocks } = get();
        const payload = {
          title: lessonInfo.title,
          topic: lessonInfo.topic,
          level: lessonInfo.level,
          targetDuration: lessonInfo.targetDuration,
          objectives: lessonInfo.objectives,
          blocks: blocks.map((b, i) => ({ ...b, order: i, id: undefined })),
        };

        let res;
        if (lessonInfo.id) {
          res = await apiRequest(`/lessons/${lessonInfo.id}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
          });
        } else {
          res = await apiRequest(`/lessons`, {
            method: 'POST',
            body: JSON.stringify(payload),
          });
        }

        if (res.ok) {
          const savedData = await res.json();
          set({ lessonInfo: { ...lessonInfo, id: savedData.id }, saveStatus: 'saved' });
          get().fetchMyLessons();
        } else {
          set({ saveStatus: 'unsaved' });
        }
      } catch {
        set({ saveStatus: 'unsaved' });
      }
    },
  };
});