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
    case 'einstieg': return <Zap className="text-emerald-500" size={18} />;
    case 'wortschatz': return <BookOpen className="text-purple-500" size={18} />;
    case 'sprechen': return <MessageSquare className="text-blue-500" size={18} />;
    case 'hören': return <Headphones className="text-orange-500" size={18} />;
    case 'lesen': return <BookMarked className="text-cyan-500" size={18} />;
    case 'schreiben': return <PenTool className="text-pink-500" size={18} />;
    case 'quiz': return <HelpCircle className="text-amber-500" size={18} />;
    case 'karteikarten': return <Layers className="text-indigo-500" size={18} />;
    case 'partnerarbeit': return <Users className="text-teal-500" size={18} />;
    case 'spiel': return <Gamepad2 className="text-rose-500" size={18} />;
    case 'grammatik': return <Bookmark className="text-violet-500" size={18} />;
    default: return <FileText className="text-slate-500" size={18} />;
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
      onClick={closeAddActivityModal}
    >
      <div
        className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden select-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-base font-extrabold text-slate-800">
              Neue Aktivität hinzufügen
            </h3>
            <p className="text-xs text-slate-500">
              Chọn một hoạt động chuyên biệt để đưa vào tiến trình bài dạy
            </p>
          </div>
          <button
            type="button"
            onClick={closeAddActivityModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 px-6 border-b border-slate-100 space-y-3 bg-white">
          <div className="flex items-center gap-2.5 bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 focus-within:border-blue-500 focus-within:bg-white transition-all">
            <Search size={16} className="text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search activities... (z.B. Wortschatz, Sprechen, Quiz...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs bg-transparent text-slate-800 focus:outline-none"
              autoFocus
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="text-xs text-slate-400 hover:text-slate-600"
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
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-50/30">
          {filteredActivities.length === 0 ? (
            <div className="col-span-2 text-center py-12 text-slate-400 text-xs">
              Không tìm thấy hoạt động nào phù hợp với từ khóa "{searchTerm}".
            </div>
          ) : (
            filteredActivities.map((act) => (
              <div
                key={act.title}
                onClick={() => handleSelectActivity(act)}
                className="group p-3.5 rounded-xl border border-slate-200 bg-white hover:border-blue-500 hover:shadow-md transition-all cursor-pointer flex items-start gap-3.5"
              >
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors shrink-0">
                  {getCategoryIcon(act.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <h4 className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate">
                      {act.title}
                    </h4>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-semibold shrink-0">
                      {act.defaultDuration} Min
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2 mb-2">
                    {act.description}
                  </p>

                  <div className="flex flex-wrap gap-1">
                    {act.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600"
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