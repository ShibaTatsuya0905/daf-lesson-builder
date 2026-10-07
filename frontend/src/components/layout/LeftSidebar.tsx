import React, { useEffect } from 'react';
import {
  BookOpen,
  Plus,
  FolderOpen,
  ChevronLeft,
  ChevronRight,
  FileText,
  LogIn,
  LogOut,
  Trash2,
  ShieldCheck,
} from 'lucide-react';
import { useLessonStore } from '../../store/useLessonStore';
import { useAuthStore } from '../../store/useAuthStore';

export const LeftSidebar: React.FC = () => {
  const { 
    isSidebarOpen, 
    toggleSidebar, 
    lessonInfo, 
    createEmptyLesson, 
    myLessons, 
    fetchMyLessons, 
    loadLessonById, 
    deleteLessonFromCloud,
    toggleAdminView 
  } = useLessonStore();
  
  const { isAuthenticated, user, openAuthModal, logout } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyLessons();
    }
  }, [isAuthenticated, fetchMyLessons]);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Bạn có chắc chắn muốn xóa giáo án này không?')) {
      deleteLessonFromCloud(id);
    }
  };

  return (
    <aside
      className={`relative flex flex-col border-r border-slate-200 bg-white transition-all duration-300 z-10 select-none ${
        isSidebarOpen ? 'w-64' : 'w-16'
      }`}
    >
      <button
        type="button"
        onClick={toggleSidebar}
        className="absolute -right-3 top-5 w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 shadow-sm hover:bg-slate-50 transition-colors z-20"
      >
        {isSidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>

      <div className="p-4 border-b border-slate-100 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
          DaF
        </div>
        {isSidebarOpen && (
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-slate-800 truncate leading-tight">DaF Lesson Builder</h2>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {isAuthenticated && user?.role === 'ADMIN' && (
          <div>
            <button
              onClick={() => toggleAdminView(true)}
              className={`w-full flex items-center gap-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold text-xs transition-all shadow-xs ${
                isSidebarOpen ? 'p-2.5 justify-start' : 'p-2 justify-center'
              }`}
              title="Mở cổng quản trị Admin"
            >
              <ShieldCheck size={18} className="text-purple-600 shrink-0" />
              {isSidebarOpen && <span>Admin Dashboard</span>}
            </button>
          </div>
        )}

        <div>
          {isSidebarOpen ? (
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">
              <span className="flex items-center gap-1.5"><BookOpen size={14} /> Meine Kurse</span>
            </div>
          ) : (
            <div className="flex justify-center mb-2 text-slate-400"><BookOpen size={18} /></div>
          )}

          <div className="space-y-1">
            {!isAuthenticated ? (
              <p className="text-xs text-center text-slate-400 p-4 border border-dashed rounded-lg">Đăng nhập để lưu giáo án.</p>
            ) : myLessons.length === 0 ? (
              <p className="text-xs text-center text-slate-400 p-4 border border-dashed rounded-lg">Chưa có giáo án nào.</p>
            ) : (
              myLessons.map((item) => {
                const isActive = item.id === lessonInfo.id;
                return (
                  <div key={item.id} className={`w-full text-left rounded-lg text-xs font-medium transition-colors flex items-center justify-between group ${isSidebarOpen ? 'px-3 py-2' : 'p-2 justify-center'} ${isActive ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}>
                    <button type="button" onClick={() => loadLessonById(item.id!)} className="flex items-center gap-2 flex-1 min-w-0">
                      <FileText size={15} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
                      {isSidebarOpen && <span className="truncate">{item.title}</span>}
                    </button>
                    {isSidebarOpen && (
                      <button type="button" onClick={(e) => handleDelete(e, item.id!)} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 p-1">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="p-3 border-t border-slate-100 space-y-1.5">
        <button type="button" onClick={createEmptyLesson} className={`w-full flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-sm ${isSidebarOpen ? 'px-3 py-2 justify-start' : 'p-2 justify-center'}`}>
          <Plus size={16} />{isSidebarOpen && <span>Neue Lektion</span>}
        </button>

        {isAuthenticated && user ? (
          <div className={`w-full flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 ${!isSidebarOpen ? 'flex-col gap-1' : ''}`}>
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">{user.name.charAt(0).toUpperCase()}</div>
              {isSidebarOpen && (
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">{user.name}</p>
                </div>
              )}
            </div>
            <button type="button" onClick={logout} className="p-1 text-slate-400 hover:text-red-600 transition-colors"><LogOut size={15} /></button>
          </div>
        ) : (
          <button type="button" onClick={() => openAuthModal('login')} className={`w-full flex items-center gap-2 rounded-lg border border-slate-200 hover:bg-blue-50 hover:border-blue-300 text-blue-600 text-xs font-bold transition-colors ${isSidebarOpen ? 'px-3 py-2 justify-start' : 'p-2 justify-center'}`}>
            <LogIn size={16} />{isSidebarOpen && <span>Lehrer-Login</span>}
          </button>
        )}
      </div>
    </aside>
  );
};