import React, { useState, useEffect } from 'react';
import { X, Book, FileText, ChevronRight, Search, RotateCw, Sparkles } from 'lucide-react';
import { useLessonStore } from '../../store/useLessonStore';
import { apiRequest } from '../../services/apiClient';
import { BookModel, LektionModel } from '../../types/lesson';

const LEVELS = ['Alle', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const BookOpeningLoader: React.FC<{ text?: string }> = ({ text = 'Đang lật mở trang sách...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <style>{`
        @keyframes flipPage {
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
        .perspective-book {
          perspective: 600px;
        }
        .flipping-page {
          transform-origin: left center;
          animation: flipPage 1.1s infinite ease-in-out;
        }
      `}</style>

      <div className="relative w-16 h-12 perspective-book flex items-center justify-center">
        <div className="absolute inset-0 flex shadow-lg rounded-sm overflow-hidden">
          <div className="w-1/2 h-full bg-blue-600 border-r border-blue-700"></div>
          <div className="w-1/2 h-full bg-blue-600 border-l border-blue-700"></div>
        </div>

        <div className="absolute top-[2px] left-[3px] w-[29px] h-[44px] bg-slate-100 rounded-l-xs border-r border-slate-300"></div>
        <div className="absolute top-[2px] right-[3px] w-[29px] h-[44px] bg-slate-100 rounded-r-xs border-l border-slate-300"></div>

        <div className="absolute top-[2px] right-[3px] w-[29px] h-[44px] bg-white rounded-r-xs shadow-xs flipping-page"></div>

        <div className="absolute w-[2px] h-[48px] bg-blue-900 rounded-full z-10"></div>
      </div>

      <div className="text-center">
        <p className="text-xs font-extrabold text-blue-700 tracking-wide animate-pulse">{text}</p>
        <p className="text-[10px] text-slate-400 mt-0.5">Vui lòng chờ trong giây lát</p>
      </div>
    </div>
  );
};

export const SmartBookModal: React.FC = () => {
  const { isSmartBookModalOpen, closeSmartBookModal, importFromBook } = useLessonStore();
  
  const [books, setBooks] = useState<BookModel[]>([]);
  const [selectedBook, setSelectedBook] = useState<BookModel | null>(null);
  const [lektions, setLektions] = useState<LektionModel[]>([]);
  const [isLoadingBooks, setIsLoadingBooks] = useState(false);
  const [isLoadingLektions, setIsLoadingLektions] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState('Alle');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isSmartBookModalOpen) {
      fetchBooks();
    }
  }, [isSmartBookModalOpen]);

  const fetchBooks = async () => {
    setIsLoadingBooks(true);
    try {
      const res = await apiRequest('/books');
      if (res.ok) {
        const data = await res.json();
        setBooks(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingBooks(false);
    }
  };

  const handleSelectBook = async (book: BookModel) => {
    if (selectedBook?.id === book.id) return;
    setSelectedBook(book);
    setIsLoadingLektions(true);
    try {
      const res = await apiRequest(`/books/${book.id}/lektions`);
      if (res.ok) {
        const data = await res.json();
        setLektions(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingLektions(false);
    }
  };

  const filteredBooks = books.filter((b) => {
    const bookLevel = (b.level || '').toUpperCase();
    const matchLevel = selectedLevel === 'Alle' || bookLevel === selectedLevel.toUpperCase();
    const bookTitle = (b.title || '').toLowerCase();
    const bookPublisher = (b.publisher || '').toLowerCase();
    const query = searchTerm.toLowerCase().trim();
    const matchSearch = bookTitle.includes(query) || bookPublisher.includes(query);
    return matchLevel && matchSearch;
  });

  if (!isSmartBookModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 transition-all duration-300"
      onClick={closeSmartBookModal}
    >
      <div
        className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl overflow-hidden select-none animate-in fade-in zoom-in-95 duration-200 ease-out"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <Book size={20} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-blue-950 flex items-center gap-2">
                Nạp dữ liệu từ Giáo trình chính quy
                <Sparkles size={14} className="text-amber-500" />
              </h3>
              <p className="text-xs text-blue-700/70">
                Chọn bộ giáo trình từ A1 - C2 và bài học tương ứng để tự động nạp từ vựng và ngữ pháp
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={fetchBooks}
              className="p-2 rounded-xl text-blue-600 hover:bg-blue-100/70 transition-all hover:rotate-180 duration-500"
              title="Tải lại danh sách sách"
            >
              <RotateCw size={16} />
            </button>
            <button
              type="button"
              onClick={closeSmartBookModal}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-3 px-6 border-b border-slate-100 bg-white flex flex-wrap items-center justify-between gap-3 shadow-xs z-10">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-slate-400 uppercase mr-1">Trình độ:</span>
            {LEVELS.map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 ${
                  selectedLevel === lvl
                    ? 'bg-blue-600 text-white shadow-xs scale-105'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200 focus-within:bg-white focus-within:border-blue-500 transition-all duration-200 w-full sm:w-64">
            <Search size={14} className="text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Tìm theo tên sách hoặc NXB..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs bg-transparent focus:outline-none text-slate-800"
            />
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="w-1/2 border-r border-slate-100 p-4 overflow-y-auto bg-slate-50/40">
            <div className="flex justify-between items-center mb-3 px-1">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                1. Danh sách Sách ({filteredBooks.length})
              </h4>
            </div>

            {isLoadingBooks ? (
              <BookOpeningLoader text="Đang tải danh mục giáo trình..." />
            ) : filteredBooks.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <Book size={36} className="mx-auto text-slate-300" />
                <p className="text-xs text-slate-400 font-medium">Không tìm thấy cuốn sách nào phù hợp.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredBooks.map((book) => {
                  const isSelected = selectedBook?.id === book.id;
                  return (
                    <button
                      key={book.id}
                      onClick={() => handleSelectBook(book)}
                      className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all duration-200 ${
                        isSelected
                          ? 'bg-blue-50/80 border-blue-300 shadow-sm translate-x-1'
                          : 'bg-white border-slate-200 hover:border-blue-200 hover:bg-slate-50/80'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md border ${
                            isSelected ? 'bg-blue-600 text-white border-blue-600' : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            {book.level}
                          </span>
                          <h5 className={`text-sm font-bold truncate transition-colors ${
                            isSelected ? 'text-blue-900' : 'text-slate-800'
                          }`}>
                            {book.title}
                          </h5>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">{book.publisher || 'Nhà xuất bản chuẩn'}</p>
                      </div>
                      <ChevronRight size={16} className={`shrink-0 transition-transform duration-200 ${
                        isSelected ? 'text-blue-600 translate-x-1' : 'text-slate-300'
                      }`} />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="w-1/2 p-4 overflow-y-auto bg-white">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-1">
              2. Chọn bài học (Lektion)
            </h4>

            {!selectedBook ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12 space-y-2">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                  <Book size={28} className="text-slate-300" />
                </div>
                <p className="text-xs font-medium">Vui lòng chọn một cuốn sách ở cột bên trái</p>
              </div>
            ) : isLoadingLektions ? (
              <BookOpeningLoader text={`Đang mở các Lektion của ${selectedBook.title}...`} />
            ) : lektions.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <FileText size={36} className="mx-auto text-slate-300" />
                <p className="text-xs text-slate-400 font-medium">Cuốn sách này chưa có dữ liệu Lektion.</p>
              </div>
            ) : (
              <div className="space-y-2 animate-in fade-in slide-in-from-right-3 duration-300 ease-out">
                {lektions.map((lektion) => (
                  <button
                    key={lektion.id}
                    onClick={() => importFromBook(lektion.id)}
                    className="w-full flex items-start gap-3 p-3.5 rounded-xl bg-white border border-slate-200 hover:border-purple-400 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-left group"
                  >
                    <div className="p-2 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-purple-50 group-hover:text-purple-600 transition-colors shrink-0">
                      <FileText size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-extrabold text-purple-700 uppercase tracking-wider">
                        Lektion {lektion.lektionNumber}
                      </span>
                      <h5 className="text-xs font-bold text-slate-800 group-hover:text-purple-700 leading-tight mt-0.5 truncate transition-colors">
                        {lektion.title}
                      </h5>
                      {lektion.theme && (
                        <p className="text-[11px] text-slate-500 mt-1 truncate">{lektion.theme}</p>
                      )}
                    </div>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-purple-500 group-hover:translate-x-1 transition-all self-center shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};