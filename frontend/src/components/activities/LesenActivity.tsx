import React from 'react';
import { Block, QuizQuestionItem } from '../../types/lesson';
import { useLessonStore } from '../../store/useLessonStore';
import { TipTapEditor } from '../Editor/TipTapEditor';
import { Plus, Trash2, BookMarked, HelpCircle, CheckCircle2, X } from 'lucide-react';

export const LesenActivity: React.FC<{ block: Block }> = ({ block }) => {
  const updateBlockData = useLessonStore((state) => state.updateBlockData);
  const data = block.data || {};
  
  // Hỗ trợ cả câu hỏi thường (tự luận) và câu hỏi trắc nghiệm (AI sinh ra)
  const simpleQuestions = data.questions || [];
  const quizQuestions = data.quizQuestions || [];

  // --- LOGIC CHO CÂU HỎI TRẮC NGHIỆM ---
  const addQuizQuestion = () => {
    const newQ: QuizQuestionItem = {
      id: `q-${Date.now()}`,
      question: '',
      options: ['Richtig', 'Falsch'],
      correctAnswerIndex: 0,
      explanation: '',
    };
    updateBlockData(block.id, { quizQuestions: [...quizQuestions, newQ] });
  };

  const updateQuizQuestion = (index: number, patch: Partial<QuizQuestionItem>) => {
    const copy = [...quizQuestions];
    copy[index] = { ...copy[index], ...patch };
    updateBlockData(block.id, { quizQuestions: copy });
  };

  const deleteQuizQuestion = (index: number) => {
    updateBlockData(block.id, { quizQuestions: quizQuestions.filter((_, i) => i !== index) });
  };

  const addOption = (qIdx: number) => {
    const q = quizQuestions[qIdx];
    const newOpts = [...q.options, `Option ${String.fromCharCode(65 + q.options.length)}`];
    updateQuizQuestion(qIdx, { options: newOpts });
  };

  const deleteOption = (qIdx: number, optIdx: number) => {
    const q = quizQuestions[qIdx];
    if (q.options.length <= 2) {
      alert('Một câu hỏi phải có ít nhất 2 đáp án!');
      return;
    }
    const newOpts = q.options.filter((_, i) => i !== optIdx);
    let nextCorrect = q.correctAnswerIndex;
    if (nextCorrect === optIdx) nextCorrect = 0;
    else if (nextCorrect > optIdx) nextCorrect -= 1;

    updateQuizQuestion(qIdx, { options: newOpts, correctAnswerIndex: nextCorrect });
  };

  // --- LOGIC CHO CÂU HỎI TỰ LUẬN ĐƠN GIẢN ---
  const addSimpleQuestion = () => {
    updateBlockData(block.id, { questions: [...simpleQuestions, ''] });
  };

  const updateSimpleQuestion = (index: number, val: string) => {
    const copy = [...simpleQuestions];
    copy[index] = val;
    updateBlockData(block.id, { questions: copy });
  };

  const deleteSimpleQuestion = (index: number) => {
    updateBlockData(block.id, { questions: simpleQuestions.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      {/* PHẦN 1: BÀI ĐỌC */}
      <div>
        <div className="flex items-center gap-1.5 mb-2 text-xs font-bold text-cyan-800">
          <BookMarked size={15} className="text-cyan-600" />
          <span>Lesetext (Văn bản bài đọc tiếng Đức)</span>
        </div>
        <TipTapEditor
          content={data.readingText || data.gapText || block.content || ''}
          onChange={(html) => updateBlockData(block.id, { readingText: html })}
          placeholder="Dán hoặc soạn bài đọc tiếng Đức tại đây..."
          minHeight="min-h-[140px]"
        />
      </div>

      {/* PHẦN 2: CÂU HỎI TRẮC NGHIỆM CHUYÊN SÂU (AI THƯỜNG DÙNG CÁI NÀY) */}
      <div className="p-4 bg-cyan-50/50 border border-cyan-200 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-800">
            <HelpCircle size={15} className="text-cyan-600" />
            <span>Verständnisfragen (Trắc nghiệm Đọc hiểu: R/F, A/B/C)</span>
          </div>
          <button
            type="button"
            onClick={addQuizQuestion}
            className="flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors shadow-sm"
          >
            <Plus size={13} /> + Thêm trắc nghiệm
          </button>
        </div>

        <div className="space-y-3">
          {quizQuestions.length === 0 ? (
            <p className="text-[11px] text-slate-400 italic">Chưa có câu hỏi trắc nghiệm nào.</p>
          ) : (
            quizQuestions.map((q: any, qIdx: number) => (
              <div key={q.id || qIdx} className="p-4 bg-white border border-cyan-200 rounded-xl space-y-3 shadow-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-cyan-800">Frage {qIdx + 1}:</span>
                  <button type="button" onClick={() => deleteQuizQuestion(qIdx)} className="text-slate-300 hover:text-red-500 p-1 rounded" title="Xóa câu hỏi này">
                    <Trash2 size={15} />
                  </button>
                </div>

                <div>
                  <input
                    type="text"
                    value={q.question || ''}
                    placeholder="Nội dung câu hỏi..."
                    onChange={(e) => updateQuizQuestion(qIdx, { question: e.target.value })}
                    className="w-full text-sm font-bold p-2.5 rounded-lg bg-stone-50 border border-cyan-200 focus:outline-none focus:border-cyan-500 text-slate-800"
                  />
                </div>

                <div className="space-y-2 pl-1">
                  <div className="flex justify-between items-center text-[11px] text-slate-500 font-medium">
                    <span>Các lựa chọn (Click nút tròn để đặt đáp án đúng):</span>
                    <button type="button" onClick={() => addOption(qIdx)} className="text-cyan-700 hover:underline font-bold">+ Thêm lựa chọn</button>
                  </div>

                  {q.options?.map((opt: string, optIdx: number) => {
                    const isCorrect = q.correctAnswerIndex === optIdx || (Array.isArray(q.correctAnswerIndices) && q.correctAnswerIndices.includes(optIdx));
                    return (
                      <div key={optIdx} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            // Cập nhật đáp án đúng (ưu tiên index đơn)
                            updateQuizQuestion(qIdx, { correctAnswerIndex: optIdx, correctAnswerIndices: undefined });
                          }}
                          className={`p-0.5 rounded-full transition-colors ${isCorrect ? 'text-green-600' : 'text-slate-300 hover:text-slate-400'}`}
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
                            updateQuizQuestion(qIdx, { options: newOpts });
                          }}
                          className="w-full text-xs p-2 rounded-lg bg-stone-50 border border-slate-200 focus:outline-none focus:border-cyan-500 text-slate-700"
                        />
                        <button type="button" onClick={() => deleteOption(qIdx, optIdx)} className="text-slate-300 hover:text-red-500 p-1">
                          <X size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-cyan-900 mb-1">Lời giải thích (Erklärung):</label>
                  <input
                    type="text"
                    value={q.explanation || ''}
                    placeholder="Giải thích vì sao chọn đáp án này..."
                    onChange={(e) => updateQuizQuestion(qIdx, { explanation: e.target.value })}
                    className="w-full text-xs p-2 rounded-lg bg-stone-50 border border-cyan-200 focus:outline-none focus:border-cyan-500 text-cyan-900"
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* PHẦN 3: CÂU HỎI TỰ LUẬN ĐƠN GIẢN (CŨ) */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
         <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <span>Câu hỏi Tự luận (Không đáp án)</span>
          </div>
          <button type="button" onClick={addSimpleQuestion} className="text-[11px] font-semibold text-slate-500 hover:text-slate-700">
            + Thêm tự luận
          </button>
        </div>
        <div className="space-y-1.5">
          {simpleQuestions.length === 0 ? (
            <p className="text-[10px] text-slate-400 italic">Dùng cho câu hỏi mở không cần trắc nghiệm.</p>
          ) : (
            simpleQuestions.map((q: string, idx: number) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-400">{idx + 1}.</span>
                <input
                  type="text"
                  value={q}
                  placeholder="z.B. Was denkst du darüber?"
                  onChange={(e) => updateSimpleQuestion(idx, e.target.value)}
                  className="w-full text-xs p-1.5 rounded-lg bg-white border border-slate-200 focus:outline-none text-slate-800"
                />
                <button type="button" onClick={() => deleteSimpleQuestion(idx)} className="text-slate-300 hover:text-red-500 p-1">
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