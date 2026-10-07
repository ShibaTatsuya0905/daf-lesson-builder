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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
      onClick={closeTemplateModal}
    >
      <div
        className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden select-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-base font-extrabold text-slate-800">
              Unterrichtsvorlagen (Mẫu giáo án chuẩn)
            </h3>
            <p className="text-xs text-slate-500">
              Chọn cấu trúc khung bài có sẵn để tạo bài học chỉ trong 1-click
            </p>
          </div>
          <button
            type="button"
            onClick={closeTemplateModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 px-6 border-b border-slate-100 bg-white">
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Chủ đề bài giảng (Thema):
          </label>
          <input
            type="text"
            value={topic}
            placeholder="z.B. Freizeit & Hobbys, Essen & Trinken, Urlaub..."
            onChange={(e) => setTopic(e.target.value)}
            className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-blue-500 font-bold text-slate-800"
          />
        </div>

        <div className="p-6 overflow-y-auto space-y-3 bg-slate-50/40">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="p-4 rounded-xl border border-slate-200 bg-white hover:border-purple-500 hover:shadow-md transition-all flex items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <span className="text-2xl p-2 rounded-xl bg-purple-50 border border-purple-100 shrink-0">
                  {tpl.icon}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-800">{tpl.name}</h4>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      {tpl.level}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{tpl.description}</p>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1.5">
                    <Clock size={12} />
                    <span>{tpl.duration} Minuten ({tpl.blocks.length} Aktivitäten)</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleSelect(tpl.id)}
                className="shrink-0 text-xs font-semibold px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white shadow-sm transition-colors"
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