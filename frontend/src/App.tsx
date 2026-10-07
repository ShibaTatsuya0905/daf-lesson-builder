import { useEffect } from 'react';
import { LeftSidebar } from './components/layout/LeftSidebar';
import { LessonHeader } from './components/layout/LessonHeader';
import { RightQuickToolbar } from './components/layout/RightQuickToolbar';
import { KanbanBuilder } from './components/Builder/KanbanBuilder';
import { DocumentPreview } from './components/preview/DocumentPreview';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AddActivityModal } from './components/modals/AddActivityModal';
import { LessonTemplateModal } from './components/modals/LessonTemplateModal';
import { AIAssistantModal } from './components/modals/AIAssistantModal';
import { ExportModal } from './components/modals/ExportModal';
import { AuthModal } from './components/modals/AuthModal';
import { SmartBookModal } from './components/modals/SmartBookModal';
import { PdfScannerModal } from './components/modals/PdfScannerModal';
import { ExamGeneratorModal } from './components/modals/ExamGeneratorModal';
import { SpeakingExaminerModal } from './components/modals/SpeakingExaminerModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { PdfCutterModal } from './components/modals/PdfCutterModal';
import { useLessonStore } from './store/useLessonStore';
import { useAuthStore } from './store/useAuthStore';

export function App() {
  const { viewMode, undo, redo, triggerAutosave, isAdminViewOpen, theme, fontSize } = useLessonStore();
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('daf_theme') || theme || 'light';
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    const currentSize = localStorage.getItem('daf_font_size') || fontSize || 'normal';
    if (currentSize === 'large') {
      document.documentElement.classList.add('font-size-large');
      document.documentElement.classList.remove('font-size-medium');
    } else if (currentSize === 'medium') {
      document.documentElement.classList.add('font-size-medium');
      document.documentElement.classList.remove('font-size-large');
    } else {
      document.documentElement.classList.remove('font-size-large', 'font-size-medium');
    }
  }, [fontSize]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); }
      else if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); triggerAutosave(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, triggerAutosave]);

  if (isAdminViewOpen) {
    return (
      <div className="h-screen w-screen overflow-y-auto bg-slate-50 dark:bg-slate-950 font-sans antialiased">
        <AdminDashboard />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 antialiased transition-colors">
      <LeftSidebar />
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <LessonHeader />
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
          {viewMode === 'preview' || viewMode === 'student' ? <DocumentPreview /> : <KanbanBuilder />}
        </main>
      </div>
      <RightQuickToolbar />

      <AddActivityModal />
      <LessonTemplateModal />
      <AIAssistantModal />
      <ExportModal />
      <AuthModal />
      <SmartBookModal />
      <PdfScannerModal />
      <ExamGeneratorModal />
      <SpeakingExaminerModal />
      <SettingsModal />
      <PdfCutterModal />
    </div>
  );
}

export default App;