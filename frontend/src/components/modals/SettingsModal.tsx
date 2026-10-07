import React from 'react';
import { X, Moon, Sun, Settings, Volume2, Type, Sliders, Check } from 'lucide-react';
import { useLessonStore } from '../../store/useLessonStore';

export const SettingsModal: React.FC = () => {
  const { 
    isSettingsModalOpen, 
    closeSettingsModal, 
    theme, 
    toggleTheme, 
    audioSpeed, 
    setAudioSpeed, 
    fontSize, 
    setFontSize 
  } = useLessonStore();

  if (!isSettingsModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={closeSettingsModal}
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 px-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Settings size={18} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Cài đặt hệ thống</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Tùy chỉnh giao diện và cấu hình trải nghiệm</p>
            </div>
          </div>
          <button
            onClick={closeSettingsModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-2.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Sliders size={14} /> Giao diện ứng dụng
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => { if (theme !== 'light') toggleTheme(); }}
                className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                  theme === 'light'
                    ? 'border-blue-500 bg-blue-50/60 text-blue-700 shadow-xs font-bold'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Sun size={22} className={theme === 'light' ? 'text-blue-600' : 'text-slate-400'} />
                <span className="text-xs">Chế độ Sáng</span>
              </button>

              <button
                type="button"
                onClick={() => { if (theme !== 'dark') toggleTheme(); }}
                className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                  theme === 'dark'
                    ? 'border-blue-500 bg-blue-950/40 text-blue-400 shadow-xs font-bold'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Moon size={22} className={theme === 'dark' ? 'text-blue-400' : 'text-slate-400'} />
                <span className="text-xs">Chế độ Tối (Dark)</span>
              </button>
            </div>
          </div>

          <div className="space-y-2.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Volume2 size={14} /> Tốc độ giọng đọc AI (Audio Track)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: '0.8x (Chậm)', val: 0.8 },
                { label: '0.9x (Thi thật)', val: 0.9 },
                { label: '1.0x (Chuẩn)', val: 1.0 },
              ].map((s) => {
                const isSelected = audioSpeed === s.val;
                return (
                  <button
                    key={s.val}
                    type="button"
                    onClick={() => setAudioSpeed(s.val)}
                    className={`p-2.5 rounded-xl text-xs font-bold border transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Type size={14} /> Cỡ chữ hiển thị bài giảng
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'normal', label: 'Tiêu chuẩn' },
                { id: 'medium', label: 'Trung bình' },
                { id: 'large', label: 'Lớn' },
              ].map((sz) => {
                const isSelected = fontSize === sz.id;
                return (
                  <button
                    key={sz.id}
                    type="button"
                    onClick={() => setFontSize(sz.id as 'normal' | 'medium' | 'large')}
                    className={`p-2.5 rounded-xl text-xs font-bold border transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    {sz.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-4 px-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex justify-end">
          <button
            type="button"
            onClick={closeSettingsModal}
            className="flex items-center gap-1.5 text-xs font-bold px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all"
          >
            <Check size={15} /> Hoàn tất
          </button>
        </div>
      </div>
    </div>
  );
};