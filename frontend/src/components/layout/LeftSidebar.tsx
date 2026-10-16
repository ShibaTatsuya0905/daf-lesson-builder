import React, { useEffect } from 'react';
import {
  BookOpen, LayoutDashboard, Library, Calendar, Users, 
  Settings, LogIn, LogOut, FileText, ChevronLeft, ChevronRight, ShieldCheck, PieChart, FolderOpen
} from 'lucide-react';
import { useLessonStore } from '../../store/useLessonStore';
import { useAuthStore } from '../../store/useAuthStore';

export const LeftSidebar: React.FC = () => {
  const { 
    isSidebarOpen, toggleSidebar, createEmptyLesson, 
    fetchMyLessons, toggleAdminView, openSmartBookModal, openAcademicModal,
    activeTab, setActiveTab
  } = useLessonStore();
  
  const { isAuthenticated, user, openAuthModal, logout } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) fetchMyLessons();
  }, [isAuthenticated, fetchMyLessons]);

  const navItemClass = (isActive: boolean) => `
    w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
    ${isActive 
      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 font-semibold shadow-sm ring-1 ring-indigo-500/20' 
      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'}
  `;

  return (
    <aside
      className={`relative flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800/80 transition-all duration-300 z-10 select-none ${
        isSidebarOpen ? 'w-[260px]' : 'w-20'
      }`}
    >
      <button
        type="button"
        onClick={toggleSidebar}
        className="absolute -right-3.5 top-7 w-7 h-7 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500 shadow-sm hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors z-20"
      >
        {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>

      <div className="p-6 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center text-white shadow-md shrink-0">
          <BookOpen size={18} />
        </div>
        {isSidebarOpen && (
          <div className="min-w-0">
            <h2 className="text-[15px] font-bold text-slate-900 dark:text-white leading-tight tracking-tight">Lớp học xanh</h2>
            <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5">DaF Workspace</p>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-8">
        <div className="space-y-1.5">
          {isSidebarOpen && <p className="px-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Không gian làm việc</p>}
          
          <button onClick={() => setActiveTab('overview')} className={navItemClass(activeTab === 'overview')}>
            <LayoutDashboard size={18} className={activeTab === 'overview' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'} />
            {isSidebarOpen && <span>Tổng quan</span>}
          </button>

          <button onClick={() => setActiveTab('my_lessons')} className={navItemClass(activeTab === 'my_lessons')}>
            <FolderOpen size={18} className={activeTab === 'my_lessons' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'} />
            {isSidebarOpen && <span>Giáo án của tôi</span>}
          </button>

          <button onClick={() => setActiveTab('editor')} className={navItemClass(activeTab === 'editor')}>
            <FileText size={18} className={activeTab === 'editor' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'} />
            {isSidebarOpen && <span>Giáo án hiện tại</span>}
          </button>

          <button onClick={openSmartBookModal} className={navItemClass(false)}>
            <Library size={18} className="text-slate-400 dark:text-slate-500" />
            {isSidebarOpen && <span>Thư viện giáo trình</span>}
          </button>

          <button onClick={() => openAcademicModal('schedules')} className={navItemClass(false)}>
            <Calendar size={18} className="text-slate-400 dark:text-slate-500" />
            {isSidebarOpen && <span>Lịch giảng dạy</span>}
          </button>
        </div>

        <div className="space-y-1.5">
          {isSidebarOpen && <p className="px-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Quản lý</p>}
          
          <button onClick={() => openAcademicModal('classes')} className={navItemClass(false)}>
            <Users size={18} className="text-slate-400 dark:text-slate-500" />
            {isSidebarOpen && <span>Lớp học & Học sinh</span>}
          </button>

          <button onClick={() => openAcademicModal('evaluations')} className={navItemClass(false)}>
            <PieChart size={18} className="text-slate-400 dark:text-slate-500" />
            {isSidebarOpen && <span>Đánh giá học tập</span>}
          </button>

          {isAuthenticated && user?.role === 'ADMIN' && (
            <button onClick={() => toggleAdminView(true)} className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-purple-700 bg-purple-50 dark:bg-purple-500/10 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-500/20 transition-colors mt-2 ring-1 ring-purple-500/20">
              <ShieldCheck size={18} className="text-purple-600 dark:text-purple-400" />
              {isSidebarOpen && <span>Admin Portal</span>}
            </button>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800/80 space-y-2">
        {isAuthenticated && user ? (
          <div className={`w-full flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 ${!isSidebarOpen ? 'flex-col gap-2' : ''}`}>
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-sm shrink-0 ring-1 ring-indigo-200 dark:ring-indigo-800">
                {user.name.substring(0, 2).toUpperCase()}
              </div>
              {isSidebarOpen && (
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{user.name}</p>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">{user.role === 'ADMIN' ? 'Quản trị viên' : 'Giáo viên'}</p>
                </div>
              )}
            </div>
            <button type="button" onClick={logout} className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Đăng xuất">
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => openAuthModal('login')} className={`w-full flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold py-3 transition-colors shadow-sm ${isSidebarOpen ? 'px-4 justify-start' : 'px-2 justify-center'}`}>
            <LogIn size={18} />{isSidebarOpen && <span>Đăng nhập</span>}
          </button>
        )}
      </div>
    </aside>
  );
};