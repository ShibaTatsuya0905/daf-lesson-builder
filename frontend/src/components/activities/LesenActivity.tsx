import React from 'react';
import { Block } from '../../types/lesson';
import { useLessonStore } from '../../store/useLessonStore';
import { TipTapEditor } from '../Editor/TipTapEditor';
import { Plus, Trash2, BookMarked, HelpCircle } from 'lucide-react';

export const LesenActivity: React.FC<{ block: Block }> = ({ block }) => {
  const updateBlockData = useLessonStore((state) => state.updateBlockData);
  const data = block.data || {};
  const questions = data.questions || [];

  const addQuestion = () => {
    updateBlockData(block.id, { questions: [...questions, ''] });
  };

  const updateQuestion = (index: number, val: string) => {
    const copy = [...questions];
    copy[index] = val;
    updateBlockData(block.id, { questions: copy });
  };

  const deleteQuestion = (index: number) => {
    updateBlockData(block.id, { questions: questions.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-1.5 mb-1 text-xs font-bold text-cyan-800">
          <BookMarked size={15} className="text-cyan-600" />
          <span>Lesetext (Văn bản bài đọc tiếng Đức)</span>
        </div>
        <TipTapEditor
          content={data.readingText || block.content || ''}
          onChange={(html) => updateBlockData(block.id, { readingText: html })}
          placeholder="Dán hoặc soạn bài đọc tiếng Đức tại đây..."
          minHeight="min-h-[140px]"
        />
      </div>

      <div className="p-3 bg-cyan-50/50 border border-cyan-200 rounded-xl space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-800">
            <HelpCircle size={14} className="text-cyan-600" />
            <span>Verständnisfragen (Câu hỏi kiểm tra đọc hiểu)</span>
          </div>
          <button
            type="button"
            onClick={addQuestion}
            className="flex items-center gap-1 text-[11px] font-semibold text-cyan-700 hover:text-cyan-900"
          >
            <Plus size={13} /> + Thêm câu hỏi
          </button>
        </div>

        <div className="space-y-1.5">
          {questions.length === 0 ? (
            <p className="text-[11px] text-slate-400 italic">Chưa có câu hỏi đọc hiểu.</p>
          ) : (
            questions.map((q, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-cyan-700">{idx + 1}.</span>
                <input
                  type="text"
                  value={q}
                  placeholder="z.B. Was macht Thomas am Samstag?"
                  onChange={(e) => updateQuestion(idx, e.target.value)}
                  className="w-full text-xs p-1.5 rounded-lg bg-white border border-cyan-200 focus:outline-none text-slate-800"
                />
                <button
                  type="button"
                  onClick={() => deleteQuestion(idx)}
                  className="text-slate-300 hover:text-red-500 p-1"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};