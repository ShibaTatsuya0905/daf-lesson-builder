import React, { useState, useEffect } from 'react';
import { X, Users, Calendar, Award, CheckCircle2, Star, BookOpen, Clock, MapPin, Loader2 } from 'lucide-react';
import { apiRequest } from '../../services/apiClient';

interface AcademicModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'classes' | 'evaluations' | 'schedules';
}

export const AcademicModal: React.FC<AcademicModalProps> = ({ isOpen, onClose, initialTab = 'classes' }) => {
  const [activeTab, setActiveTab] = useState<'classes' | 'evaluations' | 'schedules'>(initialTab);
  const [classes, setClasses] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [rating, setRating] = useState('Tốt');
  const [feedback, setFeedback] = useState('');
  const [savingEvaluation, setSavingEvaluation] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      fetchData();
    }
  }, [isOpen, initialTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [classRes, schedRes] = await Promise.all([
        apiRequest('/academic/teacher/classes'),
        apiRequest('/academic/teacher/schedules'),
      ]);
      if (classRes.ok) {
        const classData = await classRes.json();
        setClasses(classData);
        if (classData.length > 0 && !selectedClassId) {
          setSelectedClassId(classData[0].id);
        }
      }
      if (schedRes.ok) {
        setSchedules(await schedRes.json());
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEvaluation = (student: any) => {
    setSelectedStudent(student);
    const existing = student.evaluations?.[0];
    setRating(existing?.rating || 'Tốt');
    setFeedback(existing?.feedback || '');
  };

  const handleSaveEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    setSavingEvaluation(true);
    try {
      const res = await apiRequest('/academic/teacher/evaluations', {
        method: 'POST',
        body: JSON.stringify({
          studentId: selectedStudent.id,
          rating,
          feedback,
        }),
      });

      if (res.ok) {
        setSelectedStudent(null);
        fetchData();
      }
    } finally {
      setSavingEvaluation(false);
    }
  };

  if (!isOpen) return null;

  const currentClass = classes.find((c) => c.id === selectedClassId) || classes[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl h-[85vh] shadow-2xl flex flex-col overflow-hidden">
        
        <div className="p-4 px-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-950/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <BookOpen size={20} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Học vụ & Giảng dạy</h3>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">Xem lớp học, đánh giá học viên và theo dõi lịch dạy được phân công</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"><X size={18} /></button>
        </div>

        <div className="flex border-b border-slate-100 dark:border-slate-800 px-6 bg-slate-50/50 dark:bg-slate-800/40 gap-2">
          <button
            onClick={() => setActiveTab('classes')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'classes' ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users size={16} /> Lớp học của tôi ({classes.length})
          </button>
          <button
            onClick={() => setActiveTab('evaluations')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'evaluations' ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Award size={16} /> Đánh giá học tập
          </button>
          <button
            onClick={() => setActiveTab('schedules')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'schedules' ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar size={16} /> Lịch giảng dạy ({schedules.length})
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-slate-900">
          {loading ? (
            <div className="flex items-center justify-center h-full text-slate-400 gap-2">
              <Loader2 size={18} className="animate-spin text-emerald-600" />
              <span className="text-xs">Đang tải dữ liệu học vụ...</span>
            </div>
          ) : activeTab === 'classes' ? (
            classes.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-xs">Admin chưa phân công lớp học nào cho bạn.</div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {classes.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedClassId(c.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                        selectedClassId === c.id
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {c.name} ({c.level}) · {c.students.length} học viên
                    </button>
                  ))}
                </div>

                {currentClass && (
                  <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                    <div className="p-3.5 px-5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-800 dark:text-white">
                        Danh sách học viên lớp {currentClass.name}
                      </span>
                      <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md">
                        Trình độ: {currentClass.level}
                      </span>
                    </div>

                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50/50 dark:bg-slate-800/40 text-slate-400 border-b border-slate-100 dark:border-slate-800">
                        <tr>
                          <th className="p-3 pl-5">STT</th>
                          <th className="p-3">Họ và tên</th>
                          <th className="p-3">Email</th>
                          <th className="p-3">Số điện thoại</th>
                          <th className="p-3 text-right pr-5">Đánh giá gần nhất</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {currentClass.students.length === 0 ? (
                          <tr><td colSpan={5} className="p-6 text-center text-slate-400">Lớp chưa có học viên nào.</td></tr>
                        ) : (
                          currentClass.students.map((st: any, idx: number) => (
                            <tr key={st.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                              <td className="p-3 pl-5 text-slate-400">{idx + 1}</td>
                              <td className="p-3 font-bold text-slate-800 dark:text-white">{st.name}</td>
                              <td className="p-3 text-slate-500">{st.email || '—'}</td>
                              <td className="p-3 text-slate-500">{st.phone || '—'}</td>
                              <td className="p-3 text-right pr-5">
                                <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                  {st.evaluations?.[0]?.rating || 'Chưa đánh giá'}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )
          ) : activeTab === 'evaluations' ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-slate-500">Chọn lớp:</span>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                >
                  {classes.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.level})</option>)}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentClass?.students.map((st: any) => {
                  const evalItem = st.evaluations?.[0];
                  return (
                    <div key={st.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">{st.name}</h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                            {evalItem?.rating || 'Chưa có xếp loại'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2 italic">
                          {evalItem?.feedback ? `"${evalItem.feedback}"` : 'Chưa có nhận xét nào từ giáo viên.'}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                        <button
                          onClick={() => handleOpenEvaluation(st)}
                          className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          {evalItem ? 'Sửa nhận xét' : 'Nhập đánh giá'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            schedules.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-xs">Admin chưa xếp ca dạy nào cho bạn.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {schedules.map((sc) => (
                  <div key={sc.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-emerald-50/30 dark:bg-emerald-950/20 space-y-2">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-600 text-white uppercase tracking-wider">
                      {sc.dayOfWeek}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{sc.class?.name} ({sc.class?.level})</h4>
                    <div className="text-xs text-slate-500 space-y-1 pt-1">
                      <p className="flex items-center gap-1.5"><Clock size={13} className="text-emerald-600" /> {sc.startTime} - {sc.endTime}</p>
                      <p className="flex items-center gap-1.5"><MapPin size={13} className="text-emerald-600" /> {sc.room || 'Chưa xếp phòng'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>

      {selectedStudent && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              Đánh giá học viên: {selectedStudent.name}
            </h3>

            <form onSubmit={handleSaveEvaluation} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Xếp loại / Mức độ tiếp thu:</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                >
                  <option value="Xuất sắc">Xuất sắc</option>
                  <option value="Tốt">Tốt</option>
                  <option value="Khá">Khá</option>
                  <option value="Cần cố gắng">Cần cố gắng</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Nhận xét chi tiết của giáo viên:</label>
                <textarea
                  required
                  rows={4}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Tiến độ học từ vựng, ngữ pháp, độ tự tin khi nói..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="text-xs font-semibold px-4 py-2 text-slate-500"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={savingEvaluation}
                  className="text-xs font-bold px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
                >
                  {savingEvaluation ? 'Đang lưu...' : 'Lưu đánh giá'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};