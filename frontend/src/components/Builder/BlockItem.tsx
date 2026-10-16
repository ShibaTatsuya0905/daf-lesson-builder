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
      className="group relative bg-paper-white border border-mist-border rounded-lg shadow-sm hover:shadow-md transition-shadow mb-4"
    >
      <div className="flex items-center justify-between p-3.5 border-b border-mist-border bg-paper-white rounded-t-lg select-none">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1.5 text-fog-mist hover:text-ink-charcoal rounded transition-colors"
            title="Kéo thả sắp xếp vị trí"
          >
            <GripVertical size={18} />
          </div>

          <span className="font-mono text-xs font-semibold text-slate-veil shrink-0">
            {displayNumber}
          </span>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-lilac-wash text-iris-bolt shrink-0">
            {block.type}
          </span>

          <input
            ref={titleInputRef}
            type="text"
            value={block.title}
            onChange={(e) => updateBlockTitle(block.id, e.target.value)}
            className="font-semibold text-sm text-ink-charcoal bg-transparent border-b border-transparent hover:border-mist-border focus:border-iris-bolt focus:outline-none px-1 py-0.5 truncate flex-1 min-w-[120px]"
          />

          {block.tags && block.tags.length > 0 && (
            <div className="hidden md:flex items-center gap-1">
              {block.tags.map((tag: string) => (
                <span key={tag} className="text-[10px] font-semibold text-slate-veil bg-chalk-canvas border border-mist-border px-2 py-0.5 rounded">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-chalk-canvas border border-mist-border text-ink-charcoal font-semibold shadow-xs">
            <Clock size={13} className="text-slate-veil shrink-0" />
            <input
              type="number"
              value={block.duration === 0 ? '' : block.duration}
              onChange={(e) => {
                const val = e.target.value;
                updateBlockDuration(block.id, val === '' ? 0 : Number(val));
              }}
              placeholder="0"
              className="w-8 text-center bg-transparent focus:outline-none font-bold text-ink-charcoal"
            />
            <span className="text-slate-veil font-normal">Min</span>
          </div>

          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={handleEditClick}
              title="Chỉnh sửa (Bearbeiten)"
              className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-slate-veil hover:text-iris-bolt hover:bg-lilac-wash rounded transition-colors cursor-pointer"
            >
              <Edit3 size={13} />
              <span className="hidden lg:inline text-[11px]">Sửa</span>
            </button>

            <button
              type="button"
              onClick={() => duplicateBlock(block.id)}
              title="Nhân bản (Duplizieren)"
              className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-slate-veil hover:text-iris-bolt hover:bg-lilac-wash rounded transition-colors cursor-pointer"
            >
              <Copy size={13} />
              <span className="hidden lg:inline text-[11px]">Nhân bản</span>
            </button>

            <button
              type="button"
              onClick={() => deleteBlock(block.id)}
              title="Xóa block (Löschen)"
              className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-slate-veil hover:text-[#dc2626] hover:bg-[#fef2f2] rounded transition-colors cursor-pointer"
            >
              <Trash2 size={13} />
              <span className="hidden lg:inline text-[11px]">Xóa</span>
            </button>

            <button
              type="button"
              onClick={() => toggleBlockCollapse(block.id)}
              title={block.isCollapsed ? 'Mở rộng' : 'Thu nhỏ'}
              className="p-1 text-slate-veil hover:text-ink-charcoal rounded transition-colors cursor-pointer"
            >
              {block.isCollapsed ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
            </button>
          </div>
        </div>
      </div>

      {!block.isCollapsed && <div className="p-5">{renderActivityTemplate()}</div>}
    </div>
  );
};