import React, { useState } from 'react';
import { X, Sparkles, Loader2, Check } from 'lucide-react';
import { useLessonStore } from '../../store/useLessonStore';
import { aiService } from '../../services/aiService';
import { CEFRLevel, Block } from '../../types/lesson';

export const AIAssistantModal: React.FC = () => {
  const { isAIModalOpen, closeAIModal, lessonInfo, updateLessonInfo } = useLessonStore();

  const [topic, setTopic] = useState(lessonInfo.topic || 'Freizeit & Hobbys');
  const [level, setLevel] = useState<CEFRLevel>(lessonInfo.level as CEFRLevel || 'A1');
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-charcoal/40 backdrop-blur-xs p-4"
      onClick={closeAIModal}
    >
      <div
        className="bg-paper-white border border-mist-border rounded-[24px] w-full max-w-lg shadow-md overflow-hidden select-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 px-6 border-b border-mist-border flex items-center justify-between bg-chalk-canvas">
          <div className="flex items-center gap-2">
            <Sparkles className="text-iris-bolt" size={18} />
            <h3 className="text-base font-bold text-ink-charcoal">
              DaF AI-Assistent
            </h3>
          </div>
          <button
            type="button"
            onClick={closeAIModal}
            className="p-1.5 rounded-full text-slate-veil hover:text-ink-charcoal hover:bg-mist-border transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-veil mb-1">
              Chủ đề bài giảng (Thema)
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full text-xs p-2.5 rounded bg-chalk-canvas border border-mist-border focus:outline-none focus:border-iris-bolt font-semibold text-ink-charcoal"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-veil mb-1">
                Niveau (Trình độ)
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as CEFRLevel)}
                className="w-full text-xs p-2.5 rounded bg-chalk-canvas border border-mist-border focus:outline-none focus:border-iris-bolt font-semibold text-ink-charcoal cursor-pointer"
              >
                {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((lvl) => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-veil mb-1">
                Dauer (Thời lượng phút)
              </label>
              <input
                type="number"
                value={duration === 0 ? '' : duration}
                onChange={(e) => setDuration(e.target.value === '' ? 0 : Number(e.target.value))}
                placeholder="0"
                className="w-full text-xs p-2.5 rounded bg-chalk-canvas border border-mist-border focus:outline-none focus:border-iris-bolt font-semibold text-ink-charcoal"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-veil mb-2">
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
                    className={`flex items-center justify-between p-2 rounded text-xs font-semibold border transition-all cursor-pointer ${
                      isChecked
                        ? 'border-iris-bolt bg-lilac-wash text-iris-bolt shadow-xs'
                        : 'border-mist-border bg-paper-white text-slate-veil hover:text-ink-charcoal hover:bg-chalk-canvas'
                    }`}
                  >
                    <span>{area}</span>
                    {isChecked && <Check size={14} className="text-iris-bolt" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-4 px-6 border-t border-mist-border flex justify-end gap-2 bg-chalk-canvas">
          <button
            type="button"
            onClick={closeAIModal}
            className="text-xs font-semibold px-4 py-2 text-slate-veil hover:text-ink-charcoal cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isLoading}
            className="flex items-center gap-2 text-xs font-semibold px-6 py-2.5 rounded-full bg-iris-bolt hover:opacity-90 text-paper-white shadow-xs disabled:opacity-50 transition-opacity cursor-pointer"
          >
            {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            <span>Unterricht erstellen</span>
          </button>
        </div>
      </div>
    </div>
  );
};