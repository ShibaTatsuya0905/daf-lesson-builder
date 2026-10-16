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
            background-color: #f6f7fb;
          }
          100% {
            transform: rotateY(-180deg);
            background-color: #d9dde8;
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
        <div className="absolute inset-0 flex shadow-sm rounded-sm overflow-hidden">
          <div className="w-1/2 h-full bg-iris-bolt border-r border-iris-bolt/80"></div>
          <div className="w-1/2 h-full bg-iris-bolt border-l border-iris-bolt/80"></div>
        </div>

        <div className="absolute top-[2px] left-[3px] w-[29px] h-[44px] bg-chalk-canvas rounded-l-xs border-r border-mist-border"></div>
        <div className="absolute top-[2px] right-[3px] w-[29px] h-[44px] bg-chalk-canvas rounded-r-xs border-l border-mist-border"></div>

        <div className="absolute top-[2px] right-[3px] w-[29px] h-[44px] bg-paper-white rounded-r-xs shadow-xs flipping-page"></div>

        <div className="absolute w-[2px] h-[48px] bg-deep-indigo rounded-full z-10"></div>
      </div>

      <div className="text-center">
        <p className="text-xs font-bold text-iris-bolt tracking-wide animate-pulse">{text}</p>
        <p className="text-[11px] text-slate-veil mt-0.5">Vui lòng chờ trong giây lát</p>
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-charcoal/40 backdrop-blur-xs p-4 transition-all duration-200"
      onClick={closeSmartBookModal}
    >
      <div
        className="bg-paper-white border border-mist-border rounded-[24px] w-full max-w-4xl h-[85vh] flex flex-col shadow-md overflow-hidden select-none animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 px-6 border-b border-mist-border flex items-center justify-between bg-chalk-canvas">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-lilac-wash text-iris-bolt flex items-center justify-center shadow-xs">
              <Book size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-ink-charcoal flex items-center gap-2">
                Nạp dữ liệu từ Giáo trình chính quy
                <Sparkles size={14} className="text-iris-bolt" />
              </h3>
              <p className="text-xs text-slate-veil">
                Chọn bộ giáo trình từ A1 - C2 và bài học để tự động nạp từ vựng và cấu trúc ngữ pháp
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={fetchBooks}
              className="p-1.5 rounded-full text-slate-veil hover:text-ink-charcoal hover:bg-mist-border transition-colors cursor-pointer"
              title="Tải lại danh mục"
            >
              <RotateCw size={16} />
            </button>
            <button
              type="button"
              onClick={closeSmartBookModal}
              className="p-1.5 rounded-full text-slate-veil hover:text-ink-charcoal hover:bg-mist-border transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-3 px-6 border-b border-mist-border bg-paper-white flex flex-wrap items-center justify-between gap-3 shadow-xs z-10">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-veil uppercase mr-1">Trình độ:</span>
            {LEVELS.map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  selectedLevel === lvl
                    ? 'bg-iris-bolt text-paper-white shadow-xs'
                    : 'bg-chalk-canvas text-slate-veil hover:text-ink-charcoal border border-mist-border'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 bg-chalk-canvas px-3 py-1.5 rounded border border-mist-border focus-within:border-iris-bolt transition-colors w-full sm:w-64">
            <Search size={14} className="text-slate-veil shrink-0" />
            <input
              type="text"
              placeholder="Tìm theo tên sách hoặc NXB..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs bg-transparent focus:outline-none text-ink-charcoal font-semibold"
            />
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="w-1/2 border-r border-mist-border p-4 overflow-y-auto bg-chalk-canvas">
            <div className="flex justify-between items-center mb-3 px-1">
              <h4 className="text-xs font-semibold text-slate-veil uppercase tracking-wider">
                1. Danh sách Sách ({filteredBooks.length})
              </h4>
            </div>

            {isLoadingBooks ? (
              <BookOpeningLoader text="Đang tải danh mục giáo trình..." />
            ) : filteredBooks.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <Book size={32} className="mx-auto text-fog-mist" />
                <p className="text-xs text-slate-veil font-medium">Không tìm thấy cuốn sách nào phù hợp.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredBooks.map((book) => {
                  const isSelected = selectedBook?.id === book.id;
                  return (
                    <button
                      key={book.id}
                      onClick={() => handleSelectBook(book)}
                      className={`w-full flex items-center justify-between p-3.5 rounded-lg border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-paper-white border-iris-bolt shadow-sm translate-x-1'
                          : 'bg-paper-white border-mist-border hover:border-slate-veil'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            isSelected ? 'bg-lilac-wash text-iris-bolt border-iris-bolt' : 'bg-chalk-canvas text-slate-veil border-mist-border'
                          }`}>
                            {book.level}
                          </span>
                          <h5 className={`text-sm font-bold truncate ${
                            isSelected ? 'text-iris-bolt' : 'text-ink-charcoal'
                          }`}>
                            {book.title}
                          </h5>
                        </div>
                        <p className="text-[11px] text-slate-veil truncate">{book.publisher || 'Nhà xuất bản chuẩn'}</p>
                      </div>
                      <ChevronRight size={16} className={`shrink-0 transition-transform ${
                        isSelected ? 'text-iris-bolt translate-x-1' : 'text-fog-mist'
                      }`} />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="w-1/2 p-4 overflow-y-auto bg-paper-white">
            <h4 className="text-xs font-semibold text-slate-veil uppercase tracking-wider mb-3 px-1">
              2. Chọn bài học (Lektion)
            </h4>

            {!selectedBook ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-veil py-12 space-y-2">
                <div className="w-14 h-14 rounded-full bg-chalk-canvas border border-mist-border flex items-center justify-center">
                  <Book size={24} className="text-slate-veil" />
                </div>
                <p className="text-xs font-medium">Vui lòng chọn một cuốn sách ở cột bên trái</p>
              </div>
            ) : isLoadingLektions ? (
              <BookOpeningLoader text={`Đang mở các Lektion của ${selectedBook.title}...`} />
            ) : lektions.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <FileText size={32} className="mx-auto text-fog-mist" />
                <p className="text-xs text-slate-veil font-medium">Cuốn sách này chưa có dữ liệu Lektion.</p>
              </div>
            ) : (
              <div className="space-y-2 animate-in fade-in duration-200">
                {lektions.map((lektion) => (
                  <button
                    key={lektion.id}
                    onClick={() => importFromBook(lektion.id)}
                    className="w-full flex items-start gap-3 p-3.5 rounded-lg bg-paper-white border border-mist-border hover:border-iris-bolt hover:shadow-xs transition-all text-left group cursor-pointer"
                  >
                    <div className="p-2 rounded bg-chalk-canvas text-slate-veil group-hover:bg-lilac-wash group-hover:text-iris-bolt transition-colors shrink-0">
                      <FileText size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold text-iris-bolt uppercase tracking-wider">
                        Lektion {lektion.lektionNumber}
                      </span>
                      <h5 className="text-xs font-bold text-ink-charcoal group-hover:text-iris-bolt leading-tight mt-0.5 truncate transition-colors">
                        {lektion.title}
                      </h5>
                      {lektion.theme && (
                        <p className="text-[11px] text-slate-veil mt-1 truncate">{lektion.theme}</p>
                      )}
                    </div>
                    <ChevronRight size={16} className="text-fog-mist group-hover:text-iris-bolt group-hover:translate-x-1 transition-all self-center shrink-0" />
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