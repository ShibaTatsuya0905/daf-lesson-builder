import React, { useEffect } from 'react';
import {
  LayoutDashboard, Library, Calendar, Users, 
  LogIn, LogOut, FileText, ChevronLeft, ChevronRight, ShieldCheck, PieChart, FolderOpen
} from 'lucide-react';
import { useLessonStore } from '../../store/useLessonStore';
import { useAuthStore } from '../../store/useAuthStore';

export const LeftSidebar: React.FC = () => {
  const { 
    isSidebarOpen, toggleSidebar,
    fetchMyLessons, toggleAdminView, openSmartBookModal, openAcademicModal,
    activeTab, setActiveTab
  } = useLessonStore();
  
  const { isAuthenticated, user, openAuthModal, logout } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) fetchMyLessons();
  }, [isAuthenticated, fetchMyLessons]);

  const navItemClass = (isActive: boolean) => `
    w-full flex items-center gap-3 px-4 py-2.5 rounded-cards text-[14px] font-semibold transition-all duration-200 cursor-pointer
    ${isActive 
      ? 'bg-lilac-wash text-iris-bolt' 
      : 'text-slate-veil hover:bg-chalk-canvas hover:text-ink-charcoal'}
  `;

  return (
    <aside
      className={`relative flex flex-col bg-paper-white border-r border-mist-border transition-all duration-300 z-10 select-none ${
        isSidebarOpen ? 'w-[260px]' : 'w-20'
      }`}
    >
      <button
        type="button"
        onClick={toggleSidebar}
        className="absolute -right-3.5 top-7 w-7 h-7 rounded-full bg-paper-white border border-mist-border flex items-center justify-center text-slate-veil shadow-sm hover:text-ink-charcoal transition-colors z-20 cursor-pointer"
      >
        {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>

      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-iris-bolt flex items-center justify-center text-paper-white font-bold text-lg shrink-0">
          Q
        </div>
        {isSidebarOpen && (
          <div className="min-w-0">
            <h2 className="text-[20px] font-bold text-ink-charcoal leading-tight">DaF Workspace</h2>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6">
        <div className="space-y-1">
          {isSidebarOpen && <p className="px-4 text-[12px] font-semibold text-fog-mist uppercase tracking-wider mb-2">Workspace</p>}
          <button onClick={() => setActiveTab('overview')} className={navItemClass(activeTab === 'overview')}>
            <LayoutDashboard size={20} />
            {isSidebarOpen && <span>Home</span>}
          </button>
          <button onClick={() => setActiveTab('my_lessons')} className={navItemClass(activeTab === 'my_lessons')}>
            <FolderOpen size={20} />
            {isSidebarOpen && <span>My Lessons</span>}
          </button>
          <button onClick={() => setActiveTab('editor')} className={navItemClass(activeTab === 'editor')}>
            <FileText size={20} />
            {isSidebarOpen && <span>Current Draft</span>}
          </button>
          <button onClick={openSmartBookModal} className={navItemClass(false)}>
            <Library size={20} />
            {isSidebarOpen && <span>Library</span>}
          </button>
          <button onClick={() => openAcademicModal('schedules')} className={navItemClass(false)}>
            <Calendar size={20} />
            {isSidebarOpen && <span>Schedules</span>}
          </button>
        </div>

        <div className="space-y-1">
          {isSidebarOpen && <p className="px-4 text-[12px] font-semibold text-fog-mist uppercase tracking-wider mb-2">Management</p>}
          <button onClick={() => openAcademicModal('classes')} className={navItemClass(false)}>
            <Users size={20} />
            {isSidebarOpen && <span>Classes</span>}
          </button>
          <button onClick={() => openAcademicModal('evaluations')} className={navItemClass(false)}>
            <PieChart size={20} />
            {isSidebarOpen && <span>Evaluations</span>}
          </button>

          {isAuthenticated && user?.role === 'ADMIN' && (
            <button onClick={() => toggleAdminView(true)} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-cards text-[14px] font-semibold text-deep-indigo hover:bg-chalk-canvas transition-colors mt-2 cursor-pointer`}>
              <ShieldCheck size={20} />
              {isSidebarOpen && <span>Admin Portal</span>}
            </button>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-mist-border space-y-2">
        {isAuthenticated && user ? (
          <div className={`w-full flex items-center justify-between p-3 rounded-cards hover:bg-chalk-canvas transition-colors ${!isSidebarOpen ? 'flex-col gap-2' : ''}`}>
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-lilac-wash text-iris-bolt flex items-center justify-center font-bold text-sm shrink-0">
                {user.name.substring(0, 1).toUpperCase()}
              </div>
              {isSidebarOpen && (
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold text-ink-charcoal truncate">{user.name}</p>
                  <p className="text-[12px] text-slate-veil truncate">{user.role}</p>
                </div>
              )}
            </div>
            <button type="button" onClick={logout} className="p-2 text-slate-veil hover:text-ink-charcoal rounded transition-colors cursor-pointer" title="Log out">
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => openAuthModal('login')} className={`w-full flex items-center justify-center gap-2 rounded-pills bg-iris-bolt hover:opacity-90 text-paper-white text-[14px] font-semibold py-2.5 transition-opacity shadow-sm cursor-pointer ${isSidebarOpen ? 'px-4' : 'px-2'}`}>
            <LogIn size={18} />{isSidebarOpen && <span>Log in</span>}
          </button>
        )}
      </div>
    </aside>
  );
};