import React, { useState } from 'react';
import { X, Scissors, UploadCloud, Download, Loader2 } from 'lucide-react';
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-charcoal/40 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={closePdfCutterModal}
    >
      <div
        className="bg-paper-white border border-mist-border rounded-[24px] w-full max-w-md shadow-md overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 px-6 border-b border-mist-border flex items-center justify-between bg-chalk-canvas">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-lilac-wash text-iris-bolt flex items-center justify-center">
              <Scissors size={16} />
            </div>
            <div>
              <h3 className="text-base font-bold text-ink-charcoal">Cắt File PDF Nhanh</h3>
              <p className="text-xs text-slate-veil">Trích xuất đoạn trang sách cần dùng và tải về máy</p>
            </div>
          </div>
          <button
            onClick={closePdfCutterModal}
            className="p-1.5 rounded-full text-slate-veil hover:text-ink-charcoal hover:bg-mist-border transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSliceAndDownload} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-veil mb-1.5">
              Chọn File PDF gốc (Hỗ trợ cả sách dày 50MB - 100MB):
            </label>
            <label className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-mist-border hover:border-iris-bolt rounded-lg bg-chalk-canvas cursor-pointer transition-colors text-center">
              <UploadCloud size={28} className="text-iris-bolt mb-1" />
              <span className="text-xs font-bold text-ink-charcoal">
                {file ? file.name : 'Nhấp để chọn file PDF'}
              </span>
              <span className="text-[11px] text-slate-veil mt-0.5">
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

          <div className="grid grid-cols-2 gap-3 bg-chalk-canvas p-3.5 rounded-lg border border-mist-border">
            <div>
              <label className="block text-[11px] font-semibold text-slate-veil mb-1">
                Từ trang:
              </label>
              <input
                type="number"
                min={1}
                required
                value={startPage}
                onChange={(e) => setStartPage(Number(e.target.value))}
                className="w-full text-xs p-2 rounded bg-paper-white border border-mist-border font-bold text-ink-charcoal focus:outline-none focus:border-iris-bolt"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-veil mb-1">
                Đến trang:
              </label>
              <input
                type="number"
                min={1}
                required
                value={endPage}
                onChange={(e) => setEndPage(Number(e.target.value))}
                className="w-full text-xs p-2 rounded bg-paper-white border border-mist-border font-bold text-ink-charcoal focus:outline-none focus:border-iris-bolt"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              disabled={isProcessing}
              onClick={closePdfCutterModal}
              className="text-xs font-semibold px-4 py-2 text-slate-veil hover:text-ink-charcoal disabled:opacity-50 cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isProcessing || !file}
              className="flex items-center gap-1.5 text-xs font-semibold px-6 py-2.5 rounded-full bg-iris-bolt hover:opacity-90 text-paper-white shadow-xs disabled:opacity-50 transition-opacity cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Đang cắt trang...</span>
                </>
              ) : (
                <>
                  <Download size={14} />
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