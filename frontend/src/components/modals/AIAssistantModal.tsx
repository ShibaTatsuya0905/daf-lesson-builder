import React, { useState } from 'react';
import { X, Sparkles, Loader2, Check } from 'lucide-react';
import { useLessonStore } from '../../store/useLessonStore';
import { aiService } from '../../services/aiService';
import { CEFRLevel, Block } from '../../types/lesson';

export const AIAssistantModal: React.FC = () => {
  const { isAIModalOpen, closeAIModal, lessonInfo, updateLessonInfo } = useLessonStore();

  const [topic, setTopic] = useState(lessonInfo.topic || 'Freizeit & Hobbys');
  const [level, setLevel] = useState<CEFRLevel>(lessonInfo.level || 'A1');
  const [duration, setDuration] = useState(45);
  const [focusAreas, setFocusAreas] = useState<string[]>(['Sprechen', 'Wortschatz', 'Schreiben']);
  const [isLoading, setIsLoading] = useState(false);

  if (!isAIModalOpen) return null;

  const toggleFocus = (area: string) => {
    setFocusAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const generatedBlocks = await aiService.generateLesson({
        topic,
        level,
        duration,
        focusAreas,
      });

      const fullBlocks: Block[] = generatedBlocks.map((b, idx) => ({
        ...b,
        id: `block-${Date.now()}-${idx}`,
      }));

      updateLessonInfo({
        topic,
        level,
        targetDuration: duration,
        objectives: `Die Schüler können Kernstrukturen und Fertigkeiten zum Thema "${topic}" anwenden.`,
      });

      useLessonStore.setState({ blocks: fullBlocks });
      closeAIModal();
    } catch (error) {
      alert('Lỗi tạo giáo án AI! Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
      onClick={closeAIModal}
    >
      <div
        className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden select-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-purple-500/10 to-indigo-500/10">
          <div className="flex items-center gap-2">
            <Sparkles className="text-purple-600" size={18} />
            <h3 className="text-base font-extrabold text-slate-800">
              DaF AI-Assistent
            </h3>
          </div>
          <button
            type="button"
            onClick={closeAIModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Chủ đề bài giảng (Thema)
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-purple-500 font-bold text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Niveau (Trình độ)
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as CEFRLevel)}
                className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-purple-500 font-bold text-slate-800"
              >
                {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((lvl) => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Dauer (Thời lượng phút)
              </label>
              <input
                type="number"
                value={duration === 0 ? '' : duration}
                onChange={(e) => setDuration(e.target.value === '' ? 0 : Number(e.target.value))}
                placeholder="0"
                className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-purple-500 font-bold text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">
              Trọng tâm rèn luyện (Fokus)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['Sprechen', 'Schreiben', 'Lesen', 'Hören', 'Grammatik', 'Wortschatz'].map((area) => {
                const isChecked = focusAreas.includes(area);
                return (
                  <button
                    key={area}
                    type="button"
                    onClick={() => toggleFocus(area)}
                    className={`flex items-center justify-between p-2 rounded-xl text-xs font-semibold border transition-all ${
                      isChecked
                        ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{area}</span>
                    {isChecked && <Check size={14} className="text-purple-600" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-4 px-6 border-t border-slate-100 flex justify-end gap-2 bg-slate-50/60">
          <button
            type="button"
            onClick={closeAIModal}
            className="text-xs font-semibold px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isLoading}
            className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-sm disabled:opacity-50 transition-all"
          >
            {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            <span>Unterricht erstellen</span>
          </button>
        </div>
      </div>
    </div>
  );
};