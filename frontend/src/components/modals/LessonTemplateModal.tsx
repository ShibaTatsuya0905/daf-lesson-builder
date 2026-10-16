import React, { useState } from 'react';
import { X, Clock } from 'lucide-react';
import { useLessonStore } from '../../store/useLessonStore';

export const LessonTemplateModal: React.FC = () => {
  const { isTemplateModalOpen, closeTemplateModal, templates, applyTemplate, lessonInfo } = useLessonStore();
  const [topic, setTopic] = useState(lessonInfo.topic || 'Freizeit & Hobbys');

  if (!isTemplateModalOpen) return null;

  const handleSelect = (templateId: string) => {
    applyTemplate(templateId, topic);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-charcoal/40 backdrop-blur-xs p-4"
      onClick={closeTemplateModal}
    >
      <div
        className="bg-paper-white border border-mist-border rounded-[24px] w-full max-w-2xl max-h-[85vh] flex flex-col shadow-md overflow-hidden select-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 px-6 border-b border-mist-border flex items-center justify-between bg-chalk-canvas">
          <div>
            <h3 className="text-base font-bold text-ink-charcoal">
              Unterrichtsvorlagen (Mẫu giáo án chuẩn)
            </h3>
            <p className="text-xs text-slate-veil">
              Chọn cấu trúc khung bài có sẵn để tạo bài học chỉ trong 1-click
            </p>
          </div>
          <button
            type="button"
            onClick={closeTemplateModal}
            className="p-1.5 rounded-full text-slate-veil hover:text-ink-charcoal hover:bg-mist-border transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 px-6 border-b border-mist-border bg-paper-white">
          <label className="block text-xs font-semibold text-slate-veil mb-1">
            Chủ đề bài giảng (Thema):
          </label>
          <input
            type="text"
            value={topic}
            placeholder="z.B. Freizeit & Hobbys, Essen & Trinken, Urlaub..."
            onChange={(e) => setTopic(e.target.value)}
            className="w-full text-xs p-2.5 rounded bg-chalk-canvas border border-mist-border focus:outline-none focus:border-iris-bolt font-semibold text-ink-charcoal"
          />
        </div>

        <div className="p-6 overflow-y-auto space-y-3 bg-chalk-canvas flex-1">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="p-4 rounded-lg border border-mist-border bg-paper-white hover:border-iris-bolt hover:shadow-xs transition-all flex items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <span className="text-2xl p-2 rounded-lg bg-lilac-wash border border-mist-border shrink-0">
                  {tpl.icon}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-ink-charcoal">{tpl.name}</h4>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-lilac-wash text-iris-bolt border border-mist-border">
                      {tpl.level}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-veil mt-1 leading-relaxed">{tpl.description}</p>
                  <div className="flex items-center gap-1.5 text-[11px] text-fog-mist mt-1.5">
                    <Clock size={12} />
                    <span>{tpl.duration} Minuten ({tpl.blocks.length} Aktivitäten)</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleSelect(tpl.id)}
                className="shrink-0 text-xs font-semibold px-5 py-2 rounded-full bg-iris-bolt hover:opacity-90 text-paper-white shadow-xs transition-opacity cursor-pointer"
              >
                Auswählen
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};