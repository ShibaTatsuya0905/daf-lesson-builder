import React from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Sparkles, Plus, FolderOpen, Book, FileUp } from 'lucide-react';
import { useLessonStore } from '../../store/useLessonStore';
import { BlockItem } from './BlockItem';
import { CEFRLevel } from '../../types/lesson';

export const KanbanBuilder: React.FC = () => {
  const { blocks, reorderBlocks, lessonInfo, updateLessonInfo, openAddActivityModal, openTemplateModal, openSmartBookModal, openPdfScannerModal } = useLessonStore();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderBlocks(active.id, over.id);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Thema (Chủ đề)</label>
            <input 
              type="text" 
              value={lessonInfo.topic} 
              onChange={(e) => updateLessonInfo({ topic: e.target.value })} 
              className="w-full text-sm font-bold p-2.5 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:border-blue-500" 
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Niveau (Trình độ)</label>
            <select 
              value={lessonInfo.level} 
              onChange={(e) => updateLessonInfo({ level: e.target.value as CEFRLevel })} 
              className="w-full text-sm font-bold p-2.5 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:border-blue-500"
            >
              {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((lvl) => (
                <option key={lvl} value={lvl}>{lvl}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Gesamtdauer (Phút)</label>
            <input 
              type="number" 
              value={lessonInfo.targetDuration === 0 ? '' : lessonInfo.targetDuration} 
              onChange={(e) => {
                const val = e.target.value;
                updateLessonInfo({ targetDuration: val === '' ? 0 : Number(val) });
              }} 
              placeholder="0"
              className="w-full text-sm font-bold p-2.5 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:border-blue-500" 
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Lernziel (Mục tiêu bài học)</label>
          <input 
            type="text" 
            value={lessonInfo.objectives} 
            onChange={(e) => updateLessonInfo({ objectives: e.target.value })} 
            className="w-full text-xs p-2.5 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:border-blue-500" 
          />
        </div>
      </div>

      {blocks.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white border-2 border-dashed border-slate-200 rounded-2xl shadow-sm">
          <div className="w-14 h-14 mx-auto mb-3 flex items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <Sparkles size={28} />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">✨ Bắt đầu tạo giáo án</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">Chưa có hoạt động nào trong bài học này.</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button onClick={openSmartBookModal} className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2.5 rounded-lg bg-blue-50 border border-blue-200 hover:border-blue-500 text-blue-700 shadow-sm transition-colors">
              <Book size={15} /> Aus Buch laden
            </button>
            <button onClick={openPdfScannerModal} className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2.5 rounded-lg bg-indigo-50 border border-indigo-200 hover:border-indigo-500 text-indigo-700 shadow-sm transition-colors">
              <FileUp size={15} /> PDF Scannen
            </button>
            <button onClick={openTemplateModal} className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2.5 rounded-lg bg-white border border-slate-200 hover:border-purple-500 text-slate-700 shadow-sm transition-colors">
              <FolderOpen size={15} className="text-purple-500" /> Vorlage
            </button>
            <button onClick={openAddActivityModal} className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors">
              <Plus size={15} /> Aktivität
            </button>
          </div>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
            <div>
              {blocks.map((block, index) => (
                <BlockItem key={block.id} block={block} index={index} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {blocks.length > 0 && (
        <div className="text-center pt-2">
          <button onClick={openAddActivityModal} className="inline-flex items-center gap-2 text-xs font-semibold px-5 py-2.5 rounded-xl border border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/50 text-slate-600 transition-all shadow-sm">
            <Plus size={16} className="text-blue-600" /> ＋ Aktivität hinzufügen
          </button>
        </div>
      )}
    </div>
  );
};