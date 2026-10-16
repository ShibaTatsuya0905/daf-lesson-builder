import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  MessageSquare,
  BookOpen,
  Headphones,
  BookMarked,
  PenTool,
  HelpCircle,
  Layers,
  Users,
  Gamepad2,
  Zap,
  FileText,
  Bookmark,
} from 'lucide-react';
import { useLessonStore } from '../../store/useLessonStore';
import { ActivityTemplateOption } from '../../types/lesson';

const ACTIVITY_TEMPLATES: ActivityTemplateOption[] = [
  {
    type: 'Einstieg',
    title: 'Einstieg & Aktivierung',
    description: 'Kích hoạt phản xạ, câu hỏi khởi động hoặc gợi mở chủ đề bài học',
    category: 'Einstieg',
    defaultDuration: 5,
    tags: ['💬 Frage', '👥 Plenum'],
    initialContent: '<p>Frage an das Plenum: <em>Was machst du heute gern?</em></p>',
  },
  {
    type: 'Wortschatz',
    title: 'Wortschatz (Từ vựng mới)',
    description: 'Giới thiệu từ vựng mới kèm mạo từ der/die/das và ví dụ',
    category: 'Wortschatz',
    defaultDuration: 10,
    tags: ['📚 Wortschatz', '🎯 Vokabeln'],
    initialContent: '<p>Wortschatzliste:</p><ul><li>das Hobby, -s</li><li>Fußball spielen</li></ul>',
  },
  {
    type: 'Sprechen',
    title: 'Sprechen (Luyện nói)',
    description: 'Hoạt động giao tiếp, hội thoại tương tác theo mẫu câu (Redemittel)',
    category: 'Sprechen',
    defaultDuration: 15,
    tags: ['🗣 Sprechen', '👥 Partnerarbeit'],
    initialContent: '<p>Sprechaufgabe: Tauscht euch über eure Hobbys aus.</p>',
  },
  {
    type: 'Hören',
    title: 'Hören (Luyện nghe)',
    description: 'Luyện nghe hiểu qua đoạn băng/audio kèm câu hỏi khai thác',
    category: 'Hören',
    defaultDuration: 10,
    tags: ['🎧 Hören', '📝 Notizen'],
    initialContent: '<p>Höre den Text und kreuze an: Richtig oder Falsch?</p>',
  },
  {
    type: 'Lesen',
    title: 'Lesen (Đọc hiểu)',
    description: 'Đọc văn bản ngắn tiếng Đức và trả lời các câu hỏi kiểm tra',
    category: 'Lesen',
    defaultDuration: 12,
    tags: ['📖 Lesen', '❓ Fragen'],
    initialContent: '<p>Lies den Text und beantworte die Fragen.</p>',
  },
  {
    type: 'Schreiben',
    title: 'Schreiben (Luyện viết)',
    description: 'Nhiệm vụ viết câu/đoạn văn có từ gợi ý (Hilfswörter) và khung sườn',
    category: 'Schreiben',
    defaultDuration: 10,
    tags: ['✍ Schreiben', '📄 Text'],
    initialContent: '<p>Schreibe 3-5 Sätze über deine Freizeitaktivitäten.</p>',
  },
  {
    type: 'Quiz',
    title: 'Quiz & Exit Ticket',
    description: 'Bài kiểm tra nhanh trắc nghiệm củng cố kiến thức trước khi hết giờ',
    category: 'Quiz',
    defaultDuration: 5,
    tags: ['🎯 Quiz', '⏱ Schnelltest'],
    initialContent: '<p>Kurzes Quiz: Welcher Artikel passt?</p>',
  },
  {
    type: 'Karteikarten',
    title: 'Karteikarten (Flashcards)',
    description: 'Thẻ từ vựng ôn tập nhanh nghĩa và phát âm',
    category: 'Wortschatz',
    defaultDuration: 8,
    tags: ['🃏 Flashcards', '🔄 Wiederholung'],
    initialContent: '<p>Übe die Vokabeln mit den Flashcards.</p>',
  },
  {
    type: 'Partnerarbeit',
    title: 'Partnerarbeit (Làm việc cặp)',
    description: 'Nhiệm vụ phối hợp hỏi - đáp hoặc đóng vai (Rollenspiel) giữa 2 học viên',
    category: 'Sozialform',
    defaultDuration: 10,
    tags: ['👥 Partnerarbeit', '🗣 Dialog'],
    initialContent: '<p>Partner A fragt, Partner B antwortet.</p>',
  },
  {
    type: 'Spiel',
    title: 'Lernspiel (Trò chơi lớp học)',
    description: 'Trò chơi củng cố từ vựng/ngữ pháp (Bingo, Kahoot, Pantomime...)',
    category: 'Spiel',
    defaultDuration: 10,
    tags: ['🎮 Spiel', '👥 Gruppe'],
    initialContent: '<p>Klassenspiel: Wer errät das Hobby zuerst?</p>',
  },
  {
    type: 'Grammatik',
    title: 'Grammatik (Ngữ pháp trọng tâm)',
    description: 'Khám phá quy tắc ngữ pháp, vị trí động từ hoặc cách chia',
    category: 'Grammatik',
    defaultDuration: 10,
    tags: ['📐 Grammatik', '📌 Regel'],
    initialContent: '<p>Regel: Verbkonjugation im Präsens.</p>',
  },
  {
    type: 'Text',
    title: 'Freier Text / Notiz',
    description: 'Khối soạn thảo tự do dành cho ghi chú bài giảng hoặc tài liệu riêng',
    category: 'Alle',
    defaultDuration: 5,
    tags: ['📝 Notiz'],
    initialContent: '<p>Freie Notizen zur Unterrichtsstunde...</p>',
  },
];

const CATEGORIES = [
  'Alle',
  'Sprechen',
  'Wortschatz',
  'Lesen',
  'Hören',
  'Schreiben',
  'Grammatik',
  'Spiel',
  'Quiz',
  'Sozialform',
];

const getCategoryIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'einstieg': return <Zap className="text-iris-bolt" size={16} />;
    case 'wortschatz': return <BookOpen className="text-iris-bolt" size={16} />;
    case 'sprechen': return <MessageSquare className="text-iris-bolt" size={16} />;
    case 'hören': return <Headphones className="text-iris-bolt" size={16} />;
    case 'lesen': return <BookMarked className="text-iris-bolt" size={16} />;
    case 'schreiben': return <PenTool className="text-iris-bolt" size={16} />;
    case 'quiz': return <HelpCircle className="text-iris-bolt" size={16} />;
    case 'karteikarten': return <Layers className="text-iris-bolt" size={16} />;
    case 'partnerarbeit': return <Users className="text-iris-bolt" size={16} />;
    case 'spiel': return <Gamepad2 className="text-iris-bolt" size={16} />;
    case 'grammatik': return <Bookmark className="text-iris-bolt" size={16} />;
    default: return <FileText className="text-slate-veil" size={16} />;
  }
};

export const AddActivityModal: React.FC = () => {
  const { isAddActivityModalOpen, closeAddActivityModal, addBlock } = useLessonStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Alle');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAddActivityModalOpen) {
        closeAddActivityModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAddActivityModalOpen, closeAddActivityModal]);

  if (!isAddActivityModalOpen) return null;

  const filteredActivities = ACTIVITY_TEMPLATES.filter((act) => {
    const matchSearch =
      act.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.type.toLowerCase().includes(searchTerm.toLowerCase());

    const matchCategory =
      selectedCategory === 'Alle' || act.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchSearch && matchCategory;
  });

  const handleSelectActivity = (template: ActivityTemplateOption) => {
    addBlock(
      template.type,
      template.title,
      template.defaultDuration,
      template.initialContent,
      template.tags
    );
    closeAddActivityModal();
    setSearchTerm('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-charcoal/40 backdrop-blur-xs p-4"
      onClick={closeAddActivityModal}
    >
      <div
        className="bg-paper-white border border-mist-border rounded-[24px] w-full max-w-3xl max-h-[85vh] flex flex-col shadow-md overflow-hidden select-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 px-6 border-b border-mist-border flex items-center justify-between bg-chalk-canvas">
          <div>
            <h3 className="text-base font-bold text-ink-charcoal">
              Neue Aktivität hinzufügen
            </h3>
            <p className="text-xs text-slate-veil">
              Chọn một hoạt động chuyên biệt để đưa vào tiến trình bài dạy
            </p>
          </div>
          <button
            type="button"
            onClick={closeAddActivityModal}
            className="p-1.5 rounded-full text-slate-veil hover:text-ink-charcoal hover:bg-mist-border transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 px-6 border-b border-mist-border space-y-3 bg-paper-white">
          <div className="flex items-center gap-2.5 bg-chalk-canvas px-3.5 py-2 rounded border border-mist-border focus-within:border-iris-bolt transition-colors">
            <Search size={15} className="text-slate-veil shrink-0" />
            <input
              type="text"
              placeholder="Search activities... (z.B. Wortschatz, Sprechen, Quiz...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs bg-transparent text-ink-charcoal focus:outline-none"
              autoFocus
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="text-xs text-slate-veil hover:text-ink-charcoal cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-iris-bolt text-paper-white shadow-xs'
                    : 'bg-chalk-canvas text-slate-veil hover:text-ink-charcoal border border-mist-border'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-chalk-canvas flex-1">
          {filteredActivities.length === 0 ? (
            <div className="col-span-2 text-center py-12 text-fog-mist text-xs">
              Không tìm thấy hoạt động nào phù hợp với từ khóa "{searchTerm}".
            </div>
          ) : (
            filteredActivities.map((act) => (
              <div
                key={act.title}
                onClick={() => handleSelectActivity(act)}
                className="group p-4 rounded-lg border border-mist-border bg-paper-white hover:border-iris-bolt hover:shadow-sm transition-all cursor-pointer flex items-start gap-3.5"
              >
                <div className="p-2 rounded bg-lilac-wash text-iris-bolt shrink-0">
                  {getCategoryIcon(act.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <h4 className="text-xs font-bold text-ink-charcoal group-hover:text-iris-bolt transition-colors truncate">
                      {act.title}
                    </h4>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-chalk-canvas border border-mist-border text-slate-veil font-semibold shrink-0">
                      {act.defaultDuration} Min
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-veil leading-relaxed line-clamp-2 mb-2">
                    {act.description}
                  </p>

                  <div className="flex flex-wrap gap-1">
                    {act.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-chalk-canvas border border-mist-border text-slate-veil"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};