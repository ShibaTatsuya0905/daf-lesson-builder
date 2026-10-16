import React from 'react';
import {
  Zap,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  MessageSquare,
  Headphones,
  BookMarked,
  PenTool,
  HelpCircle,
  Layers,
  Image,
  Video,
  MessageCircle,
  Users,
  Gamepad2,
  FileText,
  Plus,
} from 'lucide-react';
import { useLessonStore } from '../../store/useLessonStore';

interface ToolItem {
  type: string;
  label: string;
  icon: React.ReactNode;
  isModalTrigger?: boolean;
}

const TOOLS: ToolItem[] = [
  { type: 'Aktivität', label: 'Aktivität', icon: <Plus size={15} />, isModalTrigger: true },
  { type: 'Text', label: 'Text', icon: <FileText size={15} /> },
  { type: 'Wortschatz', label: 'Wortschatz', icon: <BookOpen size={15} /> },
  { type: 'Sprechen', label: 'Sprechen', icon: <MessageSquare size={15} /> },
  { type: 'Hören', label: 'Hören', icon: <Headphones size={15} /> },
  { type: 'Lesen', label: 'Lesen', icon: <BookMarked size={15} /> },
  { type: 'Schreiben', label: 'Schreiben', icon: <PenTool size={15} /> },
  { type: 'Quiz', label: 'Quiz', icon: <HelpCircle size={15} /> },
  { type: 'Karteikarten', label: 'Karteikarten', icon: <Layers size={15} /> },
  { type: 'Bild', label: 'Bild', icon: <Image size={15} /> },
  { type: 'Video', label: 'Video', icon: <Video size={15} /> },
  { type: 'Diskussion', label: 'Diskussion', icon: <MessageCircle size={15} /> },
  { type: 'Partnerarbeit', label: 'Partnerarbeit', icon: <Users size={15} /> },
  { type: 'Spiel', label: 'Spiel', icon: <Gamepad2 size={15} /> },
];

export const RightQuickToolbar: React.FC = () => {
  const { isQuickToolbarOpen, toggleQuickToolbar, addBlock, openAddActivityModal } = useLessonStore();

  const handleToolClick = (tool: ToolItem) => {
    if (tool.isModalTrigger) {
      openAddActivityModal();
    } else {
      addBlock(tool.type);
    }
  };

  return (
    <aside
      className={`relative flex flex-col border-l border-mist-border bg-paper-white transition-all duration-300 z-10 select-none ${
        isQuickToolbarOpen ? 'w-56' : 'w-14'
      }`}
    >
      <button
        type="button"
        onClick={toggleQuickToolbar}
        className="absolute -left-3.5 top-6 w-7 h-7 rounded-full bg-paper-white border border-mist-border flex items-center justify-center text-slate-veil shadow-sm hover:text-ink-charcoal transition-colors z-20 cursor-pointer"
        title={isQuickToolbarOpen ? 'Thu nhỏ toolbar' : 'Mở rộng toolbar'}
      >
        {isQuickToolbarOpen ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <div className="p-4 border-b border-mist-border flex items-center gap-2">
        <Zap size={16} className="text-iris-bolt shrink-0" />
        {isQuickToolbarOpen && (
          <span className="text-[13px] font-bold text-ink-charcoal truncate">
            Schnell hinzufügen
          </span>
        )}
      </div>

      <div className="p-2 space-y-1 overflow-y-auto flex-1">
        {TOOLS.map((tool) => (
          <button
            key={tool.type}
            type="button"
            onClick={() => handleToolClick(tool)}
            className={`w-full flex items-center gap-3 rounded p-2 text-[13px] font-semibold transition-all cursor-pointer ${
              tool.isModalTrigger
                ? 'bg-lilac-wash text-iris-bolt hover:bg-iris-bolt hover:text-paper-white'
                : 'text-slate-veil hover:bg-chalk-canvas hover:text-ink-charcoal'
            } ${!isQuickToolbarOpen ? 'justify-center' : ''}`}
            title={`+ ${tool.label}`}
          >
            <span className="shrink-0">{tool.icon}</span>
            {isQuickToolbarOpen && <span className="truncate">{tool.label}</span>}
          </button>
        ))}
      </div>
    </aside>
  );
};