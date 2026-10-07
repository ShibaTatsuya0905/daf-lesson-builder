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
  color: string;
  isModalTrigger?: boolean;
}

const TOOLS: ToolItem[] = [
  { type: 'Aktivität', label: 'Aktivität', icon: <Plus size={14} />, color: 'hover:border-blue-500 hover:bg-blue-50 text-blue-600 font-bold', isModalTrigger: true },
  { type: 'Text', label: 'Text', icon: <FileText size={14} />, color: 'hover:border-slate-500 hover:bg-slate-50' },
  { type: 'Wortschatz', label: 'Wortschatz', icon: <BookOpen size={14} />, color: 'hover:border-purple-500 hover:bg-purple-50' },
  { type: 'Sprechen', label: 'Sprechen', icon: <MessageSquare size={14} />, color: 'hover:border-blue-500 hover:bg-blue-50' },
  { type: 'Hören', label: 'Hören', icon: <Headphones size={14} />, color: 'hover:border-orange-500 hover:bg-orange-50' },
  { type: 'Lesen', label: 'Lesen', icon: <BookMarked size={14} />, color: 'hover:border-cyan-500 hover:bg-cyan-50' },
  { type: 'Schreiben', label: 'Schreiben', icon: <PenTool size={14} />, color: 'hover:border-pink-500 hover:bg-pink-50' },
  { type: 'Quiz', label: 'Quiz', icon: <HelpCircle size={14} />, color: 'hover:border-amber-500 hover:bg-amber-50' },
  { type: 'Karteikarten', label: 'Karteikarten', icon: <Layers size={14} />, color: 'hover:border-indigo-500 hover:bg-indigo-50' },
  { type: 'Bild', label: 'Bild', icon: <Image size={14} />, color: 'hover:border-emerald-500 hover:bg-emerald-50' },
  { type: 'Video', label: 'Video', icon: <Video size={14} />, color: 'hover:border-red-500 hover:bg-red-50' },
  { type: 'Diskussion', label: 'Diskussion', icon: <MessageCircle size={14} />, color: 'hover:border-sky-500 hover:bg-sky-50' },
  { type: 'Partnerarbeit', label: 'Partnerarbeit', icon: <Users size={14} />, color: 'hover:border-teal-500 hover:bg-teal-50' },
  { type: 'Spiel', label: 'Spiel', icon: <Gamepad2 size={14} />, color: 'hover:border-rose-500 hover:bg-rose-50' },
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
      className={`relative flex flex-col border-l border-slate-200 bg-white transition-all duration-300 z-10 select-none ${
        isQuickToolbarOpen ? 'w-56' : 'w-12'
      }`}
    >
      <button
        type="button"
        onClick={toggleQuickToolbar}
        className="absolute -left-3 top-5 w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 shadow-sm hover:bg-slate-50 transition-colors z-20"
        title={isQuickToolbarOpen ? 'Thu nhỏ toolbar' : 'Mở rộng toolbar'}
      >
        {isQuickToolbarOpen ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <div className="p-3 border-b border-slate-100 flex items-center gap-1.5">
        <Zap size={15} className="text-amber-500 shrink-0" />
        {isQuickToolbarOpen && (
          <span className="text-xs font-bold text-slate-700 truncate">
            ⚡ Schnell hinzufügen
          </span>
        )}
      </div>

      <div className="p-2 space-y-1 overflow-y-auto flex-1">
        {TOOLS.map((tool) => (
          <button
            key={tool.type}
            type="button"
            onClick={() => handleToolClick(tool)}
            className={`w-full flex items-center gap-2.5 rounded-lg border border-transparent p-2 text-xs font-medium text-slate-700 transition-all ${
              tool.color
            } ${!isQuickToolbarOpen ? 'justify-center' : ''}`}
            title={`+ ${tool.label}`}
          >
            <span className="text-slate-500 shrink-0">{tool.icon}</span>
            {isQuickToolbarOpen && <span className="truncate">＋ {tool.label}</span>}
          </button>
        ))}
      </div>
    </aside>
  );
};