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
    case 'wortschatz': return <Sparkles size={16} className="text-purple-600" />;
    case 'lesen': return <BookOpen size={16} className="text-cyan-600" />;
    case 'grammatik': return <Bookmark size={16} className="text-violet-600" />;
    case 'sprechen': return <MessageSquare size={16} className="text-blue-600" />;
    case 'schreiben': return <PenTool size={16} className="text-pink-600" />;
    case 'hören': return <Headphones size={16} className="text-orange-600" />;
    default: return <HelpCircle size={16} className="text-slate-600" />;
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
            background-color: #f1f5f9;
          }
          100% {
            transform: rotateY(-180deg);
            background-color: #e2e8f0;
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
        <div className="absolute inset-0 flex shadow-xl rounded-sm overflow-hidden">
          <div className="w-1/2 h-full bg-blue-600 border-r border-blue-700"></div>
          <div className="w-1/2 h-full bg-blue-600 border-l border-blue-700"></div>
        </div>

        <div className="absolute top-[2px] left-[4px] w-[36px] h-[52px] bg-slate-100 rounded-l-xs border-r border-slate-300"></div>
        <div className="absolute top-[2px] right-[4px] w-[36px] h-[52px] bg-slate-100 rounded-r-xs border-l border-slate-300"></div>

        <div className="absolute top-[2px] right-[4px] w-[36px] h-[52px] bg-white rounded-r-xs shadow-xs flipping-page-scanner"></div>

        <div className="absolute w-[2px] h-[56px] bg-blue-900 rounded-full z-10"></div>
      </div>

      <div className="text-center">
        <h4 className="text-sm font-extrabold text-blue-900 tracking-wide">{text}</h4>
        <p className="text-xs text-blue-600 animate-pulse mt-1">Đang bóc tách từ vựng, ngữ pháp và bài đọc chi tiết...</p>
      </div>
    </div>
  );
};

export const PdfScannerModal: React.FC = () => {
  const { isPdfScannerModalOpen, closePdfScannerModal, addBlock, updateLessonInfo } = useLessonStore();
  
  const [files, setFiles] = useState<File[]>([]);
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'preview'>('idle');
  const [progressMsg, setProgressMsg] = useState('');
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
    setProgressMsg('AI đang quét và trích xuất dữ liệu...');

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h3 className="text-base font-extrabold text-blue-900 flex items-center gap-2">
              <FileUp size={18} className="text-blue-600" /> AI Deep Scanner
            </h3>
            <p className="text-xs text-blue-600/80">Quét một hoặc nhiều file PDF/Ảnh cùng lúc</p>
          </div>
          <button onClick={closePdfScannerModal} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white"><X size={18} /></button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/30">
          {scanState === 'idle' && (
            <div className="space-y-4">
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-blue-300 hover:border-blue-500 rounded-2xl bg-blue-50/30 hover:bg-blue-50/70 cursor-pointer transition-all group">
                <UploadCloud size={48} className="text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-bold text-slate-700">Tải lên file (Hỗ trợ chọn nhiều file)</p>
                <p className="text-xs text-slate-500 mt-2">Bao gồm PDF dung lượng lớn hoặc hàng loạt file Ảnh</p>
                <input type="file" multiple className="hidden" accept=".pdf,image/*" onChange={handleFileChange} />
              </label>

              {files.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-600">Đã chọn {files.length} file:</h4>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                    {files.map((file, i) => (
                      <div key={i} className="flex items-center justify-between bg-white border border-slate-200 p-2 rounded-lg">
                        <span className="text-xs text-slate-700 truncate mr-2">{file.name}</span>
                        <button onClick={() => removeFile(i)} className="text-slate-400 hover:text-red-500"><Trash2 size={14}/></button>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end mt-4">
                    <button onClick={startScanning} className="flex items-center gap-2 text-sm font-bold px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-md">
                      <Sparkles size={16} /> Bắt đầu Quét AI
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
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                <div>
                  <h4 className="font-bold text-emerald-900 text-sm">Chủ đề: {extracted.topic || 'Không xác định'}</h4>
                  <p className="text-xs text-emerald-700 font-medium mt-1">AI đã bóc tách thành {extracted.blocks.length} hoạt động độc lập.</p>
                </div>
                <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-lg shadow-sm">Niveau {extracted.level || 'A1'}</span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {extracted.blocks.map((block, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 shrink-0">
                      {getBlockIcon(block.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-bold text-slate-800 text-sm">{block.title}</h5>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase tracking-wider">{block.type}</span>
                      </div>
                      
                      {block.type === 'Wortschatz' && block.data?.vocabulary && (
                        <div className="mt-2 border border-slate-200 rounded-lg overflow-hidden">
                          <div className="bg-purple-50 text-purple-800 text-xs font-bold p-2 flex justify-between items-center">
                            <span><ListFilter size={14} className="inline mr-1" /> Tìm thấy {block.data.vocabulary.length} từ vựng</span>
                          </div>
                          <div className="max-h-60 overflow-y-auto bg-slate-50/50">
                            <table className="w-full text-xs text-left">
                              <tbody className="divide-y divide-slate-100">
                                {block.data.vocabulary.map((v: any, i: number) => (
                                  <tr key={i} className="hover:bg-white">
                                    <td className="p-2 w-1/3 font-bold text-slate-800">
                                      {v.article !== '-' && <span className="text-blue-600 mr-1">{v.article}</span>}
                                      {v.german}
                                    </td>
                                    <td className="p-2 w-1/3 text-slate-600">{v.translation}</td>
                                    <td className="p-2 w-1/3 text-slate-500 italic hidden sm:table-cell">{v.example}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                      
                      {block.type === 'Lesen' && block.data?.readingText && (
                        <div className="mt-2 text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 max-h-40 overflow-y-auto" dangerouslySetInnerHTML={{ __html: block.data.readingText }} />
                      )}

                      {block.type !== 'Wortschatz' && block.type !== 'Lesen' && block.content && (
                        <div className="mt-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100" dangerouslySetInnerHTML={{ __html: block.content }} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {scanState === 'preview' && (
          <div className="p-4 border-t border-slate-100 bg-white flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10 relative">
            <button onClick={() => { setScanState('idle'); setExtracted(null); setFiles([]); }} className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-4 py-2">
              ← Quét lại
            </button>
            <button onClick={handleApplyToLesson} className="flex items-center gap-2 text-sm font-bold px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-md">
              <CheckCircle2 size={18} /> Đưa toàn bộ vào Giáo án
            </button>
          </div>
        )}
      </div>
    </div>
  );
};