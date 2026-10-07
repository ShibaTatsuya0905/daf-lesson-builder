import React from 'react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RotateCcw,
  RotateCw,
  Sparkles,
  Eye,
  GraduationCap,
  Download,
  RefreshCw,
  FileCheck2,
  Mic,
  Moon,
  Sun,
  Settings,
  Save,
  Scissors
} from 'lucide-react';
import { useLessonStore } from '../../store/useLessonStore';

export const LessonHeader: React.FC = () => {
  const {
    lessonInfo,
    updateLessonInfo,
    blocks,
    saveStatus,
    undo,
    redo,
    historyIndex,
    history,
    viewMode,
    setViewMode,
    theme,
    toggleTheme,
    openAIModal,
    openExportModal,
    openExamModal,
    openSpeakingModal,
    openSettingsModal,
    openPdfCutterModal,
    triggerAutosave,
    createEmptyLesson,
  } = useLessonStore();

  const totalDuration = blocks.reduce((acc, b) => acc + (b.duration || 0), 0);
  const targetDuration = lessonInfo.targetDuration || 45;
  const timeDiff = targetDuration - totalDuration;
  const progressPercent = Math.min(100, Math.round((totalDuration / targetDuration) * 100));

  const getTimeStatus = () => {
    if (totalDuration === targetDuration) {
      return {
        badgeClass: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
        text: `⏱ ${totalDuration} / ${targetDuration} Min`,
        subText: 'Optimal',
        progressColor: 'bg-emerald-500',
      };
    }
    if (totalDuration > targetDuration) {
      return {
        badgeClass: 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
        text: `⚠ ${totalDuration} / ${targetDuration} Min`,
        subText: `+${totalDuration - targetDuration} Min zu viel`,
        progressColor: 'bg-red-500',
      };
    }
    return {
      badgeClass: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
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

  return (
    <header className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 px-6 py-2.5 select-none transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleResetLesson}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-red-600 px-2.5 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 border border-slate-200 dark:border-slate-800 hover:border-red-200 transition-all shadow-xs"
            title="Đặt lại toàn bộ giáo án về ban đầu"
          >
            <RefreshCw size={13} className="text-slate-400 group-hover:text-red-500" />
            <span>Làm mới</span>
          </button>

          <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800" />

          <div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={lessonInfo.title}
                onChange={(e) => updateLessonInfo({ title: e.target.value })}
                className="text-base font-extrabold text-slate-800 dark:text-slate-100 bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-blue-500 focus:outline-none px-1"
              />
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                {lessonInfo.level}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] px-1 mt-0.5">
              {saveStatus === 'saved' && (
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 size={12} /> Đã lưu tự động
                </span>
              )}
              {saveStatus === 'saving' && (
                <span className="flex items-center gap-1 text-blue-500 font-medium">
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

        <div className="flex flex-col items-center">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${status.badgeClass}`}>
            <Clock size={13} />
            <span>{status.text}</span>
            <span className="text-[10px] opacity-75">({status.subText})</span>
          </div>
          <div className="w-36 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-1.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${status.progressColor}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={triggerAutosave}
            disabled={saveStatus === 'saving'}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-all ${
              saveStatus === 'unsaved'
                ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-sm animate-pulse'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
            title="Lưu toàn bộ bài giảng ngay lập tức (Ctrl + S)"
          >
            {saveStatus === 'saving' ? (
              <>
                <Loader2 size={14} className="animate-spin text-blue-500" />
                <span>Đang lưu...</span>
              </>
            ) : saveStatus === 'saved' ? (
              <>
                <CheckCircle2 size={14} className="text-emerald-500" />
                <span>Đã lưu</span>
              </>
            ) : (
              <>
                <Save size={14} />
                <span>Lưu giáo án</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={openPdfCutterModal}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-purple-600 border border-slate-200 dark:border-slate-800 transition-colors"
            title="Công cụ cắt trang file PDF"
          >
            <Scissors size={15} />
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors"
            title={theme === 'dark' ? 'Chuyển sang Giao diện Sáng' : 'Chuyển sang Giao diện Tối'}
          >
            {theme === 'dark' ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} />}
          </button>

          <button
            type="button"
            onClick={openSettingsModal}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors"
            title="Cài đặt hệ thống"
          >
            <Settings size={15} />
          </button>

          <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-800/60">
            <button
              type="button"
              onClick={undo}
              disabled={historyIndex <= 0}
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 transition-colors"
              title="Rückgängig (Ctrl + Z)"
            >
              <RotateCcw size={14} />
            </button>
            <button
              type="button"
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 border-l border-slate-200 dark:border-slate-800 transition-colors"
              title="Wiederholen (Ctrl + Shift + Z)"
            >
              <RotateCw size={14} />
            </button>
          </div>

          <button
            type="button"
            onClick={openExamModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800 shadow-xs transition-all"
            title="Biên soạn đề thi chuẩn A4"
          >
            <FileCheck2 size={15} className="text-blue-600 dark:text-blue-400" />
            <span>Tạo đề thi</span>
          </button>

          <button
            type="button"
            onClick={openSpeakingModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 shadow-xs transition-all"
            title="Thi Vấn đáp bằng Giọng nói với AI"
          >
            <Mic size={15} className="text-emerald-600 dark:text-emerald-400" />
            <span>Thi Vấn Đáp</span>
          </button>

          <button
            type="button"
            onClick={openAIModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-sm transition-all"
          >
            <Sparkles size={14} />
            <span>AI-Assistent</span>
          </button>

          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setViewMode('teacher')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                viewMode === 'teacher' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-bold' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              Lehrer
            </button>
            <button
              type="button"
              onClick={() => setViewMode('student')}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                viewMode === 'student' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
              title="Schüleransicht (Chế độ xem của học sinh - Ẩn đáp án)"
            >
              <GraduationCap size={13} />
              <span>Schüler</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('preview')}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                viewMode === 'preview' ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <Eye size={13} />
              <span>Vorschau</span>
            </button>
          </div>

          <button
            type="button"
            onClick={openExportModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors"
          >
            <Download size={14} />
            <span>Exportieren</span>
          </button>
        </div>
      </div>
    </header>
  );
};