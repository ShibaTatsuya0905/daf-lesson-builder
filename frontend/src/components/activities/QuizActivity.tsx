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
        <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-charcoal">
          <HelpCircle size={15} className="text-iris-bolt" />
          <span>Interaktives Quiz & Prüfungsfragen ({questions.length} câu)</span>
        </div>
        <button
          type="button"
          onClick={addQuestion}
          className="flex items-center gap-1 text-xs font-semibold px-4 py-2 rounded-full bg-iris-bolt hover:opacity-90 text-paper-white shadow-xs transition-opacity cursor-pointer"
        >
          <Plus size={14} /> + Thêm câu hỏi
        </button>
      </div>

      <div className="space-y-3.5">
        {questions.length === 0 ? (
          <p className="text-xs text-center py-8 text-fog-mist bg-chalk-canvas border border-dashed border-mist-border rounded-lg">
            Chưa có câu hỏi nào. Nhấp "+ Thêm câu hỏi" để bắt đầu soạn câu hỏi trắc nghiệm.
          </p>
        ) : (
          questions.map((q, qIdx) => (
            <div
              key={q.id}
              className="p-4 bg-chalk-canvas border border-mist-border rounded-lg space-y-3 shadow-xs"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-semibold text-iris-bolt">Frage {qIdx + 1}:</span>
                <button
                  type="button"
                  onClick={() => deleteQuestion(qIdx)}
                  className="text-slate-veil hover:text-[#dc2626] p-1 rounded cursor-pointer"
                  title="Xóa câu hỏi này"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div>
                <input
                  type="text"
                  value={q.question}
                  placeholder="Nội dung câu hỏi (z.B. Welcher Artikel gehört zu 'Gitarre'?)"
                  onChange={(e) => updateQuestion(qIdx, { question: e.target.value })}
                  className="w-full text-xs font-semibold p-2 rounded bg-paper-white border border-mist-border focus:outline-none focus:border-iris-bolt text-ink-charcoal"
                />
              </div>

              <div className="space-y-1.5 pl-1">
                <div className="flex justify-between items-center text-[11px] text-slate-veil font-medium">
                  <span>Lựa chọn (Nhấp nút tròn để đặt đáp án đúng):</span>
                  <button
                    type="button"
                    onClick={() => addOption(qIdx)}
                    className="text-iris-bolt hover:underline font-semibold cursor-pointer"
                  >
                    + Thêm lựa chọn
                  </button>
                </div>

                {q.options.map((opt, optIdx) => (
                  <div key={optIdx} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateQuestion(qIdx, { correctAnswerIndex: optIdx })}
                      className={`p-0.5 rounded-full transition-colors cursor-pointer ${
                        q.correctAnswerIndex === optIdx ? 'text-iris-bolt' : 'text-fog-mist hover:text-slate-veil'
                      }`}
                      title={q.correctAnswerIndex === optIdx ? 'Đáp án đúng' : 'Chọn làm đáp án đúng'}
                    >
                      <CheckCircle2 size={16} />
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
                      className="w-full text-xs p-1.5 rounded bg-paper-white border border-mist-border focus:outline-none focus:border-iris-bolt text-ink-charcoal"
                    />
                    <button
                      type="button"
                      onClick={() => deleteOption(qIdx, optIdx)}
                      className="text-slate-veil hover:text-[#dc2626] p-1 cursor-pointer"
                      title="Xóa lựa chọn này"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-veil mb-1">
                  Lời giải thích (Erklärung):
                </label>
                <input
                  type="text"
                  value={q.explanation || ''}
                  placeholder="z.B. Es heißt 'die Gitarre' (Femininum)."
                  onChange={(e) => updateQuestion(qIdx, { explanation: e.target.value })}
                  className="w-full text-xs p-2 rounded bg-paper-white border border-mist-border focus:outline-none focus:border-iris-bolt text-ink-charcoal"
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};