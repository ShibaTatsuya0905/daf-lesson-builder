import React from 'react';
import { X, Volume2, Type, Sliders, Check } from 'lucide-react';
import { useLessonStore } from '../../store/useLessonStore';

export const SettingsModal: React.FC = () => {
  const { 
    isSettingsModalOpen, 
    closeSettingsModal, 
    audioSpeed, 
    setAudioSpeed, 
    fontSize, 
    setFontSize 
  } = useLessonStore();

  if (!isSettingsModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-charcoal/40 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={closeSettingsModal}
    >
      <div
        className="bg-paper-white border border-mist-border rounded-[24px] w-full max-w-md shadow-md overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 px-6 border-b border-mist-border flex items-center justify-between bg-chalk-canvas">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-lilac-wash text-iris-bolt flex items-center justify-center">
              <Sliders size={16} />
            </div>
            <div>
              <h3 className="text-base font-bold text-ink-charcoal">Cài đặt hệ thống</h3>
              <p className="text-xs text-slate-veil">Tùy chỉnh tốc độ giọng đọc và cỡ chữ hiển thị</p>
            </div>
          </div>
          <button
            onClick={closeSettingsModal}
            className="p-1.5 rounded-full text-slate-veil hover:text-ink-charcoal hover:bg-mist-border transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-2.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-veil flex items-center gap-1.5">
              <Volume2 size={14} className="text-iris-bolt" /> Tốc độ giọng đọc AI (Hörtext)
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
                    className={`p-2.5 rounded text-xs font-semibold border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-iris-bolt bg-lilac-wash text-iris-bolt'
                        : 'border-mist-border bg-chalk-canvas text-ink-charcoal hover:bg-mist-border/50'
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-veil flex items-center gap-1.5">
              <Type size={14} className="text-iris-bolt" /> Cỡ chữ hiển thị bài giảng
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
                    className={`p-2.5 rounded text-xs font-semibold border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-iris-bolt bg-lilac-wash text-iris-bolt'
                        : 'border-mist-border bg-chalk-canvas text-ink-charcoal hover:bg-mist-border/50'
                    }`}
                  >
                    {sz.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-4 px-6 border-t border-mist-border bg-chalk-canvas flex justify-end">
          <button
            type="button"
            onClick={closeSettingsModal}
            className="flex items-center gap-1.5 text-xs font-semibold px-6 py-2.5 rounded-full bg-iris-bolt hover:opacity-90 text-paper-white shadow-xs transition-opacity cursor-pointer"
          >
            <Check size={14} /> Hoàn tất
          </button>
        </div>
      </div>
    </div>
  );
};