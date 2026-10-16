import React, { useState, useEffect } from 'react';
import { X, Users, Calendar, Award, BookOpen, Clock, MapPin, Loader2 } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-charcoal/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-paper-white border border-mist-border rounded-[24px] w-full max-w-4xl h-[85vh] shadow-md flex flex-col overflow-hidden">
        
        <div className="p-4 px-6 border-b border-mist-border flex items-center justify-between bg-chalk-canvas">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-lilac-wash text-iris-bolt flex items-center justify-center shadow-xs">
              <BookOpen size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-ink-charcoal">Học vụ & Giảng dạy</h3>
              <p className="text-xs text-slate-veil">Xem lớp phụ trách, nhập đánh giá học viên và theo dõi lịch dạy phân công</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full text-slate-veil hover:text-ink-charcoal hover:bg-mist-border cursor-pointer"><X size={18} /></button>
        </div>

        <div className="flex border-b border-mist-border px-6 bg-paper-white gap-3">
          <button
            onClick={() => setActiveTab('classes')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'classes' ? 'border-iris-bolt text-iris-bolt font-bold' : 'border-transparent text-slate-veil hover:text-ink-charcoal'
            }`}
          >
            <Users size={15} /> Lớp học của tôi ({classes.length})
          </button>
          <button
            onClick={() => setActiveTab('evaluations')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'evaluations' ? 'border-iris-bolt text-iris-bolt font-bold' : 'border-transparent text-slate-veil hover:text-ink-charcoal'
            }`}
          >
            <Award size={15} /> Đánh giá học tập
          </button>
          <button
            onClick={() => setActiveTab('schedules')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'schedules' ? 'border-iris-bolt text-iris-bolt font-bold' : 'border-transparent text-slate-veil hover:text-ink-charcoal'
            }`}
          >
            <Calendar size={15} /> Lịch giảng dạy ({schedules.length})
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-chalk-canvas">
          {loading ? (
            <div className="flex items-center justify-center h-full text-slate-veil gap-2">
              <Loader2 size={18} className="animate-spin text-iris-bolt" />
              <span className="text-xs">Đang tải dữ liệu học vụ...</span>
            </div>
          ) : activeTab === 'classes' ? (
            classes.length === 0 ? (
              <div className="text-center py-16 text-fog-mist text-xs">Admin chưa phân công lớp học nào cho bạn.</div>
            ) : (
              <div className="space-y-5">
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {classes.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedClassId(c.id)}
                      className={`px-4 py-2 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                        selectedClassId === c.id
                          ? 'bg-iris-bolt text-paper-white shadow-xs'
                          : 'bg-paper-white border border-mist-border text-slate-veil hover:text-ink-charcoal'
                      }`}
                    >
                      {c.name} ({c.level}) · {c.students.length} học viên
                    </button>
                  ))}
                </div>

                {currentClass && (
                  <div className="border border-mist-border rounded-lg bg-paper-white overflow-hidden shadow-xs">
                    <div className="p-3.5 px-5 bg-chalk-canvas border-b border-mist-border flex justify-between items-center">
                      <span className="text-xs font-bold text-ink-charcoal">
                        Danh sách học viên lớp {currentClass.name}
                      </span>
                      <span className="text-[11px] font-bold text-iris-bolt bg-lilac-wash px-2.5 py-1 rounded border border-mist-border">
                        Niveau: {currentClass.level}
                      </span>
                    </div>

                    <table className="w-full text-xs text-left">
                      <thead className="bg-paper-white text-slate-veil border-b border-mist-border font-semibold">
                        <tr>
                          <th className="p-3 pl-5">STT</th>
                          <th className="p-3">Họ và tên</th>
                          <th className="p-3">Email</th>
                          <th className="p-3">Số điện thoại</th>
                          <th className="p-3 text-right pr-5">Đánh giá gần nhất</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-mist-border">
                        {currentClass.students.length === 0 ? (
                          <tr><td colSpan={5} className="p-6 text-center text-fog-mist">Lớp chưa có học viên nào.</td></tr>
                        ) : (
                          currentClass.students.map((st: any, idx: number) => (
                            <tr key={st.id} className="hover:bg-chalk-canvas transition-colors">
                              <td className="p-3 pl-5 text-slate-veil">{idx + 1}</td>
                              <td className="p-3 font-semibold text-ink-charcoal">{st.name}</td>
                              <td className="p-3 text-slate-veil font-mono">{st.email || '—'}</td>
                              <td className="p-3 text-slate-veil font-mono">{st.phone || '—'}</td>
                              <td className="p-3 text-right pr-5">
                                <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold bg-chalk-canvas border border-mist-border text-slate-veil">
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
                <span className="text-xs font-semibold text-slate-veil">Chọn lớp:</span>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="p-1.5 rounded border border-mist-border bg-paper-white text-xs font-semibold text-ink-charcoal focus:outline-none cursor-pointer"
                >
                  {classes.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.level})</option>)}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {currentClass?.students.map((st: any) => {
                  const evalItem = st.evaluations?.[0];
                  return (
                    <div key={st.id} className="p-4 rounded-lg border border-mist-border bg-paper-white space-y-2 flex flex-col justify-between shadow-xs">
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm font-bold text-ink-charcoal">{st.name}</h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-lilac-wash text-iris-bolt border border-mist-border">
                            {evalItem?.rating || 'Chưa có xếp loại'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-veil mt-2 line-clamp-2 italic leading-relaxed">
                          {evalItem?.feedback ? `"${evalItem.feedback}"` : 'Chưa có nhận xét nào từ giáo viên.'}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-mist-border flex justify-end">
                        <button
                          onClick={() => handleOpenEvaluation(st)}
                          className="text-xs font-semibold px-4 py-1.5 rounded-full bg-iris-bolt hover:opacity-90 text-paper-white shadow-xs transition-opacity cursor-pointer"
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
              <div className="text-center py-16 text-fog-mist text-xs">Admin chưa xếp ca dạy nào cho bạn.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {schedules.map((sc) => (
                  <div key={sc.id} className="p-4 rounded-lg border border-mist-border bg-paper-white space-y-2 shadow-xs">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-lilac-wash text-iris-bolt uppercase tracking-wider">
                      {sc.dayOfWeek}
                    </span>
                    <h4 className="text-sm font-bold text-ink-charcoal">{sc.class?.name} ({sc.class?.level})</h4>
                    <div className="text-xs text-slate-veil space-y-1.5 pt-2 border-t border-mist-border">
                      <p className="flex items-center gap-1.5"><Clock size={13} className="text-slate-veil" /> {sc.startTime} - {sc.endTime}</p>
                      <p className="flex items-center gap-1.5"><MapPin size={13} className="text-slate-veil" /> {sc.room || 'Chưa xếp phòng'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>

      {selectedStudent && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-ink-charcoal/40 p-4">
          <div className="bg-paper-white rounded-[24px] max-w-md w-full p-6 space-y-4 border border-mist-border shadow-md">
            <h3 className="font-bold text-base text-ink-charcoal">
              Đánh giá học viên: {selectedStudent.name}
            </h3>

            <form onSubmit={handleSaveEvaluation} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-veil mb-1">Xếp loại / Mức độ tiếp thu:</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className="w-full text-xs p-2.5 rounded bg-chalk-canvas border border-mist-border font-semibold text-ink-charcoal focus:outline-none cursor-pointer"
                >
                  <option value="Xuất sắc">Xuất sắc</option>
                  <option value="Tốt">Tốt</option>
                  <option value="Khá">Khá</option>
                  <option value="Cần cố gắng">Cần cố gắng</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-veil mb-1">Nhận xét chi tiết của giáo viên:</label>
                <textarea
                  required
                  rows={4}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Tiến độ học từ vựng, ngữ pháp, độ tự tin khi nói..."
                  className="w-full text-xs p-2.5 rounded bg-chalk-canvas border border-mist-border text-ink-charcoal focus:outline-none focus:border-iris-bolt leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="text-xs font-semibold px-4 py-2 text-slate-veil hover:text-ink-charcoal cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={savingEvaluation}
                  className="text-xs font-semibold px-6 py-2.5 bg-iris-bolt hover:opacity-90 text-paper-white rounded-full shadow-xs transition-opacity cursor-pointer"
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