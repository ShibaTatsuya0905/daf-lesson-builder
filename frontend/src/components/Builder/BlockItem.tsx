import { useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  Trash2,
  Copy,
  Clock,
  ChevronDown,
  ChevronUp,
  Edit3,
} from 'lucide-react';
import { Block } from '../../types/lesson';
import { useLessonStore } from '../../store/useLessonStore';
import { EinstiegActivity } from '../activities/EinstiegActivity';
import { WortschatzActivity } from '../activities/WortschatzActivity';
import { SprechenActivity } from '../activities/SprechenActivity';
import { LesenActivity } from '../activities/LesenActivity';
import { HoerenActivity } from '../activities/HoerenActivity';
import { SchreibenActivity } from '../activities/SchreibenActivity';
import { QuizActivity } from '../activities/QuizActivity';
import { KarteikartenActivity } from '../activities/KarteikartenActivity';
import { DefaultActivity } from '../activities/DefaultActivity';

const COLOR_MAP: Record<string, { border: string; badgeBg: string; badgeText: string; dot: string }> = {
  einstieg: { border: 'border-l-emerald-500', badgeBg: 'bg-emerald-50', badgeText: 'text-emerald-700', dot: 'bg-emerald-500' },
  wortschatz: { border: 'border-l-purple-500', badgeBg: 'bg-purple-50', badgeText: 'text-purple-700', dot: 'bg-purple-500' },
  sprechen: { border: 'border-l-blue-500', badgeBg: 'bg-blue-50', badgeText: 'text-blue-700', dot: 'bg-blue-500' },
  hören: { border: 'border-l-orange-500', badgeBg: 'bg-orange-50', badgeText: 'text-orange-700', dot: 'bg-orange-500' },
  lesen: { border: 'border-l-cyan-500', badgeBg: 'bg-cyan-50', badgeText: 'text-cyan-700', dot: 'bg-cyan-500' },
  schreiben: { border: 'border-l-pink-500', badgeBg: 'bg-pink-50', badgeText: 'text-pink-700', dot: 'bg-pink-500' },
  quiz: { border: 'border-l-amber-500', badgeBg: 'bg-amber-50', badgeText: 'text-amber-700', dot: 'bg-amber-500' },
  partnerarbeit: { border: 'border-l-teal-500', badgeBg: 'bg-teal-50', badgeText: 'text-teal-700', dot: 'bg-teal-500' },
  spiel: { border: 'border-l-rose-500', badgeBg: 'bg-rose-50', badgeText: 'text-rose-700', dot: 'bg-rose-500' },
  karteikarten: { border: 'border-l-indigo-500', badgeBg: 'bg-indigo-50', badgeText: 'text-indigo-700', dot: 'bg-indigo-500' },
  grammatik: { border: 'border-l-violet-500', badgeBg: 'bg-violet-50', badgeText: 'text-violet-700', dot: 'bg-violet-500' },
};

export const BlockItem = ({ block, index }: { block: Block; index: number }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  });

  const {
    updateBlockTitle,
    updateBlockDuration,
    deleteBlock,
    duplicateBlock,
    toggleBlockCollapse,
  } = useLessonStore();

  const titleInputRef = useRef<HTMLInputElement>(null);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  };

  const key = block.type.toLowerCase();
  const theme = COLOR_MAP[key] || {
    border: 'border-l-slate-400',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-700',
    dot: 'bg-slate-500',
  };

  const displayNumber = String(index + 1).padStart(2, '0');

  const handleEditClick = () => {
    if (block.isCollapsed) {
      toggleBlockCollapse(block.id);
    }
    setTimeout(() => {
      titleInputRef.current?.focus();
    }, 50);
  };

  const renderActivityTemplate = () => {
    switch (key) {
      case 'einstieg':
        return <EinstiegActivity block={block} />;
      case 'wortschatz':
        return <WortschatzActivity block={block} />;
      case 'sprechen':
      case 'partnerarbeit':
        return <SprechenActivity block={block} />;
      case 'lesen':
        return <LesenActivity block={block} />;
      case 'hören':
        return <HoerenActivity block={block} />;
      case 'schreiben':
        return <SchreibenActivity block={block} />;
      case 'quiz':
        return <QuizActivity block={block} />;
      case 'karteikarten':
        return <KarteikartenActivity block={block} />;
      default:
        return <DefaultActivity block={block} />;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative bg-white border border-slate-200 border-l-[6px] ${theme.border} rounded-xl shadow-sm hover:shadow-md transition-all mb-4`}
    >
      <div className="flex items-center justify-between p-3.5 border-b border-slate-100 bg-slate-50/60 rounded-t-xl select-none">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/80 rounded transition-colors"
            title="Kéo thả để sắp xếp vị trí"
          >
            <GripVertical size={18} />
          </div>

          <span className="font-mono text-xs font-bold text-slate-400 shrink-0">
            {displayNumber}
          </span>

          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold ${theme.badgeBg} ${theme.badgeText} shrink-0`}>
            <span className={`w-1.5 h-1.5 rounded-full ${theme.dot}`} />
            {block.type}
          </span>

          <input
            ref={titleInputRef}
            type="text"
            value={block.title}
            onChange={(e) => updateBlockTitle(block.id, e.target.value)}
            className="font-bold text-sm text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none px-1 py-0.5 truncate flex-1 min-w-[120px]"
          />

          {block.tags && block.tags.length > 0 && (
            <div className="hidden md:flex items-center gap-1">
              {block.tags.map((tag: string) => (
                <span key={tag} className="text-[10px] font-medium text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-white border border-slate-200 text-slate-700 font-medium shadow-sm">
            <Clock size={13} className="text-slate-400 shrink-0" />
            <input
              type="number"
              value={block.duration === 0 ? '' : block.duration}
              onChange={(e) => {
                const val = e.target.value;
                updateBlockDuration(block.id, val === '' ? 0 : Number(val));
              }}
              placeholder="0"
              className="w-8 text-center bg-transparent focus:outline-none font-bold"
            />
            <span className="text-slate-400 font-normal">Min</span>
          </div>

          <div className="flex items-center gap-0.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={handleEditClick}
              title="Chỉnh sửa (Bearbeiten)"
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            >
              <Edit3 size={13} />
              <span className="hidden lg:inline text-[11px]">Bearbeiten</span>
            </button>

            <button
              type="button"
              onClick={() => duplicateBlock(block.id)}
              title="Nhân bản (Duplizieren)"
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
            >
              <Copy size={13} />
              <span className="hidden lg:inline text-[11px]">Duplizieren</span>
            </button>

            <button
              type="button"
              onClick={() => deleteBlock(block.id)}
              title="Xóa block (Löschen)"
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            >
              <Trash2 size={13} />
              <span className="hidden lg:inline text-[11px]">Löschen</span>
            </button>

            <button
              type="button"
              onClick={() => toggleBlockCollapse(block.id)}
              title={block.isCollapsed ? 'Mở rộng' : 'Thu nhỏ'}
              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded transition-colors"
            >
              {block.isCollapsed ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
            </button>
          </div>
        </div>
      </div>

      {!block.isCollapsed && <div className="p-4">{renderActivityTemplate()}</div>}
    </div>
  );
};