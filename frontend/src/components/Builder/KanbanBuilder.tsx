import React from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Sparkles, Plus, FileText, ArrowRight, Book, FileUp, FolderOpen, Trash2, Check, Loader2 } from 'lucide-react';
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

  // --- MÀN HÌNH TỔNG QUAN (Đã phục hồi banner ảnh nền & khối màu) ---
  if (activeTab === 'overview') {
    return (
      <div className="max-w-5xl mx-auto p-4 sm:p-8 animate-in fade-in duration-300">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Chào buổi sáng, Giáo viên! <span className="text-amber-500 inline-block animate-bounce origin-bottom">👋</span></h1>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2">Sẵn sàng tạo nên một ngày học thật nhiều cảm hứng?</p>
          </div>
          <button 
            onClick={createEmptyLesson}
            className="hidden sm:flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-2xl font-bold text-sm shadow-md shadow-indigo-500/20 transition-all hover:scale-105"
          >
            <Plus size={18} /> Soạn từ trang trắng
          </button>
        </div>

        <div className="w-full mb-10">
          <div className="relative bg-slate-900 dark:bg-slate-950 rounded-[2rem] p-10 overflow-hidden shadow-xl flex flex-col justify-center min-h-[260px]">
            <div className="relative z-10 max-w-xl">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/20 shadow-sm mb-6">
                <Sparkles size={24} />
              </div>
              <h2 className="text-3xl font-black text-white leading-tight mb-4">Mỗi bài giảng <br/> là một hành trình.</h2>
              <p className="text-sm text-slate-300 mb-8 leading-relaxed max-w-md">Khơi nguồn sáng tạo với trợ lý AI chuyên biệt cho việc soạn đề thi và giáo án chuẩn CEFR. Tiết kiệm 80% thời gian chuẩn bị.</p>
              <button onClick={openAIModal} className="flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-900 px-6 py-3 rounded-2xl font-bold text-sm shadow-sm transition-all hover:translate-x-2">
                Khám phá trợ lý AI <ArrowRight size={16} />
              </button>
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-1/2 md:w-3/5 bg-[url('https://images.unsplash.com/photo-1571260899304-425dea4cf715?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center opacity-60 dark:opacity-40 rounded-l-[4rem] mix-blend-luminosity"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent pointer-events-none"></div>
          </div>
        </div>

        <div className="mb-10">
          <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4 px-1">Công cụ khởi tạo nhanh</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <button onClick={openSmartBookModal} className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10 transition-all text-left group flex flex-col justify-between">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Book size={24} /></div>
              <div><p className="text-sm font-bold text-slate-800 dark:text-slate-200">Nạp từ Sách</p><p className="text-xs text-slate-500 mt-1">Lấy từ kho Admin</p></div>
            </button>
            
            <button onClick={openPdfScannerModal} className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-500/10 transition-all text-left group flex flex-col justify-between">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><FileUp size={24} /></div>
              <div><p className="text-sm font-bold text-slate-800 dark:text-slate-200">Quét PDF AI</p><p className="text-xs text-slate-500 mt-1">Bóc tách tự động</p></div>
            </button>

            <button onClick={openTemplateModal} className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-500 hover:shadow-xl hover:shadow-purple-500/10 transition-all text-left group flex flex-col justify-between">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><FolderOpen size={24} /></div>
              <div><p className="text-sm font-bold text-slate-800 dark:text-slate-200">Mẫu giáo án</p><p className="text-xs text-slate-500 mt-1">Cấu trúc chuẩn</p></div>
            </button>

            <button onClick={openAddActivityModal} className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-500/10 transition-all text-left group flex flex-col justify-between">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Plus size={24} /></div>
              <div><p className="text-sm font-bold text-slate-800 dark:text-slate-200">Thêm thủ công</p><p className="text-xs text-slate-500 mt-1">Tự tạo hoạt động</p></div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- MÀN HÌNH DANH SÁCH GIÁO ÁN CỦA TÔI (Đã phục hồi Table xịn xò) ---
  if (activeTab === 'my_lessons') {
    return (
      <div className="max-w-5xl mx-auto p-4 sm:p-8 animate-in fade-in duration-300 relative">
        {isLoadingLesson && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/70 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl">
            <Loader2 size={40} className="animate-spin text-indigo-600 mb-4" />
            <p className="font-bold text-slate-800 dark:text-white">Đang tải giáo án...</p>
            <p className="text-xs font-medium text-slate-500 mt-1">Vui lòng chờ trong giây lát</p>
          </div>
        )}

        <div className="flex items-end justify-between mb-8 px-2 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Giáo án & Đề thi của bạn</h1>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Tổng số: {myLessons.length} bài giảng đã lưu trên Cloud.</p>
          </div>
          <button 
            onClick={createEmptyLesson}
            className="hidden sm:flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-indigo-500/20 transition-all"
          >
            <Plus size={18} /> Soạn bài mới
          </button>
        </div>
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 dark:bg-slate-800/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-4 pl-6 w-1/2">Tên Bài Giảng / Đề Thi</th>
                <th className="p-4 text-center w-1/6">Cấp độ</th>
                <th className="p-4 text-center w-1/6">Trạng thái</th>
                <th className="p-4 text-right pr-6 w-1/6">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {myLessons.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-16 text-center text-slate-500 text-sm bg-slate-50/30 dark:bg-slate-800/30">
                    <FolderOpen size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                    <p className="font-semibold text-slate-600 dark:text-slate-400">Chưa có giáo án nào.</p>
                    <p className="text-xs mt-1">Hãy bấm "Soạn bài mới" để bắt đầu!</p>
                  </td>
                </tr>
              ) : (
                myLessons.map((lesson) => (
                  <tr 
                    key={lesson.id} 
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors group cursor-pointer" 
                    onClick={() => loadLessonById(lesson.id!)}
                  >
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 ring-1 ring-indigo-500/20 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                          <FileText size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors truncate text-[15px]">{lesson.title || 'Bài giảng không tên'}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{lesson.topic || 'Chưa phân loại chủ đề'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                        {lesson.level || 'A1'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-flex px-3 py-1 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
                        Đã lưu Cloud
                      </span>
                    </td>
                    <td className="p-4 text-right pr-6">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => handleDeleteLesson(e, lesson.id!)} 
                          className="p-2 text-slate-400 hover:text-rose-600 bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors border border-slate-200 dark:border-slate-700 hover:border-rose-200"
                          title="Xóa vĩnh viễn giáo án này"
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

  // --- MÀN HÌNH EDITOR (SOẠN THẢO) CHI TIẾT ---
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-wrap items-center justify-between p-4 px-6 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-2xl shadow-sm gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse shrink-0"></div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-indigo-950 dark:text-indigo-200 truncate">
              Chế độ chỉnh sửa chi tiết (Soạn thảo)
            </p>
            <p className="text-xs font-medium text-indigo-700/80 dark:text-indigo-400/80 truncate mt-0.5">
              Sau khi chỉnh sửa xong, bấm hoàn tất để trở về xem đề thi. Kéo thả các thẻ để sắp xếp.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setViewMode('student')}
          className="flex items-center gap-2 text-xs font-bold px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95 shrink-0"
        >
          <Check size={16} /> Hoàn tất & Thoát sửa
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Thema (Chủ đề)</label>
            <input 
              type="text" 
              value={lessonInfo.topic} 
              onChange={(e) => updateLessonInfo({ topic: e.target.value })} 
              className="w-full text-sm font-bold p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white transition-all" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Niveau (Trình độ)</label>
            <select 
              value={lessonInfo.level} 
              onChange={(e) => updateLessonInfo({ level: e.target.value as CEFRLevel })} 
              className="w-full text-sm font-bold p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white transition-all"
            >
              {['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'TDN3', 'TDN4', 'TDN5'].map((lvl) => (
                <option key={lvl} value={lvl}>{lvl}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Gesamtdauer (Phút)</label>
            <input 
              type="number" 
              value={lessonInfo.targetDuration === 0 ? '' : lessonInfo.targetDuration} 
              onChange={(e) => {
                const val = e.target.value;
                updateLessonInfo({ targetDuration: val === '' ? 0 : Number(val) });
              }} 
              placeholder="0"
              className="w-full text-sm font-bold p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white transition-all" 
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Lernziel (Mục tiêu bài học)</label>
          <input 
            type="text" 
            value={lessonInfo.objectives} 
            onChange={(e) => updateLessonInfo({ objectives: e.target.value })} 
            className="w-full text-sm font-medium p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white transition-all" 
          />
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          <div className="min-h-[300px]">
            {blocks.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-16 mt-8 bg-slate-50/50 dark:bg-slate-800/20 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-[2rem] text-center">
                <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-3xl shadow-sm flex items-center justify-center text-slate-400 dark:text-slate-500 mb-5">
                  <Plus size={40} />
                </div>
                <h3 className="text-lg font-extrabold text-slate-800 dark:text-white mb-2">Chưa có hoạt động nào</h3>
                <p className="text-sm text-slate-500 font-medium max-w-sm">Bắt đầu bằng cách thêm các block thủ công hoặc sử dụng tính năng nạp thông minh ở dưới.</p>
              </div>
            ) : (
              blocks.map((block, index) => (
                <BlockItem key={block.id} block={block} index={index} />
              ))
            )}
          </div>
        </SortableContext>
      </DndContext>

      <div className="pt-6 pb-12 flex flex-wrap items-center justify-center gap-4 mt-8">
        <button onClick={openSmartBookModal} className="flex items-center gap-2 text-sm font-bold px-6 py-3 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-400 hover:bg-blue-100 transition-colors shadow-sm hover:-translate-y-0.5">
          <Book size={18} /> Nạp từ Sách
        </button>
        <button onClick={openPdfScannerModal} className="flex items-center gap-2 text-sm font-bold px-6 py-3 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 transition-colors shadow-sm hover:-translate-y-0.5">
          <FileUp size={18} /> Quét PDF AI
        </button>
        <button onClick={openTemplateModal} className="flex items-center gap-2 text-sm font-bold px-6 py-3 rounded-2xl bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 text-purple-700 dark:text-purple-400 hover:bg-purple-100 transition-colors shadow-sm hover:-translate-y-0.5">
          <FolderOpen size={18} /> Mẫu giáo án
        </button>
        <div className="w-[1px] h-8 bg-slate-200 mx-2" />
        <button onClick={openAddActivityModal} className="flex items-center gap-2 text-sm font-bold px-8 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 shadow-md transition-all hover:scale-105">
          <Plus size={18} /> Thêm hoạt động
        </button>
      </div>
    </div>
  );
};