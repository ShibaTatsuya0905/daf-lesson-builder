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
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-purple-50/70 border border-purple-200 rounded-xl">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddWord}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white shadow-sm transition-colors"
          >
            <Plus size={14} /> + Wort
          </button>

          <button
            type="button"
            onClick={handleAIExtend}
            disabled={isAiLoading}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-purple-200 hover:bg-purple-100/60 text-purple-700 shadow-sm transition-colors disabled:opacity-50"
          >
            {isAiLoading ? <Loader2 size={13} className="animate-spin text-purple-600" /> : <Sparkles size={13} className="text-purple-600" />}
            <span>Wörter ergänzen (AI)</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => generateFlashcardsFromVocab(block.id)}
            disabled={vocabList.length === 0}
            className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-purple-300 text-slate-700 shadow-sm transition-colors disabled:opacity-40"
            title="Tự động tạo Block Karteikarten từ bảng từ vựng này"
          >
            <Layers size={13} className="text-indigo-500" />
            <span>Karteikarten erstellen</span>
          </button>

          <button
            type="button"
            onClick={() => generateQuizFromVocab(block.id)}
            disabled={vocabList.length === 0}
            className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-purple-300 text-slate-700 shadow-sm transition-colors disabled:opacity-40"
            title="Tự động tạo Quiz trắc nghiệm mạo từ và ý nghĩa"
          >
            <HelpCircle size={13} className="text-amber-500" />
            <span>Quiz erstellen</span>
          </button>

          <button
            type="button"
            onClick={() => generateSpeakingFromVocab(block.id)}
            disabled={vocabList.length === 0}
            className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-purple-300 text-slate-700 shadow-sm transition-colors disabled:opacity-40"
            title="Tự động tạo bài tập Nói cặp sử dụng các từ vựng này"
          >
            <MessageSquare size={13} className="text-blue-500" />
            <span>Sprechübung erstellen</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-sm">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <th className="py-2.5 px-3 w-20">Artikel</th>
              <th className="py-2.5 px-3 min-w-[150px]">Deutsch (Từ / Cụm từ)</th>
              <th className="py-2.5 px-3 min-w-[130px]">Bedeutung (Tiếng Việt)</th>
              <th className="py-2.5 px-3 w-24">Plural</th>
              <th className="py-2.5 px-3 min-w-[200px]">Beispielsatz (Câu ví dụ)</th>
              <th className="py-2.5 px-2 w-10 text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {vocabList.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-6 text-slate-400">
                  Chưa có từ vựng. Bấm "+ Wort" hoặc "Wörter ergänzen (AI)" để nạp từ mới.
                </td>
              </tr>
            ) : (
              vocabList.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-2">
                    <select
                      value={item.article}
                      onChange={(e) => handleUpdateWord(item.id, { article: e.target.value as ArticleType })}
                      className={`w-full py-1 px-1.5 rounded font-bold text-xs border focus:outline-none ${
                        item.article === 'der'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : item.article === 'die'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : item.article === 'das'
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-white text-slate-500 border-slate-200'
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
                      className="w-full p-1.5 rounded bg-slate-50/50 border border-slate-200 focus:border-purple-500 focus:bg-white focus:outline-none font-semibold text-slate-800"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={item.translation}
                      placeholder="z.B. sở thích"
                      onChange={(e) => handleUpdateWord(item.id, { translation: e.target.value })}
                      className="w-full p-1.5 rounded bg-slate-50/50 border border-slate-200 focus:border-purple-500 focus:bg-white focus:outline-none text-slate-700"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={item.plural}
                      placeholder="z.B. Hobbys"
                      onChange={(e) => handleUpdateWord(item.id, { plural: e.target.value })}
                      className="w-full p-1.5 rounded bg-slate-50/50 border border-slate-200 focus:border-purple-500 focus:bg-white focus:outline-none text-slate-600"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={item.example}
                      placeholder="z.B. Mein Hobby ist Schwimmen."
                      onChange={(e) => handleUpdateWord(item.id, { example: e.target.value })}
                      className="w-full p-1.5 rounded bg-slate-50/50 border border-slate-200 focus:border-purple-500 focus:bg-white focus:outline-none text-slate-600"
                    />
                  </td>
                  <td className="p-2 text-center">
                    <button
                      type="button"
                      onClick={() => handleDeleteWord(item.id)}
                      className="p-1 text-slate-300 hover:text-red-600 rounded transition-colors"
                      title="Xóa từ này"
                    >
                      <Trash2 size={14} />
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