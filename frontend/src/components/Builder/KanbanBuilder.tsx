import React from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, FileText, Book, FileUp, FolderOpen, Trash2, Check, Loader2 } from 'lucide-react';
import { useLessonStore } from '../../store/useLessonStore';
import { BlockItem } from './BlockItem';
import { CEFRLevel } from '../../types/lesson';

export const KanbanBuilder: React.FC = () => {
  const { 
    activeTab, blocks, reorderBlocks, lessonInfo, updateLessonInfo, myLessons, 
    loadLessonById, deleteLessonFromCloud, createEmptyLesson, openAddActivityModal, 
    openAIModal, setViewMode, openSmartBookModal, openPdfScannerModal, 
    openTemplateModal, isLoadingLesson
  } = useLessonStore();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), 
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderBlocks(active.id, over.id);
    }
  };

  const handleDeleteLesson = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Bạn có chắc chắn muốn xóa vĩnh viễn bài giảng/đề thi này?')) {
      deleteLessonFromCloud(id);
    }
  };

  if (activeTab === 'overview') {
    return (
      <div className="w-full animate-in fade-in duration-300">
        <div className="flex flex-col items-center text-center py-16 px-4 max-w-4xl mx-auto">
          <h1 className="text-[40px] leading-[48px] font-bold text-ink-charcoal mb-4">
            Mỗi bài giảng là một hành trình.
          </h1>
          <p className="text-[18px] leading-[26px] text-slate-veil max-w-2xl mb-8">
            Khơi nguồn sáng tạo với trợ lý AI chuyên biệt cho việc soạn đề thi và giáo án tiếng Đức chuẩn CEFR. Tiết kiệm 80% thời gian chuẩn bị giáo án.
          </p>
          <div className="flex items-center gap-5">
            <button 
              onClick={openAIModal} 
              className="bg-iris-bolt text-paper-white font-semibold text-[15px] px-8 py-3 rounded-full shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
            >
              Khám phá trợ lý AI
            </button>
            <button 
              onClick={createEmptyLesson} 
              className="text-iris-bolt font-semibold text-[15px] hover:underline bg-transparent border-none cursor-pointer"
            >
              Soạn từ trang trắng
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-[1200px] mx-auto px-4 pb-16">
          <div 
            onClick={openSmartBookModal} 
            className="bg-feature-cyan rounded-[24px] p-2.5 cursor-pointer group hover:scale-[1.02] transition-transform duration-200"
          >
            <div className="bg-paper-white rounded-lg p-6 h-full flex flex-col items-center text-center shadow-xs">
              <Book size={36} className="text-ink-charcoal mb-4 group-hover:-translate-y-1 transition-transform" />
              <h3 className="font-bold text-[20px] text-ink-charcoal mb-1.5">Nạp từ Sách</h3>
              <p className="text-[14px] text-slate-veil">Kho giáo trình chuẩn CEFR</p>
            </div>
          </div>
          
          <div 
            onClick={openPdfScannerModal} 
            className="bg-feature-magenta rounded-[24px] p-2.5 cursor-pointer group hover:scale-[1.02] transition-transform duration-200"
          >
            <div className="bg-paper-white rounded-lg p-6 h-full flex flex-col items-center text-center shadow-xs">
              <FileUp size={36} className="text-ink-charcoal mb-4 group-hover:-translate-y-1 transition-transform" />
              <h3 className="font-bold text-[20px] text-ink-charcoal mb-1.5">Quét PDF AI</h3>
              <p className="text-[14px] text-slate-veil">Bóc tách tự động đa trang</p>
            </div>
          </div>

          <div 
            onClick={openTemplateModal} 
            className="bg-feature-violet rounded-[24px] p-2.5 cursor-pointer group hover:scale-[1.02] transition-transform duration-200"
          >
            <div className="bg-paper-white rounded-lg p-6 h-full flex flex-col items-center text-center shadow-xs">
              <FolderOpen size={36} className="text-ink-charcoal mb-4 group-hover:-translate-y-1 transition-transform" />
              <h3 className="font-bold text-[20px] text-ink-charcoal mb-1.5">Mẫu giáo án</h3>
              <p className="text-[14px] text-slate-veil">Cấu trúc 45 - 60 phút chuẩn</p>
            </div>
          </div>

          <div 
            onClick={openAddActivityModal} 
            className="bg-feature-peach rounded-[24px] p-2.5 cursor-pointer group hover:scale-[1.02] transition-transform duration-200"
          >
            <div className="bg-paper-white rounded-lg p-6 h-full flex flex-col items-center text-center shadow-xs">
              <Plus size={36} className="text-ink-charcoal mb-4 group-hover:-translate-y-1 transition-transform" />
              <h3 className="font-bold text-[20px] text-ink-charcoal mb-1.5">Thêm thủ công</h3>
              <p className="text-[14px] text-slate-veil">Tùy biến từng hoạt động</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'my_lessons') {
    return (
      <div className="max-w-[1200px] mx-auto p-4 sm:p-8 animate-in fade-in duration-300 relative">
        {isLoadingLesson && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-paper-white/80 backdrop-blur-xs rounded-lg">
            <Loader2 size={36} className="animate-spin text-iris-bolt mb-3" />
            <p className="font-bold text-ink-charcoal">Đang tải giáo án...</p>
            <p className="text-xs text-slate-veil mt-0.5">Vui lòng chờ trong giây lát</p>
          </div>
        )}

        <div className="flex items-end justify-between mb-8 pb-4 border-b border-mist-border">
          <div>
            <h1 className="text-[28px] font-bold text-ink-charcoal tracking-tight">Giáo án & Đề thi của bạn</h1>
            <p className="text-[15px] text-slate-veil mt-1">Tổng cộng: {myLessons.length} bài giảng đã lưu trữ an toàn trên máy chủ.</p>
          </div>
          <button 
            onClick={createEmptyLesson}
            className="hidden sm:flex items-center gap-2 bg-iris-bolt hover:opacity-90 text-paper-white px-6 py-2.5 rounded-full font-semibold text-[14px] shadow-sm transition-opacity cursor-pointer"
          >
            <Plus size={18} /> Soạn bài mới
          </button>
        </div>
        
        <div className="bg-paper-white border border-mist-border rounded-lg shadow-xs overflow-hidden">
          <table className="w-full text-left text-[14px]">
            <thead className="bg-chalk-canvas font-semibold text-ink-charcoal border-b border-mist-border">
              <tr>
                <th className="p-4 pl-6 w-1/2">Tên Bài Giảng / Đề Thi</th>
                <th className="p-4 text-center w-1/6">Trình độ</th>
                <th className="p-4 text-center w-1/6">Trạng thái</th>
                <th className="p-4 text-right pr-6 w-1/6">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mist-border">
              {myLessons.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-16 text-center text-slate-veil bg-paper-white">
                    <FolderOpen size={44} className="mx-auto text-fog-mist mb-3" />
                    <p className="font-semibold text-ink-charcoal">Chưa có giáo án nào.</p>
                    <p className="text-xs text-slate-veil mt-1">Nhấp "Soạn bài mới" để bắt đầu tiết dạy đầu tiên của bạn!</p>
                  </td>
                </tr>
              ) : (
                myLessons.map((lesson) => (
                  <tr 
                    key={lesson.id} 
                    className="hover:bg-chalk-canvas transition-colors group cursor-pointer" 
                    onClick={() => loadLessonById(lesson.id!)}
                  >
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3.5">
                        <div className="w-9 h-9 rounded bg-lilac-wash text-iris-bolt flex items-center justify-center shrink-0">
                          <FileText size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-ink-charcoal group-hover:text-iris-bolt transition-colors truncate text-[15px]">
                            {lesson.title || 'Bài giảng không tên'}
                          </p>
                          <p className="text-xs text-slate-veil mt-0.5 truncate">{lesson.topic || 'Chưa gắn chủ đề'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="font-semibold text-xs text-slate-veil bg-chalk-canvas border border-mist-border px-2.5 py-1 rounded">
                        {lesson.level || 'A1'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-flex px-2.5 py-1 rounded text-[11px] font-semibold bg-[#f0fdf4] text-[#16a34a] border border-[#bbf7d0]">
                        Đã lưu Cloud
                      </span>
                    </td>
                    <td className="p-4 text-right pr-6">
                      <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => handleDeleteLesson(e, lesson.id!)} 
                          className="p-1.5 text-slate-veil hover:text-[#dc2626] rounded transition-colors cursor-pointer"
                          title="Xóa giáo án"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      <div className="flex flex-wrap items-center justify-between p-4 px-6 bg-lilac-wash border border-mist-border rounded-lg shadow-xs gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-2.5 h-2.5 rounded-full bg-iris-bolt shrink-0"></div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-ink-charcoal truncate">
              Chế độ chỉnh sửa giáo án chi tiết
            </p>
            <p className="text-xs text-slate-veil truncate mt-0.5">
              Kéo thả các thẻ để sắp xếp mạch tiết dạy. Sau khi sửa xong, nhấp hoàn tất để xem bản in/học sinh.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setViewMode('student')}
          className="flex items-center gap-1.5 text-xs font-semibold px-5 py-2.5 bg-iris-bolt hover:opacity-90 text-paper-white rounded-full shadow-xs transition-opacity cursor-pointer shrink-0"
        >
          <Check size={15} /> Hoàn tất & Xem tài liệu
        </button>
      </div>

      <div className="bg-paper-white border border-mist-border rounded-lg p-6 shadow-xs space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-veil uppercase tracking-wider mb-2">Chủ đề (Thema)</label>
            <input 
              type="text" 
              value={lessonInfo.topic} 
              onChange={(e) => updateLessonInfo({ topic: e.target.value })} 
              className="w-full text-sm font-semibold p-2.5 rounded bg-chalk-canvas border border-mist-border focus:outline-none focus:border-iris-bolt text-ink-charcoal transition-colors" 
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-veil uppercase tracking-wider mb-2">Trình độ (Niveau)</label>
            <select 
              value={lessonInfo.level} 
              onChange={(e) => updateLessonInfo({ level: e.target.value as CEFRLevel })} 
              className="w-full text-sm font-semibold p-2.5 rounded bg-chalk-canvas border border-mist-border focus:outline-none focus:border-iris-bolt text-ink-charcoal transition-colors cursor-pointer"
            >
              {['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'TDN3', 'TDN4', 'TDN5'].map((lvl) => (
                <option key={lvl} value={lvl}>{lvl}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-veil uppercase tracking-wider mb-2">Thời lượng (Phút)</label>
            <input 
              type="number" 
              value={lessonInfo.targetDuration === 0 ? '' : lessonInfo.targetDuration} 
              onChange={(e) => {
                const val = e.target.value;
                updateLessonInfo({ targetDuration: val === '' ? 0 : Number(val) });
              }} 
              placeholder="0"
              className="w-full text-sm font-semibold p-2.5 rounded bg-chalk-canvas border border-mist-border focus:outline-none focus:border-iris-bolt text-ink-charcoal transition-colors" 
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-veil uppercase tracking-wider mb-2">Mục tiêu bài học (Lernziel)</label>
          <input 
            type="text" 
            value={lessonInfo.objectives} 
            onChange={(e) => updateLessonInfo({ objectives: e.target.value })} 
            className="w-full text-sm font-medium p-2.5 rounded bg-chalk-canvas border border-mist-border focus:outline-none focus:border-iris-bolt text-ink-charcoal transition-colors" 
          />
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          <div className="min-h-[250px]">
            {blocks.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-14 bg-paper-white border border-dashed border-mist-border rounded-lg text-center shadow-xs">
                <div className="w-14 h-14 bg-chalk-canvas rounded-full flex items-center justify-center text-slate-veil mb-3">
                  <Plus size={28} />
                </div>
                <h3 className="text-base font-bold text-ink-charcoal mb-1">Chưa có hoạt động nào</h3>
                <p className="text-xs text-slate-veil max-w-sm">Bắt đầu bằng cách thêm thẻ hoạt động thủ công hoặc dùng thanh công cụ nạp thông minh phía dưới.</p>
              </div>
            ) : (
              blocks.map((block, index) => (
                <BlockItem key={block.id} block={block} index={index} />
              ))
            )}
          </div>
        </SortableContext>
      </DndContext>

      <div className="pt-4 pb-14 flex flex-wrap items-center justify-center gap-3">
        <button 
          onClick={openSmartBookModal} 
          className="text-iris-bolt font-semibold text-xs px-5 py-2.5 rounded-full bg-paper-white border border-iris-bolt hover:bg-lilac-wash transition-colors shadow-xs cursor-pointer"
        >
          Nạp từ Sách
        </button>
        <button 
          onClick={openPdfScannerModal} 
          className="text-iris-bolt font-semibold text-xs px-5 py-2.5 rounded-full bg-paper-white border border-iris-bolt hover:bg-lilac-wash transition-colors shadow-xs cursor-pointer"
        >
          Quét PDF AI
        </button>
        <button 
          onClick={openTemplateModal} 
          className="text-iris-bolt font-semibold text-xs px-5 py-2.5 rounded-full bg-paper-white border border-iris-bolt hover:bg-lilac-wash transition-colors shadow-xs cursor-pointer"
        >
          Mẫu giáo án
        </button>
        <div className="w-[1px] h-6 bg-mist-border mx-2" />
        <button 
          onClick={openAddActivityModal} 
          className="bg-iris-bolt text-paper-white font-semibold text-xs px-7 py-2.5 rounded-full hover:opacity-90 shadow-sm transition-opacity cursor-pointer"
        >
          + Thêm hoạt động
        </button>
      </div>
    </div>
  );
};