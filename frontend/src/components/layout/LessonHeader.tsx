import React from 'react';
import {
  Clock, CheckCircle2, AlertCircle, Loader2, RotateCcw, RotateCw, 
  Sparkles, Eye, GraduationCap, Download, FileCheck2, Mic, 
  Moon, Sun, Settings, Save, Scissors, Check, RefreshCw
} from 'lucide-react';
import { useLessonStore } from '../../store/useLessonStore';

export const LessonHeader: React.FC = () => {
  const {
    lessonInfo, updateLessonInfo, blocks, saveStatus, undo, redo, historyIndex, history,
    viewMode, setViewMode, theme, toggleTheme, openAIModal, openExportModal, openExamModal,
    openSpeakingModal, openSettingsModal, openPdfCutterModal, triggerAutosave, createEmptyLesson
  } = useLessonStore();

  // Logic thanh thời gian cũ của bạn
  const totalDuration = blocks.reduce((acc, b) => acc + (b.duration || 0), 0);
  const targetDuration = lessonInfo.targetDuration || 45;
  const timeDiff = targetDuration - totalDuration;
  const progressPercent = Math.min(100, Math.round((totalDuration / targetDuration) * 100));

  const getTimeStatus = () => {
    if (totalDuration === targetDuration) {
      return {
        badgeClass: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20',
        text: `⏱ ${totalDuration} / ${targetDuration} Min`,
        subText: 'Optimal',
        progressColor: 'bg-emerald-500',
      };
    }
    if (totalDuration > targetDuration) {
      return {
        badgeClass: 'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:ring-rose-500/20',
        text: `⚠ ${totalDuration} / ${targetDuration} Min`,
        subText: `+${totalDuration - targetDuration} Min zu viel`,
        progressColor: 'bg-rose-500',
      };
    }
    return {
      badgeClass: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20',
      text: `○ ${totalDuration} / ${targetDuration} Min`,
      subText: `Noch ${timeDiff} Min frei`,
      progressColor: 'bg-amber-500',
    };
  };

  const status = getTimeStatus();

  const handleResetLesson = () => {
    if (blocks.length === 0 && !lessonInfo.topic) return;
    if (window.confirm('Bạn có chắc chắn muốn đặt lại giáo án ban đầu? Toàn bộ các khối hoạt động hiện tại sẽ bị xóa trắng.')) {
      createEmptyLesson();
    }
  };

  const iconBtnClass = "p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors";

  return (
    <header className="sticky top-0 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-6 py-3 select-none">
      <div className="flex flex-wrap items-center justify-between gap-4">
        
        <div className="flex items-center gap-4 min-w-0">
          <button
            type="button"
            onClick={handleResetLesson}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-rose-600 px-3 py-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
            title="Làm mới toàn bộ giáo án"
          >
            <RefreshCw size={14} />
          </button>

          <div className="h-5 w-[1px] bg-slate-200 dark:bg-slate-700" />

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={lessonInfo.title}
                onChange={(e) => updateLessonInfo({ title: e.target.value })}
                className="text-[17px] font-black text-slate-900 dark:text-white bg-transparent border-none focus:ring-0 focus:outline-none p-0 w-full max-w-[300px] truncate placeholder:text-slate-300"
                placeholder="Tên bài giảng..."
              />
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:ring-indigo-500/30 whitespace-nowrap">
                {lessonInfo.level}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] mt-1">
              {saveStatus === 'saved' && (
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 size={12} /> Đã lưu tự động
                </span>
              )}
              {saveStatus === 'saving' && (
                <span className="flex items-center gap-1 text-indigo-500 font-medium">
                  <Loader2 size={12} className="animate-spin" /> Đang lưu...
                </span>
              )}
              {saveStatus === 'unsaved' && (
                <span className="flex items-center gap-1 text-amber-500 font-medium">
                  <AlertCircle size={12} /> Chưa lưu
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Thanh tiến trình thời gian giữ nguyên */}
        <div className="hidden lg:flex flex-col items-center">
          <div className={`flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold ring-1 ${status.badgeClass}`}>
            <Clock size={13} />
            <span>{status.text}</span>
            <span className="text-[10px] font-medium opacity-80">({status.subText})</span>
          </div>
          <div className="w-40 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div className={`h-full transition-all duration-500 ${status.progressColor}`} style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {viewMode === 'teacher' && (
            <button onClick={() => setViewMode('student')} className="hidden xl:flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-transform hover:scale-105 mr-1">
              <Check size={14} /> Thoát sửa / Xem đề
            </button>
          )}

          <button onClick={triggerAutosave} disabled={saveStatus === 'saving'} className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all mr-2 ${saveStatus === 'unsaved' ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'}`}>
            {saveStatus === 'saving' ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            <span className="hidden sm:inline">Lưu</span>
          </button>

          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 mr-2">
            <button onClick={undo} disabled={historyIndex <= 0} className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 transition-colors"><RotateCcw size={14} /></button>
            <div className="w-[1px] h-4 bg-slate-300 dark:bg-slate-600 mx-1" />
            <button onClick={redo} disabled={historyIndex >= history.length - 1} className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 transition-colors"><RotateCw size={14} /></button>
          </div>

          <button onClick={openPdfCutterModal} className={iconBtnClass} title="Cắt PDF"><Scissors size={16} /></button>
          <button onClick={openSettingsModal} className={iconBtnClass} title="Cài đặt"><Settings size={16} /></button>
          <button onClick={toggleTheme} className={iconBtnClass} title="Giao diện">
            {theme === 'dark' ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} />}
          </button>

          <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

          <button onClick={openExamModal} className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 transition-colors">
            <FileCheck2 size={16} /> <span className="hidden xl:inline">Tạo đề thi</span>
          </button>
          
          <button onClick={openSpeakingModal} className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20 transition-colors">
            <Mic size={16} /> <span className="hidden xl:inline">Thi Vấn Đáp</span>
          </button>

          <button onClick={openAIModal} className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-sm transition-all">
            <Sparkles size={14} /> <span className="hidden xl:inline">AI-Assistent</span>
          </button>

          <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button onClick={() => setViewMode('teacher')} className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${viewMode === 'teacher' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Lehrer</button>
            <button onClick={() => setViewMode('student')} className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${viewMode === 'student' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}><GraduationCap size={14} /> Schüler</button>
            <button onClick={() => setViewMode('preview')} className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${viewMode === 'preview' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}><Eye size={14} /> Vorschau</button>
          </div>

          <button onClick={openExportModal} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 shadow-sm transition-colors ml-1">
            <Download size={14} /> Export
          </button>
        </div>
      </div>
    </header>
  );
};