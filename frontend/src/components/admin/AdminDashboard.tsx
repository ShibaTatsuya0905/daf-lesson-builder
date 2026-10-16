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
  Search, 
  ListOrdered, 
  ArrowRight, 
  Edit2, 
  X, 
  ListFilter,
  Calendar,
  Clock,
  MapPin,
  GraduationCap,
  FileSpreadsheet,
  CheckCircle2
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
const DAYS_OF_WEEK = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

export const AdminDashboard: React.FC = () => {
  const { toggleAdminView } = useLessonStore();
  const [activeTab, setActiveTab] = useState<'books' | 'users' | 'classes' | 'students' | 'schedules'>('books');

  const [users, setUsers] = useState<UserData[]>([]);
  const [books, setBooks] = useState<BookData[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
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

  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<any | null>(null);
  const [className, setClassName] = useState('');
  const [classLevel, setClassLevel] = useState('A1');
  const [classTeacherId, setClassTeacherId] = useState('');

  const [studentSearch, setStudentSearch] = useState('');
  const [studentFilterClassId, setStudentFilterClassId] = useState('all');
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [singleStudentName, setSingleStudentName] = useState('');
  const [singleStudentEmail, setSingleStudentEmail] = useState('');
  const [singleStudentPhone, setSingleStudentPhone] = useState('');
  const [singleStudentClassId, setSingleStudentClassId] = useState('');

  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [excelTargetClassId, setExcelTargetClassId] = useState('');
  const [excelPasteData, setExcelPasteData] = useState('');
  const [parsedExcelStudents, setParsedExcelStudents] = useState<any[]>([]);
  const [isImportingExcel, setIsImportingExcel] = useState(false);

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [schedClassId, setSchedClassId] = useState('');
  const [schedTeacherId, setSchedTeacherId] = useState('');
  const [schedDay, setSchedDay] = useState('Thứ 2');
  const [schedStart, setSchedStart] = useState('18:30');
  const [schedEnd, setSchedEnd] = useState('20:30');
  const [schedRoom, setSchedRoom] = useState('Phòng 101');

  useEffect(() => {
    fetchUsers();
    fetchBooks();
    fetchClasses();
    fetchStudents();
    fetchSchedules();
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
      if (res.ok) setBooks(await res.json());
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await apiRequest('/academic/admin/classes');
      if (res.ok) {
        const data = await res.json();
        setClasses(data);
        if (data.length > 0) {
          if (!schedClassId) setSchedClassId(data[0].id);
          if (!singleStudentClassId) setSingleStudentClassId(data[0].id);
          if (!excelTargetClassId) setExcelTargetClassId(data[0].id);
        }
      }
    } catch (e) {}
  };

  const fetchStudents = async () => {
    try {
      const res = await apiRequest('/academic/admin/students');
      if (res.ok) setStudents(await res.json());
    } catch (e) {}
  };

  const fetchSchedules = async () => {
    try {
      const res = await apiRequest('/academic/admin/schedules');
      if (res.ok) setSchedules(await res.json());
    } catch (e) {}
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
    if (!newBookTitle.trim()) return;

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
        fetchBooks();
      }
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
        fetchBooks();
      }
    } finally {
      setIsUpdatingBook(false);
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    if (!window.confirm('Xóa cuốn sách này cùng tất cả Lektion bên trong?')) return;
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
        fetchBooks();
      }
    } finally {
      setIsUpdatingLektion(false);
    }
  };

  const handleDeleteLektion = async (lektionId: string) => {
    if (!window.confirm('Xóa Lektion này khỏi sách?')) return;
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

      const payload = [{ type: 'VOCAB', data: lektionVocabList }];
      if (redemittelContent) payload.push(redemittelContent);

      const res = await apiRequest(`/admin/lektions/${inspectingLektion.id}/contents`, {
        method: 'PUT',
        body: JSON.stringify({ contents: payload }),
      });

      if (res.ok) {
        setInspectingLektion(null);
        fetchBooks();
      }
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
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        setDetectedToc(await res.json());
      }
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
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        setDetectedToc(prev => prev.map((l, i) => i === index ? { ...l, isIngested: true } : l));
        fetchBooks();
      }
    } finally {
      setIngestingIndex(null);
    }
  };

  const handleSaveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim()) return;

    try {
      let res;
      if (editingClass) {
        res = await apiRequest(`/academic/admin/classes/${editingClass.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            name: className.trim(),
            level: classLevel,
            teacherId: classTeacherId || undefined,
          }),
        });
      } else {
        res = await apiRequest('/academic/admin/classes', {
          method: 'POST',
          body: JSON.stringify({
            name: className.trim(),
            level: classLevel,
            teacherId: classTeacherId || undefined,
          }),
        });
      }

      if (res.ok) {
        setIsClassModalOpen(false);
        setEditingClass(null);
        setClassName('');
        setClassTeacherId('');
        fetchClasses();
      }
    } catch (e) {}
  };

  const handleDeleteClass = async (classId: string) => {
    if (!window.confirm('Xóa lớp học này? Mọi học sinh trong lớp cũng sẽ bị xóa.')) return;
    try {
      const res = await apiRequest(`/academic/admin/classes/${classId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchClasses();
        fetchStudents();
      }
    } catch (e) {}
  };

  const handleAddSingleStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleStudentName.trim() || !singleStudentClassId) return;

    try {
      const res = await apiRequest('/academic/admin/students', {
        method: 'POST',
        body: JSON.stringify({
          classId: singleStudentClassId,
          name: singleStudentName.trim(),
          email: singleStudentEmail.trim() || undefined,
          phone: singleStudentPhone.trim() || undefined,
        }),
      });

      if (res.ok) {
        setIsStudentModalOpen(false);
        setSingleStudentName('');
        setSingleStudentEmail('');
        setSingleStudentPhone('');
        fetchStudents();
        fetchClasses();
      }
    } catch (e) {}
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!window.confirm('Xóa học viên này khỏi danh sách?')) return;
    try {
      const res = await apiRequest(`/academic/admin/students/${studentId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchStudents();
        fetchClasses();
      }
    } catch (e) {}
  };

  const handleParseExcelPaste = () => {
    if (!excelPasteData.trim()) return;

    const lines = excelPasteData.split('\n').map(l => l.trim()).filter(Boolean);
    const parsed: any[] = [];

    lines.forEach((line) => {
      const cols = line.split(/[\t,;]/).map(c => c.trim());
      if (cols.length > 0 && cols[0]) {
        parsed.push({
          name: cols[0],
          email: cols[1] || '',
          phone: cols[2] || '',
        });
      }
    });

    setParsedExcelStudents(parsed);
  };

  const handleFileUploadCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setExcelPasteData(content);
        const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
        const parsed: any[] = [];
        lines.forEach((line) => {
          const cols = line.split(/[\t,;]/).map(c => c.trim());
          if (cols.length > 0 && cols[0]) {
            parsed.push({
              name: cols[0],
              email: cols[1] || '',
              phone: cols[2] || '',
            });
          }
        });
        setParsedExcelStudents(parsed);
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteBatchImport = async () => {
    if (parsedExcelStudents.length === 0 || !excelTargetClassId) return;

    setIsImportingExcel(true);
    try {
      const payload = parsedExcelStudents.map(s => ({
        ...s,
        classId: excelTargetClassId,
      }));

      const res = await apiRequest('/academic/admin/students/batch', {
        method: 'POST',
        body: JSON.stringify({ students: payload }),
      });

      if (res.ok) {
        setIsExcelModalOpen(false);
        setExcelPasteData('');
        setParsedExcelStudents([]);
        fetchStudents();
        fetchClasses();
      }
    } finally {
      setIsImportingExcel(false);
    }
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedClassId || !schedTeacherId) return;

    try {
      const res = await apiRequest('/academic/admin/schedules', {
        method: 'POST',
        body: JSON.stringify({
          classId: schedClassId,
          teacherId: schedTeacherId,
          dayOfWeek: schedDay,
          startTime: schedStart,
          endTime: schedEnd,
          room: schedRoom.trim() || undefined,
        }),
      });

      if (res.ok) {
        setIsScheduleModalOpen(false);
        fetchSchedules();
      }
    } catch (e) {}
  };

  const handleDeleteSchedule = async (schedId: string) => {
    if (!window.confirm('Xóa ca học này khỏi lịch?')) return;
    try {
      const res = await apiRequest(`/academic/admin/schedules/${schedId}`, { method: 'DELETE' });
      if (res.ok) fetchSchedules();
    } catch (e) {}
  };

  const filteredStudents = students.filter(st => {
    const matchClass = studentFilterClassId === 'all' || st.classId === studentFilterClassId;
    const query = studentSearch.toLowerCase().trim();
    const matchQuery = !query || st.name.toLowerCase().includes(query) || (st.email && st.email.toLowerCase().includes(query)) || (st.phone && st.phone.includes(query));
    return matchClass && matchQuery;
  });
  
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
            <div className="h-6 w-[1px] bg-slate-200 dark:border-slate-800" />
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="text-purple-600 dark:text-purple-400" size={24} />
                Trung tâm Quản trị (Admin Portal)
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Quản trị toàn diện kho sách, giáo viên, lớp học, học sinh và thời khóa biểu</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center bg-slate-200 dark:bg-slate-800 p-1 rounded-2xl gap-1">
            <button
              onClick={() => setActiveTab('books')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'books' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BookOpen size={15} className="text-purple-600 dark:text-purple-400" />
              <span>Sách & Lektion</span>
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'users' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Users size={15} className="text-blue-600 dark:text-blue-400" />
              <span>Giáo viên ({users.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('classes')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'classes' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <GraduationCap size={15} className="text-emerald-600 dark:text-emerald-400" />
              <span>Lớp học ({classes.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'students' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Users size={15} className="text-teal-600 dark:text-teal-400" />
              <span>Học sinh ({students.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('schedules')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'schedules' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Calendar size={15} className="text-amber-600 dark:text-amber-400" />
              <span>Xếp Lịch Dạy ({schedules.length})</span>
            </button>
          </div>
        </div>

        {activeTab === 'books' && (
          <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Danh mục Giáo trình chính quy (A1 - C2)</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Quản lý sách, chỉnh sửa Lektion, từ vựng và quét AI mục lục sách PDF</p>
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
                    filterLevel === lvl ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-700 dark:text-slate-300 hover:bg-white/50'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredBooks.map((book) => (
                <div key={book.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        Niveau {book.level}
                      </span>
                      <div className="flex items-center gap-1">
                        <button onClick={() => setEditingBook({ ...book })} className="text-slate-400 hover:text-blue-600 p-1">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDeleteBook(book.id)} className="text-slate-300 hover:text-red-600 p-1">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-snug">{book.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">NXB: {book.publisher || 'Không xác định'}</p>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300 flex justify-between items-center">
                        <span>Các Lektion trong sách:</span>
                        <span className="text-purple-600 dark:text-purple-400 font-mono font-bold">{book.lektions?.length || 0} bài</span>
                      </span>

                      <div className="mt-2 space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {book.lektions?.length === 0 ? (
                          <p className="text-[11px] text-slate-400 italic">Chưa có bài học nào được nạp</p>
                        ) : (
                          book.lektions.map((l) => (
                            <div key={l.id} className="text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between group hover:bg-purple-50/40 transition-colors">
                              <div onClick={() => handleOpenInspectLektion(l)} className="truncate mr-2 cursor-pointer hover:underline" title="Xem & sửa từ vựng bài này">
                                <span className="font-bold text-purple-700 dark:text-purple-400 mr-1.5">Lektion {l.lektionNumber}:</span>
                                <span className="font-medium text-slate-800 dark:text-slate-200">{l.title}</span>
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleOpenInspectLektion(l)} className="p-1 text-slate-400 hover:text-purple-600" title="Soát từ vựng"><ListFilter size={12} /></button>
                                <button onClick={() => setEditingLektion({ ...l })} className="p-1 text-slate-400 hover:text-blue-600" title="Sửa Lektion"><Edit2 size={12} /></button>
                                <button onClick={() => handleDeleteLektion(l.id)} className="p-1 text-slate-400 hover:text-red-500" title="Xóa Lektion"><Trash2 size={12} /></button>
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
                      className="w-full flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 rounded-xl bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 transition-colors"
                    >
                      <Sparkles size={14} /> AI Quét Mục Lục PDF & Nạp Tự Động
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 px-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">Danh sách Giáo viên trong hệ thống</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Quản lý và cấp quyền Quản trị viên (ADMIN) cho giáo viên</p>
            </div>
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="p-3.5 pl-6">Giáo viên</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Vai trò</th>
                  <th className="p-3.5 text-right pr-6">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                    <td className="p-3.5 pl-6 font-bold text-slate-900 dark:text-white">{u.name}</td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-400 font-mono">{u.email}</td>
                    <td className="p-3.5">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3.5 text-right pr-6 space-x-2">
                      <button onClick={() => handleRoleToggle(u)} className="px-2.5 py-1 rounded-lg border text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800">
                        Đổi thành {u.role === 'ADMIN' ? 'TEACHER' : 'ADMIN'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'classes' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Danh mục Lớp học & Phân công Giáo viên</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Admin tạo lớp học, gán giáo viên chủ nhiệm/giảng dạy và cấu hình trình độ</p>
              </div>
              <button
                onClick={() => {
                  setEditingClass(null);
                  setClassName('');
                  setClassLevel('A1');
                  setClassTeacherId('');
                  setIsClassModalOpen(true);
                }}
                className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
              >
                <Plus size={16} /> Tạo Lớp Học Mới
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {classes.map((c) => (
                <div key={c.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        Niveau {c.level}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingClass(c);
                            setClassName(c.name);
                            setClassLevel(c.level);
                            setClassTeacherId(c.teacherId || '');
                            setIsClassModalOpen(true);
                          }}
                          className="p-1 text-slate-400 hover:text-blue-600"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDeleteClass(c.id)} className="p-1 text-slate-300 hover:text-red-500">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-2">{c.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Giáo viên: <strong className="text-slate-700 dark:text-slate-300">{c.teacher?.name || 'Chưa phân công'}</strong>
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                    <span className="text-slate-400">Sĩ số lớp:</span>
                    <strong className="text-emerald-600 font-bold">{c.students?.length || 0} học viên</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Quản lý Học sinh Toàn hệ thống</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Nhập tay từng học viên hoặc import dữ liệu hàng loạt từ file Excel / CSV</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsExcelModalOpen(true)}
                  className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 transition-colors"
                >
                  <FileSpreadsheet size={15} /> Import từ Excel / CSV
                </button>
                <button
                  onClick={() => setIsStudentModalOpen(true)}
                  className="flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                >
                  <Plus size={15} /> Thêm Học Sinh
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 w-full sm:w-72">
                <Search size={14} className="text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm theo tên, email, SĐT..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="bg-transparent text-xs w-full focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">Lọc theo Lớp:</span>
                <select
                  value={studentFilterClassId}
                  onChange={(e) => setStudentFilterClassId(e.target.value)}
                  className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold bg-white dark:bg-slate-800"
                >
                  <option value="all">Tất cả các lớp</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name} ({c.level})</option>)}
                </select>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="p-3 pl-6">Họ và tên</th>
                    <th className="p-3">Lớp học</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Số điện thoại</th>
                    <th className="p-3">Đánh giá gần nhất</th>
                    <th className="p-3 text-right pr-6">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredStudents.length === 0 ? (
                    <tr><td colSpan={6} className="p-8 text-center text-slate-400">Không tìm thấy học sinh nào.</td></tr>
                  ) : (
                    filteredStudents.map((st) => (
                      <tr key={st.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                        <td className="p-3 pl-6 font-bold text-slate-900 dark:text-white">{st.name}</td>
                        <td className="p-3 font-semibold text-emerald-600">{st.class?.name || '—'} ({st.class?.level || '—'})</td>
                        <td className="p-3 text-slate-500 font-mono">{st.email || '—'}</td>
                        <td className="p-3 text-slate-500 font-mono">{st.phone || '—'}</td>
                        <td className="p-3">
                          <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {st.evaluations?.[0]?.rating || 'Chưa đánh giá'}
                          </span>
                        </td>
                        <td className="p-3 text-right pr-6">
                          <button onClick={() => handleDeleteStudent(st.id)} className="p-1 text-slate-300 hover:text-red-500">
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'schedules' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Xếp Lịch Giảng Dạy & Thời Khóa Biểu</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Admin xếp ca học cho từng lớp và toàn quyền chọn giáo viên đứng lớp</p>
              </div>
              <button
                onClick={() => {
                  if (users.length > 0 && !schedTeacherId) setSchedTeacherId(users[0].id);
                  if (classes.length > 0 && !schedClassId) setSchedClassId(classes[0].id);
                  setIsScheduleModalOpen(true);
                }}
                className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
              >
                <Plus size={16} /> Xếp Ca Dạy Mới
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {schedules.map((sc) => (
                <div key={sc.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3 relative group">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                      {sc.dayOfWeek}
                    </span>
                    <button onClick={() => handleDeleteSchedule(sc.id)} className="text-slate-300 hover:text-red-500 p-1">
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">{sc.class?.name}</h4>
                    <p className="text-[11px] text-emerald-600 font-bold mt-0.5">Trình độ: {sc.class?.level}</p>
                  </div>

                  <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <p className="flex items-center gap-2">
                      <Clock size={13} className="text-amber-600" />
                      <span>{sc.startTime} - {sc.endTime}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Users size={13} className="text-blue-600" />
                      <span>Giáo viên: <strong>{sc.teacher?.name}</strong></span>
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin size={13} className="text-purple-600" />
                      <span>{sc.room || 'Chưa xếp phòng'}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {isClassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              {editingClass ? 'Sửa Thông Tin Lớp Học' : 'Tạo Lớp Học Mới'}
            </h3>
            <form onSubmit={handleSaveClass} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Tên lớp học</label>
                <input
                  type="text"
                  required
                  placeholder="z.B. A1.1 - Khóa Tối 2-4-6"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Trình độ (Niveau)</label>
                <select
                  value={classLevel}
                  onChange={(e) => setClassLevel(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                >
                  {ALL_LEVELS.map((lvl) => <option key={lvl} value={lvl}>{lvl}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Chỉ định giáo viên giảng dạy</label>
                <select
                  value={classTeacherId}
                  onChange={(e) => setClassTeacherId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                >
                  <option value="">-- Chưa chỉ định giáo viên --</option>
                  {users.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setIsClassModalOpen(false)} className="text-xs font-semibold px-4 py-2 text-slate-500">Hủy</button>
                <button type="submit" className="text-xs font-bold px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">Lưu Lớp Học</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isStudentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Thêm Học Sinh Mới</h3>
            <form onSubmit={handleAddSingleStudent} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Xếp vào lớp:</label>
                <select
                  value={singleStudentClassId}
                  onChange={(e) => setSingleStudentClassId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                >
                  {classes.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.level})</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Họ và tên học sinh:</label>
                <input
                  type="text"
                  required
                  placeholder="z.B. Nguyễn Văn An"
                  value={singleStudentName}
                  onChange={(e) => setSingleStudentName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Email:</label>
                <input
                  type="email"
                  placeholder="an.nguyen@email.com"
                  value={singleStudentEmail}
                  onChange={(e) => setSingleStudentEmail(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Số điện thoại:</label>
                <input
                  type="text"
                  placeholder="0912345678"
                  value={singleStudentPhone}
                  onChange={(e) => setSingleStudentPhone(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setIsStudentModalOpen(false)} className="text-xs font-semibold px-4 py-2 text-slate-500">Hủy</button>
                <button type="submit" className="text-xs font-bold px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">Thêm Học Sinh</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isExcelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl h-[85vh] p-6 flex flex-col border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                  <FileSpreadsheet size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Import Học Sinh từ Excel / CSV</h3>
                  <p className="text-xs text-slate-500">Copy các dòng từ file Excel rồi dán trực tiếp hoặc tải file CSV lên</p>
                </div>
              </div>
              <button onClick={() => setIsExcelModalOpen(false)} className="p-1 text-slate-400"><X size={18} /></button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Xếp danh sách này vào lớp:</label>
                <select
                  value={excelTargetClassId}
                  onChange={(e) => setExcelTargetClassId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                >
                  {classes.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.level})</option>)}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-600">Dán dữ liệu từ Excel (Cột: Họ tên | Email | SĐT):</label>
                  <label className="text-xs font-bold text-teal-600 hover:underline cursor-pointer">
                    Hoặc tải file .CSV lên
                    <input type="file" accept=".csv" onChange={handleFileUploadCsv} className="hidden" />
                  </label>
                </div>
                <textarea
                  rows={4}
                  value={excelPasteData}
                  onChange={(e) => setExcelPasteData(e.target.value)}
                  placeholder={`Nguyễn Văn A\tan.nguyen@email.com\t0912345678\nTrần Thị B\tb.tran@email.com\t0987654321`}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                />
                <button
                  type="button"
                  onClick={handleParseExcelPaste}
                  className="mt-2 text-xs font-bold px-4 py-2 bg-slate-800 text-white rounded-xl"
                >
                  Xác nhận & Xem trước dữ liệu
                </button>
              </div>

              {parsedExcelStudents.length > 0 && (
                <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
                  <div className="p-2.5 px-4 bg-teal-50 dark:bg-teal-950/40 text-teal-800 font-bold text-xs flex justify-between">
                    <span>Xem trước ({parsedExcelStudents.length} học viên hợp lệ):</span>
                    <span>Sẵn sàng nạp</span>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 dark:bg-slate-800 text-slate-400">
                        <tr>
                          <th className="p-2 pl-4">Họ và tên</th>
                          <th className="p-2">Email</th>
                          <th className="p-2">Số điện thoại</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {parsedExcelStudents.map((st, i) => (
                          <tr key={i}>
                            <td className="p-2 pl-4 font-bold">{st.name}</td>
                            <td className="p-2 text-slate-500 font-mono">{st.email || '—'}</td>
                            <td className="p-2 text-slate-500 font-mono">{st.phone || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button type="button" onClick={() => setIsExcelModalOpen(false)} className="text-xs font-semibold px-4 py-2 text-slate-500">Hủy</button>
              <button
                type="button"
                disabled={parsedExcelStudents.length === 0 || isImportingExcel}
                onClick={handleExecuteBatchImport}
                className="text-xs font-bold px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-xs disabled:opacity-40"
              >
                {isImportingExcel ? 'Đang import...' : `Lưu Toàn Bộ (${parsedExcelStudents.length} học viên)`}
              </button>
            </div>
          </div>
        </div>
      )}

      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Xếp Ca Học Cho Trung Tâm</h3>
            <form onSubmit={handleCreateSchedule} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Chọn lớp học</label>
                <select
                  value={schedClassId}
                  onChange={(e) => setSchedClassId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                >
                  {classes.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.level})</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Chỉ định giáo viên đứng lớp</label>
                <select
                  value={schedTeacherId}
                  onChange={(e) => setSchedTeacherId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-amber-600"
                >
                  {users.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Thứ trong tuần</label>
                <select
                  value={schedDay}
                  onChange={(e) => setSchedDay(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                >
                  {DAYS_OF_WEEK.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Giờ bắt đầu</label>
                  <input
                    type="text"
                    required
                    value={schedStart}
                    onChange={(e) => setSchedStart(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Giờ kết thúc</label>
                  <input
                    type="text"
                    required
                    value={schedEnd}
                    onChange={(e) => setSchedEnd(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Phòng học</label>
                <input
                  type="text"
                  value={schedRoom}
                  onChange={(e) => setSchedRoom(e.target.value)}
                  placeholder="z.B. Phòng 201 hoặc Online Zoom"
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setIsScheduleModalOpen(false)} className="text-xs font-semibold px-4 py-2 text-slate-500">Hủy</button>
                <button type="submit" className="text-xs font-bold px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl">Lưu Ca Dạy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isNewBookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4 border border-slate-200 dark:border-slate-800">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Thêm Cuốn Sách Giáo Trình Mới</h3>
            <form onSubmit={handleCreateBook} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Tên cuốn sách</label>
                <input
                  type="text"
                  required
                  placeholder="z.B. Aspekte Neu B2"
                  value={newBookTitle}
                  onChange={(e) => setNewBookTitle(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nhà xuất bản</label>
                <input
                  type="text"
                  placeholder="Klett Verlag"
                  value={newBookPublisher}
                  onChange={(e) => setNewBookPublisher(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Trình độ (Niveau)</label>
                <select
                  value={newBookLevel}
                  onChange={(e) => setNewBookLevel(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                >
                  {ALL_LEVELS.map((lvl) => <option key={lvl} value={lvl}>{lvl}</option>)}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setIsNewBookModalOpen(false)} className="text-xs font-semibold px-4 py-2 text-slate-500">Hủy</button>
                <button type="submit" disabled={isCreatingBook} className="text-xs font-bold px-5 py-2.5 bg-purple-600 text-white rounded-xl">
                  {isCreatingBook ? 'Đang tạo...' : 'Tạo Sách'}
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
              <button onClick={() => setEditingBook(null)} className="p-1 text-slate-400"><X size={16} /></button>
            </div>
            <form onSubmit={handleUpdateBook} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Tên cuốn sách</label>
                <input
                  type="text"
                  required
                  value={editingBook.title}
                  onChange={(e) => setEditingBook({ ...editingBook, title: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nhà xuất bản</label>
                <input
                  type="text"
                  value={editingBook.publisher}
                  onChange={(e) => setEditingBook({ ...editingBook, publisher: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Trình độ (Niveau)</label>
                <select
                  value={editingBook.level}
                  onChange={(e) => setEditingBook({ ...editingBook, level: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border font-bold"
                >
                  {ALL_LEVELS.map((lvl) => <option key={lvl} value={lvl}>{lvl}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setEditingBook(null)} className="text-xs font-semibold px-4 py-2 text-slate-500">Hủy</button>
                <button type="submit" disabled={isUpdatingBook} className="text-xs font-bold px-5 py-2.5 bg-blue-600 text-white rounded-xl">Lưu Thay Đổi</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {inspectingLektion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-3xl h-[88vh] shadow-2xl p-6 flex flex-col border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <ListFilter size={18} className="text-purple-600" />
                Soát & Sửa Từ Vựng Lektion {inspectingLektion.lektionNumber}: {inspectingLektion.title}
              </h3>
              <button onClick={() => setInspectingLektion(null)} className="p-1 text-slate-400"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto py-3 space-y-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-slate-700">Danh sách ({lektionVocabList.length} từ):</span>
                <button
                  onClick={() => setLektionVocabList([...lektionVocabList, { id: `w-${Date.now()}`, article: '-', german: '', translation: '', plural: '', example: '' }])}
                  className="text-xs font-bold text-purple-600 hover:underline flex items-center gap-1"
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
                    className="text-xs font-bold p-1 rounded border bg-white dark:bg-slate-800"
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
                    className="w-1/3 text-xs p-1.5 rounded border bg-white dark:bg-slate-800 font-bold"
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
                    className="w-1/3 text-xs p-1.5 rounded border bg-white dark:bg-slate-800"
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
                    className="flex-1 text-xs p-1.5 rounded border bg-white dark:bg-slate-800 italic"
                  />
                  <button onClick={() => setLektionVocabList(lektionVocabList.filter((_, idx) => idx !== i))} className="text-slate-300 hover:text-red-600 p-1">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button type="button" onClick={() => setInspectingLektion(null)} className="text-xs font-semibold px-4 py-2 text-slate-500">Hủy</button>
              <button type="button" disabled={isSavingContents} onClick={handleSaveLektionContents} className="text-xs font-bold px-5 py-2.5 bg-purple-600 text-white rounded-xl">
                {isSavingContents ? 'Đang lưu...' : 'Lưu Danh Sách Từ Vựng'}
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
              <button onClick={() => setEditingLektion(null)} className="p-1 text-slate-400"><X size={16} /></button>
            </div>
            <form onSubmit={handleUpdateLektion} className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Số Lektion</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={editingLektion.lektionNumber}
                    onChange={(e) => setEditingLektion({ ...editingLektion, lektionNumber: Number(e.target.value) })}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border font-bold"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Tiêu đề bài</label>
                  <input
                    type="text"
                    required
                    value={editingLektion.title}
                    onChange={(e) => setEditingLektion({ ...editingLektion, title: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border font-bold"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Chủ đề bài học (Thema)</label>
                <input
                  type="text"
                  value={editingLektion.theme || ''}
                  onChange={(e) => setEditingLektion({ ...editingLektion, theme: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setEditingLektion(null)} className="text-xs font-semibold px-4 py-2 text-slate-500">Hủy</button>
                <button type="submit" disabled={isUpdatingLektion} className="text-xs font-bold px-5 py-2.5 bg-purple-600 text-white rounded-xl">Lưu Lektion</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedBookForScan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl h-[90vh] shadow-2xl p-6 flex flex-col border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-base text-purple-900 dark:text-purple-400 flex items-center gap-2">
                <Sparkles size={18} className="text-purple-600" />
                AI Tự Quét Mục Lục: {selectedBookForScan.title}
              </h3>
              <p className="text-xs text-slate-500">Tải file PDF sách lên, AI sẽ tự đọc trang mục lục và trích xuất từng Lektion</p>
            </div>
            <div className="p-1 overflow-y-auto flex-1 space-y-4 my-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">File PDF cuốn sách:</label>
                <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-purple-200 rounded-xl bg-purple-50/30 cursor-pointer text-center">
                  <UploadCloud size={30} className="text-purple-600 mb-1" />
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
                <div className="py-6 text-center text-xs font-bold text-purple-700 animate-pulse">
                  AI đang đọc trang mục lục và phân tích các Lektion...
                </div>
              )}

              {fullPdfFile && !isDetectingToc && detectedToc.length === 0 && (
                <div className="flex justify-center pt-2">
                  <button
                    type="button"
                    onClick={handleDetectTOC}
                    className="flex items-center gap-2 text-xs font-bold px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-md"
                  >
                    <Search size={16} /> Bắt đầu Quét Mục Lục AI
                  </button>
                </div>
              )}

              {detectedToc.length > 0 && (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {detectedToc.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-xl border flex items-center justify-between gap-3 bg-white dark:bg-slate-800">
                      <div>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 mr-2">
                          Lektion {item.lektionNumber}
                        </span>
                        <strong className="text-xs">{item.title}</strong>
                        <p className="text-[11px] text-slate-500 mt-0.5">Trang {item.startPage} - {item.endPage}</p>
                      </div>
                      <button
                        type="button"
                        disabled={ingestingIndex !== null || item.isIngested}
                        onClick={() => handleIngestSingleLektion(item, idx)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg text-white ${item.isIngested ? 'bg-emerald-600' : 'bg-purple-600 hover:bg-purple-700'}`}
                      >
                        {item.isIngested ? 'Đã nạp' : ingestingIndex === idx ? 'Đang nạp...' : 'Nạp bài này'}
                      </button>
                    </div>
                  ))}
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
                className="text-xs font-semibold px-4 py-2 text-slate-500"
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