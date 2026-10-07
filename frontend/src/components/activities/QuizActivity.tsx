import React from 'react';
import { Block, QuizQuestionItem } from '../../types/lesson';
import { useLessonStore } from '../../store/useLessonStore';
import { Plus, Trash2, CheckCircle2, HelpCircle, X } from 'lucide-react';

export const QuizActivity: React.FC<{ block: Block }> = ({ block }) => {
  const updateBlockData = useLessonStore((state) => state.updateBlockData);
  const questions = block.data?.quizQuestions || [];

  const addQuestion = () => {
    const newQ: QuizQuestionItem = {
      id: `q-${Date.now()}`,
      question: '',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswerIndex: 0,
      explanation: '',
    };
    updateBlockData(block.id, { quizQuestions: [...questions, newQ] });
  };

  const updateQuestion = (index: number, patch: Partial<QuizQuestionItem>) => {
    const copy = [...questions];
    copy[index] = { ...copy[index], ...patch };
    updateBlockData(block.id, { quizQuestions: copy });
  };

  const deleteQuestion = (index: number) => {
    updateBlockData(block.id, { quizQuestions: questions.filter((_, i) => i !== index) });
  };

  const addOption = (qIdx: number) => {
    const q = questions[qIdx];
    const newOpts = [...q.options, `Option ${String.fromCharCode(65 + q.options.length)}`];
    updateQuestion(qIdx, { options: newOpts });
  };

  const deleteOption = (qIdx: number, optIdx: number) => {
    const q = questions[qIdx];
    if (q.options.length <= 2) {
      alert('Một câu hỏi phải có ít nhất 2 đáp án!');
      return;
    }
    const newOpts = q.options.filter((_, i) => i !== optIdx);
    let nextCorrect = q.correctAnswerIndex;
    if (nextCorrect === optIdx) nextCorrect = 0;
    else if (nextCorrect > optIdx) nextCorrect -= 1;

    updateQuestion(qIdx, { options: newOpts, correctAnswerIndex: nextCorrect });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
          <HelpCircle size={15} className="text-amber-600" />
          <span>Interaktives Quiz & Prüfungsfragen ({questions.length} câu)</span>
        </div>
        <button
          type="button"
          onClick={addQuestion}
          className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition-colors"
        >
          <Plus size={14} /> + Thêm câu hỏi
        </button>
      </div>

      <div className="space-y-3.5">
        {questions.length === 0 ? (
          <p className="text-xs text-center py-6 text-slate-400 bg-amber-50/30 border border-dashed border-amber-200 rounded-xl">
            Chưa có câu hỏi nào. Bấm "+ Thêm câu hỏi" để soạn thảo câu hỏi trắc nghiệm.
          </p>
        ) : (
          questions.map((q, qIdx) => (
            <div
              key={q.id}
              className="p-4 bg-amber-50/40 border border-amber-200 rounded-xl space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-amber-800">Frage {qIdx + 1}:</span>
                <button
                  type="button"
                  onClick={() => deleteQuestion(qIdx)}
                  className="text-slate-300 hover:text-red-500 p-1 rounded"
                  title="Xóa câu hỏi này"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <div>
                <input
                  type="text"
                  value={q.question}
                  placeholder="Nội dung câu hỏi (z.B. Welcher Artikel gehört zu 'Gitarre'?)"
                  onChange={(e) => updateQuestion(qIdx, { question: e.target.value })}
                  className="w-full text-xs font-bold p-2.5 rounded-lg bg-white border border-amber-200 focus:outline-none focus:border-amber-500 text-slate-800 shadow-xs"
                />
              </div>

              <div className="space-y-2 pl-1">
                <div className="flex justify-between items-center text-[11px] text-slate-500 font-medium">
                  <span>Các lựa chọn (Click nút tròn để đặt đáp án đúng):</span>
                  <button
                    type="button"
                    onClick={() => addOption(qIdx)}
                    className="text-amber-700 hover:underline font-bold"
                  >
                    + Thêm lựa chọn
                  </button>
                </div>

                {q.options.map((opt, optIdx) => (
                  <div key={optIdx} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateQuestion(qIdx, { correctAnswerIndex: optIdx })}
                      className={`p-0.5 rounded-full transition-colors ${
                        q.correctAnswerIndex === optIdx ? 'text-green-600' : 'text-slate-300 hover:text-slate-400'
                      }`}
                      title={q.correctAnswerIndex === optIdx ? 'Đáp án đúng' : 'Chọn làm đáp án đúng'}
                    >
                      <CheckCircle2 size={18} />
                    </button>
                    <input
                      type="text"
                      value={opt}
                      placeholder={`Lựa chọn ${String.fromCharCode(65 + optIdx)}`}
                      onChange={(e) => {
                        const newOpts = [...q.options];
                        newOpts[optIdx] = e.target.value;
                        updateQuestion(qIdx, { options: newOpts });
                      }}
                      className="w-full text-xs p-2 rounded-lg bg-white border border-slate-200 focus:outline-none focus:border-amber-500 text-slate-700"
                    />
                    <button
                      type="button"
                      onClick={() => deleteOption(qIdx, optIdx)}
                      className="text-slate-300 hover:text-red-500 p-1"
                      title="Xóa lựa chọn này"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-amber-900 mb-1">
                  Lời giải thích chi tiết (Erklärung - Dành cho giáo viên/học sinh đối chiếu):
                </label>
                <input
                  type="text"
                  value={q.explanation || ''}
                  placeholder="z.B. Es heißt 'die Gitarre' (Femininum)."
                  onChange={(e) => updateQuestion(qIdx, { explanation: e.target.value })}
                  className="w-full text-xs p-2 rounded-lg bg-white border border-amber-200 focus:outline-none focus:border-amber-500 text-amber-900 placeholder:text-amber-600/50"
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};