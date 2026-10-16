import React, { useState } from 'react';
import { Block, ArticleType, VocabularyWord } from '../../types/lesson';
import { useLessonStore } from '../../store/useLessonStore';
import {
  Plus,
  Trash2,
  Sparkles,
  Layers,
  HelpCircle,
  MessageSquare,
  Loader2,
} from 'lucide-react';

export const WortschatzActivity: React.FC<{ block: Block }> = ({ block }) => {
  const {
    updateBlockData,
    generateFlashcardsFromVocab,
    generateQuizFromVocab,
    generateSpeakingFromVocab,
    enrichVocabWithAI,
  } = useLessonStore();

  const [isAiLoading, setIsAiLoading] = useState(false);
  const vocabList = block.data?.vocabulary || [];

  const handleAddWord = () => {
    const newWord: VocabularyWord = {
      id: `w-${Date.now()}`,
      article: '-',
      german: '',
      translation: '',
      plural: '',
      example: '',
    };
    updateBlockData(block.id, { vocabulary: [...vocabList, newWord] });
  };

  const handleUpdateWord = (id: string, patch: Partial<VocabularyWord>) => {
    const updated = vocabList.map((w) => (w.id === id ? { ...w, ...patch } : w));
    updateBlockData(block.id, { vocabulary: updated });
  };

  const handleDeleteWord = (id: string) => {
    updateBlockData(block.id, { vocabulary: vocabList.filter((w) => w.id !== id) });
  };

  const handleAIExtend = async () => {
    setIsAiLoading(true);
    try {
      await enrichVocabWithAI(block.id);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-chalk-canvas border border-mist-border rounded-lg">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddWord}
            className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full bg-iris-bolt hover:opacity-90 text-paper-white shadow-xs transition-opacity cursor-pointer"
          >
            <Plus size={14} /> + Wort
          </button>

          <button
            type="button"
            onClick={handleAIExtend}
            disabled={isAiLoading}
            className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full bg-paper-white border border-mist-border hover:border-iris-bolt text-iris-bolt shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isAiLoading ? <Loader2 size={13} className="animate-spin text-iris-bolt" /> : <Sparkles size={13} className="text-iris-bolt" />}
            <span>Wörter ergänzen (AI)</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => generateFlashcardsFromVocab(block.id)}
            disabled={vocabList.length === 0}
            className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full bg-paper-white border border-mist-border hover:border-iris-bolt text-slate-veil hover:text-iris-bolt shadow-xs transition-colors disabled:opacity-40 cursor-pointer"
            title="Tạo Block thẻ từ vựng từ bảng này"
          >
            <Layers size={13} className="text-iris-bolt" />
            <span>Karteikarten erstellen</span>
          </button>

          <button
            type="button"
            onClick={() => generateQuizFromVocab(block.id)}
            disabled={vocabList.length === 0}
            className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full bg-paper-white border border-mist-border hover:border-iris-bolt text-slate-veil hover:text-iris-bolt shadow-xs transition-colors disabled:opacity-40 cursor-pointer"
            title="Tạo Quiz trắc nghiệm mạo từ và ý nghĩa"
          >
            <HelpCircle size={13} className="text-iris-bolt" />
            <span>Quiz erstellen</span>
          </button>

          <button
            type="button"
            onClick={() => generateSpeakingFromVocab(block.id)}
            disabled={vocabList.length === 0}
            className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full bg-paper-white border border-mist-border hover:border-iris-bolt text-slate-veil hover:text-iris-bolt shadow-xs transition-colors disabled:opacity-40 cursor-pointer"
            title="Tạo bài tập Nói cặp sử dụng các từ vựng này"
          >
            <MessageSquare size={13} className="text-iris-bolt" />
            <span>Sprechübung erstellen</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto border border-mist-border rounded-lg bg-paper-white shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-chalk-canvas text-slate-veil font-semibold border-b border-mist-border">
              <th className="py-2.5 px-3 w-20">Artikel</th>
              <th className="py-2.5 px-3 min-w-[150px]">Deutsch (Từ / Cụm từ)</th>
              <th className="py-2.5 px-3 min-w-[130px]">Bedeutung (Tiếng Việt)</th>
              <th className="py-2.5 px-3 w-24">Plural</th>
              <th className="py-2.5 px-3 min-w-[200px]">Beispielsatz (Ví dụ)</th>
              <th className="py-2.5 px-2 w-10 text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-mist-border">
            {vocabList.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-fog-mist">
                  Chưa có từ vựng. Bấm "+ Wort" hoặc "Wörter ergänzen (AI)" để nạp từ mới.
                </td>
              </tr>
            ) : (
              vocabList.map((item) => (
                <tr key={item.id} className="hover:bg-chalk-canvas transition-colors">
                  <td className="p-2">
                    <select
                      value={item.article}
                      onChange={(e) => handleUpdateWord(item.id, { article: e.target.value as ArticleType })}
                      className={`w-full py-1 px-1.5 rounded font-bold text-xs border focus:outline-none cursor-pointer ${
                        item.article === 'der'
                          ? 'bg-[#eff6ff] text-[#2563eb] border-[#bfdbfe]'
                          : item.article === 'die'
                          ? 'bg-[#fef2f2] text-[#dc2626] border-[#fecaca]'
                          : item.article === 'das'
                          ? 'bg-[#f0fdf4] text-[#16a34a] border-[#bbf7d0]'
                          : 'bg-paper-white text-slate-veil border-mist-border'
                      }`}
                    >
                      <option value="-">-</option>
                      <option value="der">der</option>
                      <option value="die">die</option>
                      <option value="das">das</option>
                    </select>
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={item.german}
                      placeholder="z.B. das Hobby"
                      onChange={(e) => handleUpdateWord(item.id, { german: e.target.value })}
                      className="w-full p-1.5 rounded bg-chalk-canvas border border-mist-border focus:border-iris-bolt focus:bg-paper-white focus:outline-none font-semibold text-ink-charcoal"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={item.translation}
                      placeholder="z.B. sở thích"
                      onChange={(e) => handleUpdateWord(item.id, { translation: e.target.value })}
                      className="w-full p-1.5 rounded bg-chalk-canvas border border-mist-border focus:border-iris-bolt focus:bg-paper-white focus:outline-none text-ink-charcoal"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={item.plural}
                      placeholder="z.B. Hobbys"
                      onChange={(e) => handleUpdateWord(item.id, { plural: e.target.value })}
                      className="w-full p-1.5 rounded bg-chalk-canvas border border-mist-border focus:border-iris-bolt focus:bg-paper-white focus:outline-none text-slate-veil"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={item.example}
                      placeholder="z.B. Mein Hobby ist Schwimmen."
                      onChange={(e) => handleUpdateWord(item.id, { example: e.target.value })}
                      className="w-full p-1.5 rounded bg-chalk-canvas border border-mist-border focus:border-iris-bolt focus:bg-paper-white focus:outline-none text-slate-veil italic"
                    />
                  </td>
                  <td className="p-2 text-center">
                    <button
                      type="button"
                      onClick={() => handleDeleteWord(item.id)}
                      className="p-1 text-slate-veil hover:text-[#dc2626] rounded transition-colors cursor-pointer"
                      title="Xóa từ này"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};