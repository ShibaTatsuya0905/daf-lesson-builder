import React, { useState } from 'react';
import { X, Printer, FileText, GraduationCap, BookOpen, Check } from 'lucide-react';
import { useLessonStore } from '../../store/useLessonStore';
import { exportService } from '../../services/exportService';

export const ExportModal: React.FC = () => {
  const { isExportModalOpen, closeExportModal, lessonInfo, blocks, viewMode } = useLessonStore();
  const [targetAudience, setTargetAudience] = useState<'student' | 'teacher'>(
    viewMode === 'student' ? 'student' : 'teacher'
  );

  if (!isExportModalOpen) return null;

  const isStudent = targetAudience === 'student';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={closeExportModal}
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 px-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Xuất tệp Bài giảng / Đề thi
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Chọn định dạng và đối tượng sử dụng</p>
          </div>
          <button
            type="button"
            onClick={closeExportModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Đối tượng nhận tài liệu:
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setTargetAudience('student')}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between gap-2 transition-all ${
                  isStudent
                    ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <GraduationCap size={18} className={isStudent ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'} />
                  {isStudent && <Check size={14} className="text-blue-600 dark:text-blue-400" />}
                </div>
                <div>
                  <div className="text-xs font-bold">Bản Học Sinh</div>
                  <div className="text-[10px] opacity-75 font-normal">Ẩn đáp án & giải thích</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTargetAudience('teacher')}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between gap-2 transition-all ${
                  !isStudent
                    ? 'border-purple-500 bg-purple-50/60 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-bold shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <BookOpen size={18} className={!isStudent ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400'} />
                  {!isStudent && <Check size={14} className="text-purple-600 dark:text-purple-400" />}
                </div>
                <div>
                  <div className="text-xs font-bold">Bản Giáo Viên</div>
                  <div className="text-[10px] opacity-75 font-normal">Hiện đáp án & lời giải</div>
                </div>
              </button>
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Chọn định dạng xuất file:
            </label>

            <button
              type="button"
              onClick={() => {
                exportService.exportToPdf(lessonInfo, blocks, isStudent);
                closeExportModal();
              }}
              className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 text-left transition-all group shadow-xs"
            >
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Printer size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Drucken / In ra PDF A4</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isStudent ? 'In đề thi giấy trắng phát cho học sinh làm bài' : 'In giáo án hoàn chỉnh kèm đáp án để giảng dạy'}
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                exportService.exportToWord(lessonInfo, blocks, isStudent);
                closeExportModal();
              }}
              className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-purple-500 hover:bg-purple-50/40 dark:hover:bg-purple-950/20 text-left transition-all group shadow-xs"
            >
              <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <FileText size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Microsoft Word (.doc)</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Xuất file văn bản chuẩn để chỉnh sửa thêm trên Word</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};