import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  BookOpen, 
  Plus, 
  Trash2, 
  UploadCloud, 
  Sparkles, 
  ArrowLeft, 
  Loader2, 
  CheckCircle2, 
  Search, 
  ListOrdered, 
  ArrowRight, 
  Edit2, 
  X, 
  ListFilter 
} from 'lucide-react';
import { useLessonStore } from '../../store/useLessonStore';
import { apiRequest } from '../../services/apiClient';

interface UserData {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'TEACHER';
  createdAt: string;
}

interface DetectedLektionItem {
  lektionNumber: number;
  title: string;
  theme?: string;
  startPage: number;
  endPage: number;
  isIngested?: boolean;
}

interface LektionModel {
  id: string;
  lektionNumber: number;
  title: string;
  theme?: string;
  contents: any[];
}

interface BookData {
  id: string;
  title: string;
  publisher: string;
  level: string;
  coverUrl?: string;
  lektions: LektionModel[];
}

const ALL_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const FILTER_LEVELS = ['Alle', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const AdminBookLoader: React.FC<{ text?: string }> = ({ text = 'Đang tải kho sách...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <style>{`
        @keyframes adminFlip {
          0% { transform: rotateY(0deg); background-color: #ffffff; }
          50% { transform: rotateY(-90deg); background-color: #f3e8ff; }
          100% { transform: rotateY(-180deg); background-color: #e9d5ff; }
        }
        .perspective-admin-book { perspective: 600px; }
        .flipping-admin-page { transform-origin: left center; animation: adminFlip 1.1s infinite ease-in-out; }
      `}</style>
      <div className="relative w-16 h-12 perspective-admin-book flex items-center justify-center">
        <div className="absolute inset-0 flex shadow-lg rounded-sm overflow-hidden">
          <div className="w-1/2 h-full bg-purple-600 border-r border-purple-700"></div>
          <div className="w-1/2 h-full bg-purple-600 border-l border-purple-700"></div>
        </div>
        <div className="absolute top-[2px] left-[3px] w-[29px] h-[44px] bg-slate-100 rounded-l-xs border-r border-slate-300"></div>
        <div className="absolute top-[2px] right-[3px] w-[29px] h-[44px] bg-slate-100 rounded-r-xs border-l border-slate-300"></div>
        <div className="absolute top-[2px] right-[3px] w-[29px] h-[44px] bg-white rounded-r-xs shadow-xs flipping-admin-page"></div>
        <div className="absolute w-[2px] h-[48px] bg-purple-950 rounded-full z-10"></div>
      </div>
      <p className="text-xs font-extrabold text-purple-700 animate-pulse tracking-wide">{text}</p>
    </div>
  );
};

export const AdminDashboard: React.FC = () => {
  const { toggleAdminView } = useLessonStore();
  const [activeTab, setActiveTab] = useState<'books' | 'users'>('books');

  const [users, setUsers] = useState<UserData[]>([]);
  const [books, setBooks] = useState<BookData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterLevel, setFilterLevel] = useState('Alle');

  const [isNewBookModalOpen, setIsNewBookModalOpen] = useState(false);
  const [isCreatingBook, setIsCreatingBook] = useState(false);
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookPublisher, setNewBookPublisher] = useState('');
  const [newBookLevel, setNewBookLevel] = useState('B2');

  const [editingBook, setEditingBook] = useState<BookData | null>(null);
  const [isUpdatingBook, setIsUpdatingBook] = useState(false);

  const [editingLektion, setEditingLektion] = useState<LektionModel | null>(null);
  const [isUpdatingLektion, setIsUpdatingLektion] = useState(false);

  const [inspectingLektion, setInspectingLektion] = useState<LektionModel | null>(null);
  const [lektionVocabList, setLektionVocabList] = useState<any[]>([]);
  const [isSavingContents, setIsSavingContents] = useState(false);

  const [selectedBookForScan, setSelectedBookForScan] = useState<BookData | null>(null);
  const [fullPdfFile, setFullPdfFile] = useState<File | null>(null);
  const [isDetectingToc, setIsDetectingToc] = useState(false);
  const [detectedToc, setDetectedToc] = useState<DetectedLektionItem[]>([]);
  const [ingestingIndex, setIngestingIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchUsers();
    fetchBooks();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await apiRequest('/admin/users');
      if (res.ok) setUsers(await res.json());
    } catch (e) {}
  };

  const fetchBooks = async () => {
    setIsLoading(true);
    try {
      const res = await apiRequest('/admin/books');
      if (res.ok) {
        setBooks(await res.json());
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleToggle = async (user: UserData) => {
    const nextRole = user.role === 'ADMIN' ? 'TEACHER' : 'ADMIN';
    if (!window.confirm(`Bạn có chắc muốn chuyển quyền của ${user.name} sang ${nextRole}?`)) return;

    try {
      const res = await apiRequest(`/admin/users/${user.id}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role: nextRole }),
      });
      if (res.ok) fetchUsers();
    } catch (e) {}
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Vô hiệu hóa tài khoản giáo viên này?')) return;
    try {
      const res = await apiRequest(`/admin/users/${userId}`, { method: 'DELETE' });
      if (res.ok) fetchUsers();
    } catch (e) {}
  };

  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBookTitle.trim()) {
      alert('Vui lòng nhập tên cuốn sách!');
      return;
    }

    setIsCreatingBook(true);
    try {
      const res = await apiRequest('/admin/books', {
        method: 'POST',
        body: JSON.stringify({
          title: newBookTitle.trim(),
          publisher: newBookPublisher.trim(),
          level: newBookLevel,
        }),
      });

      if (res.ok) {
        setIsNewBookModalOpen(false);
        setNewBookTitle('');
        setNewBookPublisher('');
        await fetchBooks();
      } else {
        const err = await res.json();
        alert(`Không thể tạo sách: ${err.message}`);
      }
    } catch (err: any) {
      alert(`Lỗi kết nối máy chủ: ${err.message}`);
    } finally {
      setIsCreatingBook(false);
    }
  };

  const handleUpdateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBook || !editingBook.title.trim()) return;

    setIsUpdatingBook(true);
    try {
      const res = await apiRequest(`/admin/books/${editingBook.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: editingBook.title.trim(),
          publisher: editingBook.publisher.trim(),
          level: editingBook.level,
        }),
      });

      if (res.ok) {
        setEditingBook(null);
        await fetchBooks();
      } else {
        const err = await res.json();
        alert(`Lỗi cập nhật: ${err.message}`);
      }
    } catch (err: any) {
      alert(`Lỗi kết nối: ${err.message}`);
    } finally {
      setIsUpdatingBook(false);
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    if (!window.confirm('Xóa toàn bộ cuốn sách này và các bài học bên trong?')) return;
    try {
      const res = await apiRequest(`/admin/books/${bookId}`, { method: 'DELETE' });
      if (res.ok) fetchBooks();
    } catch (e) {}
  };

  const handleUpdateLektion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLektion) return;

    setIsUpdatingLektion(true);
    try {
      const res = await apiRequest(`/admin/lektions/${editingLektion.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          lektionNumber: editingLektion.lektionNumber,
          title: editingLektion.title,
          theme: editingLektion.theme,
        }),
      });

      if (res.ok) {
        setEditingLektion(null);
        await fetchBooks();
      } else {
        const err = await res.json();
        alert(`Lỗi: ${err.message}`);
      }
    } catch (err: any) {
      alert(`Lỗi kết nối: ${err.message}`);
    } finally {
      setIsUpdatingLektion(false);
    }
  };

  const handleDeleteLektion = async (lektionId: string) => {
    if (!window.confirm('Xóa bài học Lektion này khỏi sách?')) return;
    try {
      const res = await apiRequest(`/admin/lektions/${lektionId}`, { method: 'DELETE' });
      if (res.ok) fetchBooks();
    } catch (e) {}
  };

  const handleOpenInspectLektion = (lektion: LektionModel) => {
    setInspectingLektion(lektion);
    const vocabContent = lektion.contents?.find((c: any) => c.type === 'VOCAB');
    setLektionVocabList(vocabContent?.data || []);
  };

  const handleSaveLektionContents = async () => {
    if (!inspectingLektion) return;

    setIsSavingContents(true);
    try {
      const currentContents = inspectingLektion.contents || [];
      const redemittelContent = currentContents.find((c: any) => c.type === 'REDEMITTEL');

      const payload = [
        {
          type: 'VOCAB',
          data: lektionVocabList,
        },
      ];

      if (redemittelContent) {
        payload.push(redemittelContent);
      }

      const res = await apiRequest(`/admin/lektions/${inspectingLektion.id}/contents`, {
        method: 'PUT',
        body: JSON.stringify({ contents: payload }),
      });

      if (res.ok) {
        setInspectingLektion(null);
        await fetchBooks();
      } else {
        const err = await res.json();
        alert(`Lỗi lưu: ${err.message}`);
      }
    } catch (e: any) {
      alert(`Lỗi kết nối: ${e.message}`);
    } finally {
      setIsSavingContents(false);
    }
  };

  const handleDetectTOC = async () => {
    if (!fullPdfFile) return;

    setIsDetectingToc(true);
    try {
      const formData = new FormData();
      formData.append('file', fullPdfFile);

      const token = localStorage.getItem('daf_access_token');
      const res = await fetch('http://localhost:3000/api/admin/books/detect-toc', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        const tocList: DetectedLektionItem[] = await res.json();
        setDetectedToc(tocList);
      } else {
        const err = await res.json();
        alert(`Lỗi quét mục lục: ${err.message || 'Không thể đọc mục lục'}`);
      }
    } catch (e: any) {
      alert(`Lỗi kết nối: ${e.message}`);
    } finally {
      setIsDetectingToc(false);
    }
  };

  const handleIngestSingleLektion = async (item: DetectedLektionItem, index: number) => {
    if (!selectedBookForScan || !fullPdfFile) return;

    setIngestingIndex(index);
    try {
      const formData = new FormData();
      formData.append('bookId', selectedBookForScan.id);
      formData.append('lektionNumber', String(item.lektionNumber));
      formData.append('title', item.title);
      formData.append('theme', item.theme || '');
      formData.append('startPage', String(item.startPage));
      formData.append('endPage', String(item.endPage));
      formData.append('files', fullPdfFile);

      const token = localStorage.getItem('daf_access_token');
      const res = await fetch('http://localhost:3000/api/admin/books/auto-ingest-lektion', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        setDetectedToc(prev => prev.map((l, i) => i === index ? { ...l, isIngested: true } : l));
        fetchBooks();
      } else {
        const err = await res.json();
        alert(`Lỗi nạp bài: ${err.message}`);
      }
    } catch (e: any) {
      alert(`Lỗi kết nối: ${e.message}`);
    } finally {
      setIngestingIndex(null);
    }
  };

  const filteredBooks = books.filter((b) => {
    if (filterLevel === 'Alle') return true;
    return b.level.toUpperCase() === filterLevel.toUpperCase();
  });

  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 p-6 sm:p-10 select-none animate-in fade-in duration-200">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => toggleAdminView(false)}
              className="flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white shadow-xs transition-colors"
            >
              <ArrowLeft size={16} /> Quay lại Giáo án
            </button>
            <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800" />
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="text-purple-600 dark:text-purple-400" size={24} />
                Trung tâm Quản trị (Admin Portal)
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Quản trị kho sách A1 - C2 và quản lý danh sách giáo viên trong hệ thống</p>
            </div>
          </div>

          <div className="flex items-center bg-slate-200 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('books')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'books' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BookOpen size={15} className="text-purple-600 dark:text-purple-400" />
              <span>Quản lý Sách & Lektion</span>
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'users' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Users size={15} className="text-blue-600 dark:text-blue-400" />
              <span>Quản lý Giáo viên ({users.length})</span>
            </button>
          </div>
        </div>

        {activeTab === 'books' && (
          <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Danh mục Giáo trình chính quy (A1 - C2)</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Các cuốn sách này sẽ xuất hiện trong mục "Chọn sách có sẵn" cho tất cả giáo viên</p>
              </div>
              <button
                onClick={() => setIsNewBookModalOpen(true)}
                className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-sm transition-all"
              >
                <Plus size={16} /> Thêm Cuốn Sách Mới
              </button>
            </div>

            <div className="flex items-center gap-1.5 p-1.5 bg-slate-200/80 dark:bg-slate-800/90 rounded-2xl w-fit border border-slate-300 dark:border-slate-700 shadow-xs">
              <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase px-2.5">Phân loại:</span>
              {FILTER_LEVELS.map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setFilterLevel(lvl)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    filterLevel === lvl
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            {isLoading ? (
              <AdminBookLoader text="Đang mở kho sách chính quy..." />
            ) : filteredBooks.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl">
                <BookOpen size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Không có cuốn sách nào ở trình độ {filterLevel}</p>
                <p className="text-xs text-slate-400 mt-1">Bấm "+ Thêm Cuốn Sách Mới" để bắt đầu nạp giáo trình chuẩn</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredBooks.map((book) => (
                  <div key={book.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          Niveau {book.level}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditingBook({ ...book })}
                            className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1 rounded-md hover:bg-blue-50 dark:hover:bg-slate-800"
                            title="Sửa thông tin sách"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteBook(book.id)}
                            className="text-slate-300 hover:text-red-600 transition-colors p-1 rounded-md hover:bg-red-50 dark:hover:bg-slate-800"
                            title="Xóa sách này"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-snug">{book.title}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">NXB: {book.publisher || 'Không xác định'}</p>

                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center justify-between">
                          <span>Các bài học (Lektionen):</span>
                          <span className="text-purple-600 dark:text-purple-400 font-mono font-bold">{book.lektions?.length || 0} bài</span>
                        </span>

                        <div className="mt-2 space-y-1.5 max-h-36 overflow-y-auto pr-1">
                          {book.lektions?.length === 0 ? (
                            <p className="text-[11px] text-slate-400 italic">Chưa có bài học nào được nạp</p>
                          ) : (
                            book.lektions.map((l) => (
                              <div key={l.id} className="text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between group hover:bg-purple-50/40 dark:hover:bg-purple-900/20 transition-colors">
                                <div 
                                  onClick={() => handleOpenInspectLektion(l)}
                                  className="truncate mr-2 cursor-pointer hover:underline"
                                  title="Nhấp để soát và sửa từ vựng của bài này"
                                >
                                  <span className="font-bold text-purple-700 dark:text-purple-400 mr-1.5">Lektion {l.lektionNumber}:</span>
                                  <span className="font-medium text-slate-800 dark:text-slate-200">{l.title}</span>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => handleOpenInspectLektion(l)}
                                    className="p-1 text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 rounded"
                                    title="Xem & Sửa từ vựng"
                                  >
                                    <ListFilter size={12} />
                                  </button>
                                  <button
                                    onClick={() => setEditingLektion({ ...l })}
                                    className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded"
                                    title="Sửa tiêu đề Lektion"
                                  >
                                    <Edit2 size={12} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteLektion(l.id)}
                                    className="p-1 text-slate-400 hover:text-red-500 rounded"
                                    title="Xóa Lektion"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => {
                          setSelectedBookForScan(book);
                          setDetectedToc([]);
                          setFullPdfFile(null);
                        }}
                        className="w-full flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 rounded-xl bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 transition-colors"
                      >
                        <Sparkles size={14} /> AI Tự Quét Mục Lục & Nạp Sách
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 px-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/40">
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">Danh sách Giáo viên trong hệ thống</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Quản lý và cấp quyền Quản trị viên (ADMIN) cho giáo viên</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="p-3.5 pl-6">Giáo viên</th>
                    <th className="p-3.5">Email</th>
                    <th className="p-3.5">Vai trò (Role)</th>
                    <th className="p-3.5">Ngày tham gia</th>
                    <th className="p-3.5 text-right pr-6">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-3.5 pl-6 font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs shrink-0">
                          {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <span>{u.name}</span>
                      </td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-400 font-mono">{u.email}</td>
                      <td className="p-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.role === 'ADMIN' ? 'bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800' : 'bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="p-3.5 text-right pr-6 space-x-2">
                        <button
                          onClick={() => handleRoleToggle(u)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-[11px] text-slate-700 dark:text-slate-300 transition-colors"
                        >
                          Đổi thành {u.role === 'ADMIN' ? 'TEACHER' : 'ADMIN'}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-1 text-slate-300 hover:text-red-600 transition-colors"
                          title="Vô hiệu hóa"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {isNewBookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4 border border-slate-200 dark:border-slate-800">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Thêm Cuốn Sách Giáo Trình Mới</h3>
            <form onSubmit={handleCreateBook} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Tên cuốn sách (z.B. Aspekte Neu B2)</label>
                <input
                  type="text"
                  required
                  placeholder="z.B. Aspekte Neu B2"
                  value={newBookTitle}
                  onChange={(e) => setNewBookTitle(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-purple-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Nhà xuất bản</label>
                <input
                  type="text"
                  placeholder="Klett Verlag"
                  value={newBookPublisher}
                  onChange={(e) => setNewBookPublisher(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Trình độ (Niveau A1 - C2)</label>
                <select
                  value={newBookLevel}
                  onChange={(e) => setNewBookLevel(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none font-bold"
                >
                  {ALL_LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  disabled={isCreatingBook}
                  onClick={() => setIsNewBookModalOpen(false)}
                  className="text-xs font-semibold px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isCreatingBook}
                  className="flex items-center gap-1.5 text-xs font-bold px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-sm disabled:opacity-50 transition-all"
                >
                  {isCreatingBook && <Loader2 size={14} className="animate-spin" />}
                  <span>{isCreatingBook ? 'Đang tạo...' : 'Tạo Sách'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4 border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Sửa Thông Tin Sách</h3>
              <button onClick={() => setEditingBook(null)} className="p-1 text-slate-400 hover:text-slate-700"><X size={16} /></button>
            </div>

            <form onSubmit={handleUpdateBook} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Tên cuốn sách</label>
                <input
                  type="text"
                  required
                  value={editingBook.title}
                  onChange={(e) => setEditingBook({ ...editingBook, title: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Nhà xuất bản</label>
                <input
                  type="text"
                  value={editingBook.publisher}
                  onChange={(e) => setEditingBook({ ...editingBook, publisher: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Trình độ (Niveau)</label>
                <select
                  value={editingBook.level}
                  onChange={(e) => setEditingBook({ ...editingBook, level: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                >
                  {ALL_LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingBook(null)}
                  className="text-xs font-semibold px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingBook}
                  className="flex items-center gap-1.5 text-xs font-bold px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm disabled:opacity-50"
                >
                  {isUpdatingBook && <Loader2 size={14} className="animate-spin" />}
                  <span>{isUpdatingBook ? 'Đang lưu...' : 'Lưu Thay Đổi'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {inspectingLektion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-3xl max-h-[88vh] shadow-2xl p-6 flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <ListFilter size={18} className="text-purple-600 dark:text-purple-400" />
                  Soát & Sửa Từ Vựng Lektion {inspectingLektion.lektionNumber}: {inspectingLektion.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Chỉnh sửa từ vựng chuẩn trong Database để các giáo viên dùng vĩnh viễn</p>
              </div>
              <button onClick={() => setInspectingLektion(null)} className="p-1 text-slate-400 hover:text-slate-700"><X size={18} /></button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Danh sách ({lektionVocabList.length} từ):</span>
                <button
                  onClick={() => setLektionVocabList([...lektionVocabList, { id: `w-${Date.now()}`, article: '-', german: '', translation: '', plural: '', example: '' }])}
                  className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                >
                  <Plus size={14} /> + Thêm từ mới
                </button>
              </div>

              {lektionVocabList.map((v, i) => (
                <div key={i} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                  <select
                    value={v.article || '-'}
                    onChange={(e) => {
                      const copy = [...lektionVocabList];
                      copy[i].article = e.target.value;
                      setLektionVocabList(copy);
                    }}
                    className="text-xs font-bold p-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="-">-</option>
                    <option value="der">der</option>
                    <option value="die">die</option>
                    <option value="das">das</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Wort"
                    value={v.german}
                    onChange={(e) => {
                      const copy = [...lektionVocabList];
                      copy[i].german = e.target.value;
                      setLektionVocabList(copy);
                    }}
                    className="w-1/3 text-xs p-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                  />
                  <input
                    type="text"
                    placeholder="Nghĩa tiếng Việt"
                    value={v.translation}
                    onChange={(e) => {
                      const copy = [...lektionVocabList];
                      copy[i].translation = e.target.value;
                      setLektionVocabList(copy);
                    }}
                    className="w-1/3 text-xs p-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                  <input
                    type="text"
                    placeholder="Ví dụ"
                    value={v.example || ''}
                    onChange={(e) => {
                      const copy = [...lektionVocabList];
                      copy[i].example = e.target.value;
                      setLektionVocabList(copy);
                    }}
                    className="flex-1 text-xs p-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 italic"
                  />
                  <button
                    onClick={() => setLektionVocabList(lektionVocabList.filter((_, idx) => idx !== i))}
                    className="text-slate-300 hover:text-red-600 p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setInspectingLektion(null)}
                className="text-xs font-semibold px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={isSavingContents}
                onClick={handleSaveLektionContents}
                className="flex items-center gap-1.5 text-xs font-bold px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-sm disabled:opacity-50"
              >
                {isSavingContents && <Loader2 size={14} className="animate-spin" />}
                <span>{isSavingContents ? 'Đang lưu vào Database...' : 'Lưu Danh Sách Từ Vựng'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {editingLektion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4 border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Sửa Lektion</h3>
              <button onClick={() => setEditingLektion(null)} className="p-1 text-slate-400 hover:text-slate-700"><X size={16} /></button>
            </div>

            <form onSubmit={handleUpdateLektion} className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Số Lektion</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={editingLektion.lektionNumber}
                    onChange={(e) => setEditingLektion({ ...editingLektion, lektionNumber: Number(e.target.value) })}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Tiêu đề bài</label>
                  <input
                    type="text"
                    required
                    value={editingLektion.title}
                    onChange={(e) => setEditingLektion({ ...editingLektion, title: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Chủ đề bài học (Thema)</label>
                <input
                  type="text"
                  value={editingLektion.theme || ''}
                  onChange={(e) => setEditingLektion({ ...editingLektion, theme: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingLektion(null)}
                  className="text-xs font-semibold px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingLektion}
                  className="flex items-center gap-1.5 text-xs font-bold px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-sm disabled:opacity-50"
                >
                  {isUpdatingLektion && <Loader2 size={14} className="animate-spin" />}
                  <span>{isUpdatingLektion ? 'Đang lưu...' : 'Lưu Thay Đổi'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedBookForScan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl p-6 flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-base text-purple-900 dark:text-purple-400 flex items-center gap-2">
                <Sparkles size={18} className="text-purple-600 dark:text-purple-400" />
                AI Tự Quét Mục Lục: {selectedBookForScan.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Tải lên file PDF cả cuốn sách, AI sẽ tự đọc trang mục lục và phân chia các bài học</p>
            </div>

            <div className="p-1 overflow-y-auto flex-1 space-y-4 my-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">File PDF cả cuốn sách (100–150 trang):</label>
                <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-purple-200 dark:border-purple-800 rounded-xl bg-purple-50/30 dark:bg-purple-950/20 hover:bg-purple-50/70 dark:hover:bg-purple-950/40 cursor-pointer transition-colors text-center">
                  <UploadCloud size={30} className="text-purple-600 dark:text-purple-400 mb-1" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {fullPdfFile ? fullPdfFile.name : 'Nhấp để chọn file PDF cuốn sách'}
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setFullPdfFile(e.target.files[0]);
                        setDetectedToc([]);
                      }
                    }}
                  />
                </label>
              </div>

              {isDetectingToc && (
                <div className="py-6 bg-purple-50/60 dark:bg-purple-950/30 rounded-2xl border border-purple-200 dark:border-purple-800">
                  <AdminBookLoader text="AI đang lật mở từng trang Mục lục (Inhaltsverzeichnis) để nhận diện các Lektion..." />
                </div>
              )}

              {fullPdfFile && !isDetectingToc && detectedToc.length === 0 && (
                <div className="flex justify-center pt-2">
                  <button
                    type="button"
                    onClick={handleDetectTOC}
                    className="flex items-center gap-2 text-xs font-bold px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-md transition-all hover:scale-105 active:scale-95"
                  >
                    <Search size={16} />
                    <span>🔍 AI Quét Mục Lục Cuốn Sách Tự Động</span>
                  </button>
                </div>
              )}

              {detectedToc.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-purple-50 dark:bg-purple-950/40 p-3 rounded-xl border border-purple-200 dark:border-purple-800">
                    <span className="text-xs font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                      <ListOrdered size={16} className="text-purple-600 dark:text-purple-400" />
                      AI đã phát hiện {detectedToc.length} Lektion trong cuốn sách này:
                    </span>
                    <span className="text-[11px] text-purple-600 dark:text-purple-400 font-bold">Bấm nút nạp từng bài bên dưới</span>
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {detectedToc.map((item, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                          item.isIngested 
                            ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800' 
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-purple-300'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300">
                              Lektion {item.lektionNumber}
                            </span>
                            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{item.title}</h4>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {item.theme && `${item.theme} · `} 
                            <strong className="text-slate-700 dark:text-slate-300">Trang {item.startPage} đến {item.endPage}</strong>
                          </p>
                        </div>

                        <div>
                          {item.isIngested ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-3 py-1.5 rounded-lg">
                              <CheckCircle2 size={14} /> Đã nạp xong
                            </span>
                          ) : (
                            <button
                              type="button"
                              disabled={ingestingIndex !== null}
                              onClick={() => handleIngestSingleLektion(item, idx)}
                              className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white shadow-xs disabled:opacity-50 transition-all"
                            >
                              {ingestingIndex === idx ? (
                                <>
                                  <Loader2 size={13} className="animate-spin" />
                                  <span>Đang nạp...</span>
                                </>
                              ) : (
                                <>
                                  <span>⚡ Nạp bài này</span>
                                  <ArrowRight size={13} />
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setSelectedBookForScan(null);
                  setFullPdfFile(null);
                  setDetectedToc([]);
                }}
                className="text-xs font-semibold px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};