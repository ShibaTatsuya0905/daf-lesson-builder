import React, { useState } from 'react';
import { X, UploadCloud, CheckCircle2, FileUp, Sparkles, BookOpen, MessageSquare, Bookmark, HelpCircle, PenTool, Headphones, ListFilter, Trash2 } from 'lucide-react';
import { useLessonStore } from '../../store/useLessonStore';
import { aiService } from '../../services/aiService';

interface DynamicBlock {
  type: string;
  title: string;
  duration: number;
  content: string;
  tags: string[];
  data: any;
}

interface DynamicExtraction {
  topic: string;
  level: any;
  blocks: DynamicBlock[];
}

const getBlockIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'wortschatz': return <Sparkles size={16} className="text-iris-bolt" />;
    case 'lesen': return <BookOpen size={16} className="text-iris-bolt" />;
    case 'grammatik': return <Bookmark size={16} className="text-iris-bolt" />;
    case 'sprechen': return <MessageSquare size={16} className="text-iris-bolt" />;
    case 'schreiben': return <PenTool size={16} className="text-iris-bolt" />;
    case 'hören': return <Headphones size={16} className="text-iris-bolt" />;
    default: return <HelpCircle size={16} className="text-slate-veil" />;
  }
};

const BookScanningLoader: React.FC<{ text?: string }> = ({ text = 'AI đang lật mở từng trang sách...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-14 space-y-4">
      <style>{`
        @keyframes flipPageScanner {
          0% {
            transform: rotateY(0deg);
            background-color: #ffffff;
          }
          50% {
            transform: rotateY(-90deg);
            background-color: #f6f7fb;
          }
          100% {
            transform: rotateY(-180deg);
            background-color: #d9dde8;
          }
        }
        .perspective-book-scanner {
          perspective: 600px;
        }
        .flipping-page-scanner {
          transform-origin: left center;
          animation: flipPageScanner 1s infinite ease-in-out;
        }
      `}</style>

      <div className="relative w-20 h-14 perspective-book-scanner flex items-center justify-center">
        <div className="absolute inset-0 flex shadow-sm rounded-sm overflow-hidden">
          <div className="w-1/2 h-full bg-iris-bolt border-r border-iris-bolt/80"></div>
          <div className="w-1/2 h-full bg-iris-bolt border-l border-iris-bolt/80"></div>
        </div>

        <div className="absolute top-[2px] left-[4px] w-[36px] h-[52px] bg-chalk-canvas rounded-l-xs border-r border-mist-border"></div>
        <div className="absolute top-[2px] right-[4px] w-[36px] h-[52px] bg-chalk-canvas rounded-r-xs border-l border-mist-border"></div>

        <div className="absolute top-[2px] right-[4px] w-[36px] h-[52px] bg-paper-white rounded-r-xs shadow-xs flipping-page-scanner"></div>

        <div className="absolute w-[2px] h-[56px] bg-deep-indigo rounded-full z-10"></div>
      </div>

      <div className="text-center">
        <h4 className="text-sm font-bold text-ink-charcoal tracking-wide">{text}</h4>
        <p className="text-xs text-iris-bolt animate-pulse mt-1">Đang bóc tách từ vựng, ngữ pháp và bài đọc chi tiết...</p>
      </div>
    </div>
  );
};

export const PdfScannerModal: React.FC = () => {
  const { isPdfScannerModalOpen, closePdfScannerModal, addBlock, updateLessonInfo } = useLessonStore();
  
  const [files, setFiles] = useState<File[]>([]);
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'preview'>('idle');
  const [extracted, setExtracted] = useState<DynamicExtraction | null>(null);

  if (!isPdfScannerModalOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const startScanning = async () => {
    if (files.length === 0) return;
    setScanState('scanning');

    try {
      const extractedResult = await aiService.scanDocument(files);
      setExtracted(extractedResult);
      setScanState('preview');
    } catch (error: any) {
      alert(`Lỗi: ${error.message}`);
      setScanState('idle');
    }
  };

  const handleApplyToLesson = () => {
    if (!extracted) return;

    updateLessonInfo({
      topic: extracted.topic,
      level: extracted.level,
      objectives: `Tài liệu quét từ AI: ${extracted.topic}`,
    });

    extracted.blocks.forEach((b) => {
      addBlock(
        b.type, 
        b.title || `${b.type} trích xuất`, 
        b.duration || 15, 
        b.content || '', 
        b.tags || ['🤖 AI Scanner'], 
        b.data || {}
      );
    });

    closePdfScannerModal();
    setScanState('idle');
    setFiles([]);
    setExtracted(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-charcoal/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-paper-white border border-mist-border rounded-[24px] w-full max-w-4xl max-h-[90vh] flex flex-col shadow-md overflow-hidden animate-in zoom-in-95 duration-150">
        
        <div className="p-5 px-6 border-b border-mist-border flex items-center justify-between bg-chalk-canvas">
          <div>
            <h3 className="text-base font-bold text-ink-charcoal flex items-center gap-2">
              <FileUp size={18} className="text-iris-bolt" /> AI Deep Scanner
            </h3>
            <p className="text-xs text-slate-veil">Quét một hoặc nhiều file PDF/Ảnh cùng lúc</p>
          </div>
          <button onClick={closePdfScannerModal} className="p-1.5 rounded-full text-slate-veil hover:text-ink-charcoal hover:bg-mist-border cursor-pointer"><X size={18} /></button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 bg-chalk-canvas">
          {scanState === 'idle' && (
            <div className="space-y-4">
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-mist-border hover:border-iris-bolt rounded-lg bg-paper-white cursor-pointer transition-all group">
                <UploadCloud size={40} className="text-iris-bolt mb-3 group-hover:scale-105 transition-transform" />
                <p className="text-sm font-bold text-ink-charcoal">Tải lên file (Hỗ trợ chọn nhiều file)</p>
                <p className="text-xs text-slate-veil mt-1">Bao gồm PDF dung lượng lớn hoặc hàng loạt file Ảnh</p>
                <input type="file" multiple className="hidden" accept=".pdf,image/*" onChange={handleFileChange} />
              </label>

              {files.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-slate-veil">Đã chọn {files.length} file:</h4>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                    {files.map((file, i) => (
                      <div key={i} className="flex items-center justify-between bg-paper-white border border-mist-border p-2.5 rounded">
                        <span className="text-xs text-ink-charcoal truncate mr-2 font-medium">{file.name}</span>
                        <button onClick={() => removeFile(i)} className="text-slate-veil hover:text-[#dc2626] cursor-pointer"><Trash2 size={14}/></button>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end mt-4">
                    <button onClick={startScanning} className="flex items-center gap-2 text-xs font-semibold px-6 py-2.5 rounded-full bg-iris-bolt hover:opacity-90 text-paper-white transition-opacity shadow-xs cursor-pointer">
                      <Sparkles size={15} /> Bắt đầu Quét AI
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {scanState === 'scanning' && (
            <BookScanningLoader text={`AI đang đọc và bóc tách ${files.length} tài liệu...`} />
          )}

          {scanState === 'preview' && extracted && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between bg-paper-white p-4 rounded-lg border border-mist-border shadow-xs">
                <div>
                  <h4 className="font-bold text-ink-charcoal text-sm">Chủ đề: {extracted.topic || 'Không xác định'}</h4>
                  <p className="text-xs text-slate-veil mt-0.5">AI đã bóc tách thành {extracted.blocks.length} hoạt động độc lập.</p>
                </div>
                <span className="bg-lilac-wash text-iris-bolt text-xs font-bold px-3 py-1 rounded border border-mist-border">Niveau {extracted.level || 'A1'}</span>
              </div>

              <div className="grid grid-cols-1 gap-3.5">
                {extracted.blocks.map((block, idx) => (
                  <div key={idx} className="bg-paper-white p-4 rounded-lg border border-mist-border shadow-xs flex items-start gap-4">
                    <div className="p-2.5 rounded bg-chalk-canvas text-iris-bolt shrink-0">
                      {getBlockIcon(block.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-bold text-ink-charcoal text-sm">{block.title}</h5>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-chalk-canvas text-slate-veil uppercase tracking-wider border border-mist-border">{block.type}</span>
                      </div>
                      
                      {block.type === 'Wortschatz' && block.data?.vocabulary && (
                        <div className="mt-2 border border-mist-border rounded overflow-hidden">
                          <div className="bg-chalk-canvas text-ink-charcoal text-xs font-semibold p-2 border-b border-mist-border flex justify-between items-center">
                            <span><ListFilter size={13} className="inline mr-1" /> Tìm thấy {block.data.vocabulary.length} từ vựng</span>
                          </div>
                          <div className="max-h-60 overflow-y-auto bg-paper-white">
                            <table className="w-full text-xs text-left">
                              <tbody className="divide-y divide-mist-border">
                                {block.data.vocabulary.map((v: any, i: number) => (
                                  <tr key={i} className="hover:bg-chalk-canvas">
                                    <td className="p-2 w-1/3 font-bold text-ink-charcoal">
                                      {v.article !== '-' && <span className="text-iris-bolt mr-1">{v.article}</span>}
                                      {v.german}
                                    </td>
                                    <td className="p-2 w-1/3 text-slate-veil">{v.translation}</td>
                                    <td className="p-2 w-1/3 text-fog-mist italic hidden sm:table-cell">{v.example}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                      
                      {block.type === 'Lesen' && block.data?.readingText && (
                        <div className="mt-2 text-xs text-ink-charcoal bg-chalk-canvas p-3 rounded border border-mist-border max-h-40 overflow-y-auto leading-relaxed" dangerouslySetInnerHTML={{ __html: block.data.readingText }} />
                      )}

                      {block.type !== 'Wortschatz' && block.type !== 'Lesen' && block.content && (
                        <div className="mt-2 text-xs text-slate-veil bg-chalk-canvas p-3 rounded border border-mist-border leading-relaxed" dangerouslySetInnerHTML={{ __html: block.content }} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {scanState === 'preview' && (
          <div className="p-4 px-6 border-t border-mist-border bg-paper-white flex justify-between items-center">
            <button onClick={() => { setScanState('idle'); setExtracted(null); setFiles([]); }} className="text-xs font-semibold text-slate-veil hover:text-ink-charcoal cursor-pointer">
              ← Quét lại
            </button>
            <button onClick={handleApplyToLesson} className="flex items-center gap-2 text-xs font-semibold px-6 py-2.5 rounded-full bg-iris-bolt hover:opacity-90 text-paper-white shadow-xs transition-opacity cursor-pointer">
              <CheckCircle2 size={16} /> Đưa toàn bộ vào Giáo án
            </button>
          </div>
        )}
      </div>
    </div>
  );
};