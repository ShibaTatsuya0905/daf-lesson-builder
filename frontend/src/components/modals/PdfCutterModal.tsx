import React, { useState } from 'react';
import { X, Scissors, UploadCloud, Download, Loader2, FileCheck } from 'lucide-react';
import { useLessonStore } from '../../store/useLessonStore';

export const PdfCutterModal: React.FC = () => {
  const { isPdfCutterModalOpen, closePdfCutterModal } = useLessonStore();

  const [file, setFile] = useState<File | null>(null);
  const [startPage, setStartPage] = useState<number>(1);
  const [endPage, setEndPage] = useState<number>(5);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isPdfCutterModalOpen) return null;

  const handleSliceAndDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert('Vui lòng chọn file PDF cần cắt!');
      return;
    }

    if (startPage > endPage) {
      alert('Trang bắt đầu không thể lớn hơn trang kết thúc!');
      return;
    }

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('startPage', String(startPage));
      formData.append('endPage', String(endPage));

      const res = await fetch('http://localhost:3000/api/ai/slice-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Lỗi khi cắt PDF');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cat-trang-${startPage}-den-${endPage}_${file.name}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      closePdfCutterModal();
    } catch (err: any) {
      alert(`Lỗi: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={closePdfCutterModal}
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 px-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-purple-50/50 dark:bg-purple-950/20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 flex items-center justify-center">
              <Scissors size={18} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Cắt File PDF Nhanh</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Trích xuất đoạn trang sách cần dùng và tải về ngay</p>
            </div>
          </div>
          <button
            onClick={closePdfCutterModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSliceAndDownload} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Chọn File PDF gốc (Hỗ trợ cả sách dày 50MB - 100MB):
            </label>
            <label className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-purple-200 dark:border-purple-800 rounded-2xl bg-purple-50/30 dark:bg-purple-950/10 hover:bg-purple-50/60 dark:hover:bg-purple-950/30 cursor-pointer transition-all text-center">
              <UploadCloud size={32} className="text-purple-600 dark:text-purple-400 mb-1" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {file ? file.name : 'Nhấp để chọn file PDF'}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">
                {file ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : 'PDF giáo trình hoặc tài liệu'}
              </span>
              <input
                type="file"
                className="hidden"
                accept=".pdf"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFile(e.target.files[0]);
                  }
                }}
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                Từ trang:
              </label>
              <input
                type="number"
                min={1}
                required
                value={startPage}
                onChange={(e) => setStartPage(Number(e.target.value))}
                className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                Đến trang:
              </label>
              <input
                type="number"
                min={1}
                required
                value={endPage}
                onChange={(e) => setEndPage(Number(e.target.value))}
                className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              disabled={isProcessing}
              onClick={closePdfCutterModal}
              className="text-xs font-semibold px-4 py-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isProcessing || !file}
              className="flex items-center gap-1.5 text-xs font-bold px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-sm disabled:opacity-50 transition-all"
            >
              {isProcessing ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Đang cắt trang...</span>
                </>
              ) : (
                <>
                  <Download size={15} />
                  <span>Cắt & Tải File Về</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};