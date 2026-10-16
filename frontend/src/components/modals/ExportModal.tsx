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
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-charcoal/40 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={closeExportModal}
    >
      <div
        className="bg-paper-white border border-mist-border rounded-[24px] w-full max-w-md shadow-md overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 px-6 border-b border-mist-border flex items-center justify-between bg-chalk-canvas">
          <div>
            <h3 className="text-base font-bold text-ink-charcoal">
              Xuất tệp Bài giảng / Đề thi
            </h3>
            <p className="text-xs text-slate-veil">Chọn định dạng và đối tượng sử dụng</p>
          </div>
          <button
            type="button"
            onClick={closeExportModal}
            className="p-1.5 rounded-full text-slate-veil hover:text-ink-charcoal hover:bg-mist-border transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-veil mb-2">
              Đối tượng nhận tài liệu:
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setTargetAudience('student')}
                className={`p-3.5 rounded-lg border text-left flex flex-col justify-between gap-2 transition-all cursor-pointer ${
                  isStudent
                    ? 'border-iris-bolt bg-lilac-wash text-iris-bolt font-semibold shadow-xs'
                    : 'border-mist-border bg-paper-white text-slate-veil hover:text-ink-charcoal hover:bg-chalk-canvas'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <GraduationCap size={18} className={isStudent ? 'text-iris-bolt' : 'text-slate-veil'} />
                  {isStudent && <Check size={14} className="text-iris-bolt" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-ink-charcoal">Bản Học Sinh</div>
                  <div className="text-[11px] opacity-80 font-normal">Ẩn đáp án & giải thích</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTargetAudience('teacher')}
                className={`p-3.5 rounded-lg border text-left flex flex-col justify-between gap-2 transition-all cursor-pointer ${
                  !isStudent
                    ? 'border-iris-bolt bg-lilac-wash text-iris-bolt font-semibold shadow-xs'
                    : 'border-mist-border bg-paper-white text-slate-veil hover:text-ink-charcoal hover:bg-chalk-canvas'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <BookOpen size={18} className={!isStudent ? 'text-iris-bolt' : 'text-slate-veil'} />
                  {!isStudent && <Check size={14} className="text-iris-bolt" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-ink-charcoal">Bản Giáo Viên</div>
                  <div className="text-[11px] opacity-80 font-normal">Hiện đáp án & lời giải</div>
                </div>
              </button>
            </div>
          </div>

          <div className="space-y-2.5 pt-2 border-t border-mist-border">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-veil">
              Chọn định dạng xuất file:
            </label>

            <button
              type="button"
              onClick={() => {
                exportService.exportToPdf(lessonInfo, blocks, isStudent);
                closeExportModal();
              }}
              className="w-full flex items-center gap-3.5 p-3.5 rounded-lg border border-mist-border hover:border-iris-bolt hover:bg-chalk-canvas text-left transition-colors cursor-pointer"
            >
              <div className="p-2 rounded bg-lilac-wash text-iris-bolt">
                <Printer size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-ink-charcoal">Drucken / In ra PDF A4</h4>
                <p className="text-[11px] text-slate-veil">
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
              className="w-full flex items-center gap-3.5 p-3.5 rounded-lg border border-mist-border hover:border-iris-bolt hover:bg-chalk-canvas text-left transition-colors cursor-pointer"
            >
              <div className="p-2 rounded bg-lilac-wash text-iris-bolt">
                <FileText size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-ink-charcoal">Microsoft Word (.doc)</h4>
                <p className="text-[11px] text-slate-veil">Xuất file văn bản chuẩn để chỉnh sửa thêm trên Word</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};