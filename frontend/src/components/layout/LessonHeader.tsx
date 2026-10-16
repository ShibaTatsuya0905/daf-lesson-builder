import React from 'react';
import {
  Clock, CheckCircle2, AlertCircle, Loader2, RotateCcw, RotateCw, 
  Sparkles, Eye, GraduationCap, Download, FileCheck2, Mic, 
  Settings, Save, Scissors, Check, RefreshCw
} from 'lucide-react';
import { useLessonStore } from '../../store/useLessonStore';

export const LessonHeader: React.FC = () => {
  const {
    lessonInfo, updateLessonInfo, blocks, saveStatus, undo, redo, historyIndex, history,
    viewMode, setViewMode, openAIModal, openExportModal, openExamModal,
    openSpeakingModal, openSettingsModal, openPdfCutterModal, triggerAutosave, createEmptyLesson
  } = useLessonStore();

  const totalDuration = blocks.reduce((acc, b) => acc + (b.duration || 0), 0);
  const targetDuration = lessonInfo.targetDuration || 45;
  const timeDiff = targetDuration - totalDuration;
  const progressPercent = Math.min(100, Math.round((totalDuration / targetDuration) * 100));

  const getTimeStatus = () => {
    if (totalDuration === targetDuration) {
      return {
        badgeClass: 'bg-paper-white text-ink-charcoal border border-mist-border',
        text: `⏱ ${totalDuration} / ${targetDuration} Min`,
        subText: 'Optimal',
        progressColor: 'bg-iris-bolt',
      };
    }
    if (totalDuration > targetDuration) {
      return {
        badgeClass: 'bg-paper-white text-ink-charcoal border border-mist-border',
        text: `⚠ ${totalDuration} / ${targetDuration} Min`,
        subText: `+${totalDuration - targetDuration} Min`,
        progressColor: 'bg-slate-veil',
      };
    }
    return {
      badgeClass: 'bg-paper-white text-ink-charcoal border border-mist-border',
      text: `○ ${totalDuration} / ${targetDuration} Min`,
      subText: `Noch ${timeDiff} Min`,
      progressColor: 'bg-iris-bolt',
    };
  };

  const status = getTimeStatus();

  const handleResetLesson = () => {
    if (blocks.length === 0 && !lessonInfo.topic) return;
    if (window.confirm('Bạn có chắc chắn muốn đặt lại giáo án ban đầu? Toàn bộ các khối hoạt động hiện tại sẽ bị xóa trắng.')) {
      createEmptyLesson();
    }
  };

  const iconBtnClass = "p-2 rounded text-slate-veil hover:text-ink-charcoal hover:bg-chalk-canvas transition-colors cursor-pointer";

  return (
    <header className="sticky top-0 z-20 bg-paper-white border-b border-mist-border px-6 py-3 select-none shadow-sm flex items-center justify-between min-h-[64px]">
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div className="flex items-center bg-chalk-canvas rounded px-4 py-2 border border-transparent focus-within:border-mist-border transition-colors max-w-md w-full">
          <input
            type="text"
            value={lessonInfo.title}
            onChange={(e) => updateLessonInfo({ title: e.target.value })}
            className="text-[14px] font-semibold text-ink-charcoal bg-transparent border-none focus:ring-0 focus:outline-none p-0 w-full truncate placeholder:text-fog-mist"
            placeholder="Tên bài giảng..."
          />
        </div>
        <span className="px-3 py-1 rounded text-[12px] font-semibold bg-chalk-canvas text-slate-veil whitespace-nowrap hidden sm:block">
          {lessonInfo.level}
        </span>
        
        <div className="hidden lg:flex items-center gap-1.5 text-[12px]">
          {saveStatus === 'saved' && <span className="flex items-center gap-1 text-slate-veil"><CheckCircle2 size={14} /> Saved</span>}
          {saveStatus === 'saving' && <span className="flex items-center gap-1 text-slate-veil"><Loader2 size={14} className="animate-spin" /> Saving...</span>}
          {saveStatus === 'unsaved' && <span className="flex items-center gap-1 text-slate-veil"><AlertCircle size={14} /> Unsaved</span>}
        </div>
      </div>

      <div className="hidden xl:flex flex-col items-center mx-4 flex-1 max-w-[200px]">
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded text-[12px] font-semibold ${status.badgeClass}`}>
          <Clock size={14} />
          <span>{status.text}</span>
        </div>
        <div className="w-full h-1 bg-chalk-canvas rounded-full mt-1.5 overflow-hidden">
          <div className={`h-full transition-all duration-500 ${status.progressColor}`} style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center">
          <button onClick={undo} disabled={historyIndex <= 0} className="p-2 text-slate-veil hover:text-ink-charcoal disabled:opacity-30 transition-colors cursor-pointer"><RotateCcw size={16} /></button>
          <button onClick={redo} disabled={historyIndex >= history.length - 1} className="p-2 text-slate-veil hover:text-ink-charcoal disabled:opacity-30 transition-colors cursor-pointer"><RotateCw size={16} /></button>
        </div>

        <div className="w-[1px] h-6 bg-mist-border mx-1" />

        <button onClick={openPdfCutterModal} className={iconBtnClass} title="Cắt PDF"><Scissors size={16} /></button>
        <button onClick={openSettingsModal} className={iconBtnClass} title="Cài đặt"><Settings size={16} /></button>
        <button onClick={handleResetLesson} className={iconBtnClass} title="Làm mới"><RefreshCw size={16} /></button>

        <div className="w-[1px] h-6 bg-mist-border mx-1" />

        <div className="hidden lg:flex items-center gap-2">
          <button onClick={openExamModal} className="flex items-center gap-1.5 px-4 py-2 text-[14px] font-semibold rounded bg-transparent border border-mist-border text-iris-bolt hover:bg-chalk-canvas transition-colors cursor-pointer">
            <FileCheck2 size={16} /> Tạo đề thi
          </button>
          <button onClick={openSpeakingModal} className="flex items-center gap-1.5 px-4 py-2 text-[14px] font-semibold rounded bg-transparent border border-mist-border text-iris-bolt hover:bg-chalk-canvas transition-colors cursor-pointer">
            <Mic size={16} /> Thi Vấn Đáp
          </button>
          <button onClick={openAIModal} className="flex items-center gap-1.5 px-4 py-2 text-[14px] font-semibold rounded bg-transparent border border-mist-border text-iris-bolt hover:bg-chalk-canvas transition-colors cursor-pointer">
            <Sparkles size={16} /> AI-Assistent
          </button>
        </div>

        <div className="w-[1px] h-6 bg-mist-border mx-1" />

        <div className="flex items-center bg-chalk-canvas p-1 rounded-cards">
          <button onClick={() => setViewMode('teacher')} className={`px-3 py-1.5 text-[14px] font-semibold rounded transition-all cursor-pointer ${viewMode === 'teacher' ? 'bg-paper-white text-ink-charcoal shadow-sm' : 'text-slate-veil hover:text-ink-charcoal'}`}>Lehrer</button>
          <button onClick={() => setViewMode('student')} className={`flex items-center gap-1 px-3 py-1.5 text-[14px] font-semibold rounded transition-all cursor-pointer ${viewMode === 'student' ? 'bg-paper-white text-ink-charcoal shadow-sm' : 'text-slate-veil hover:text-ink-charcoal'}`}><GraduationCap size={16} /> Schüler</button>
          <button onClick={() => setViewMode('preview')} className={`flex items-center gap-1 px-3 py-1.5 text-[14px] font-semibold rounded transition-all cursor-pointer ${viewMode === 'preview' ? 'bg-paper-white text-ink-charcoal shadow-sm' : 'text-slate-veil hover:text-ink-charcoal'}`}><Eye size={16} /> Vorschau</button>
        </div>

        <button onClick={openExportModal} className="p-2 text-slate-veil hover:text-ink-charcoal ml-1 cursor-pointer" title="Export">
          <Download size={20} />
        </button>

        <button onClick={triggerAutosave} disabled={saveStatus === 'saving'} className="flex items-center gap-2 px-6 py-2.5 text-[14px] font-semibold rounded-pills bg-iris-bolt hover:opacity-90 text-paper-white shadow-sm transition-opacity ml-2 cursor-pointer">
          {saveStatus === 'saving' ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Lưu
        </button>
      </div>
    </header>
  );
};