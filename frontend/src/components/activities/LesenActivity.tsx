import React from 'react';
import { Block, QuizQuestionItem } from '../../types/lesson';
import { useLessonStore } from '../../store/useLessonStore';
import { TipTapEditor } from '../Editor/TipTapEditor';
import { Plus, Trash2, BookMarked, HelpCircle, CheckCircle2, X } from 'lucide-react';

export const LesenActivity: React.FC<{ block: Block }> = ({ block }) => {
  const updateBlockData = useLessonStore((state) => state.updateBlockData);
  const data = block.data || {};
  
  const simpleQuestions = data.questions || [];
  const quizQuestions = data.quizQuestions || [];

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
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-ink-charcoal">
          <BookMarked size={15} className="text-iris-bolt" />
          <span>Lesetext (Văn bản bài đọc tiếng Đức)</span>
        </div>
        <TipTapEditor
          content={data.readingText || data.gapText || block.content || ''}
          onChange={(html) => updateBlockData(block.id, { readingText: html })}
          placeholder="Dán hoặc soạn bài đọc tiếng Đức tại đây..."
          minHeight="min-h-[140px]"
        />
      </div>

      <div className="p-4 bg-chalk-canvas border border-mist-border rounded-lg space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-charcoal">
            <HelpCircle size={15} className="text-iris-bolt" />
            <span>Verständnisfragen (Trắc nghiệm Đọc hiểu)</span>
          </div>
          <button
            type="button"
            onClick={addQuizQuestion}
            className="flex items-center gap-1 text-[11px] font-semibold px-4 py-1.5 bg-iris-bolt hover:opacity-90 text-paper-white rounded-full transition-opacity shadow-xs cursor-pointer"
          >
            <Plus size={13} /> + Thêm trắc nghiệm
          </button>
        </div>

        <div className="space-y-3">
          {quizQuestions.length === 0 ? (
            <p className="text-[11px] text-fog-mist italic">Chưa có câu hỏi trắc nghiệm nào.</p>
          ) : (
            quizQuestions.map((q: any, qIdx: number) => (
              <div key={q.id || qIdx} className="p-3.5 bg-paper-white border border-mist-border rounded-lg space-y-2.5 shadow-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-semibold text-iris-bolt">Frage {qIdx + 1}:</span>
                  <button type="button" onClick={() => deleteQuizQuestion(qIdx)} className="text-slate-veil hover:text-[#dc2626] p-1 rounded cursor-pointer" title="Xóa câu hỏi">
                    <Trash2 size={14} />
                  </button>
                </div>

                <div>
                  <input
                    type="text"
                    value={q.question || ''}
                    placeholder="Nội dung câu hỏi..."
                    onChange={(e) => updateQuizQuestion(qIdx, { question: e.target.value })}
                    className="w-full text-xs font-semibold p-2 rounded bg-chalk-canvas border border-mist-border focus:outline-none focus:border-iris-bolt text-ink-charcoal"
                  />
                </div>

                <div className="space-y-1.5 pl-1">
                  <div className="flex justify-between items-center text-[11px] text-slate-veil font-medium">
                    <span>Lựa chọn (Nhấp nút tròn để đặt đáp án đúng):</span>
                    <button type="button" onClick={() => addOption(qIdx)} className="text-iris-bolt hover:underline font-semibold cursor-pointer">+ Thêm lựa chọn</button>
                  </div>

                  {q.options?.map((opt: string, optIdx: number) => {
                    const isCorrect = q.correctAnswerIndex === optIdx || (Array.isArray(q.correctAnswerIndices) && q.correctAnswerIndices.includes(optIdx));
                    return (
                      <div key={optIdx} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateQuizQuestion(qIdx, { correctAnswerIndex: optIdx, correctAnswerIndices: undefined })}
                          className={`p-0.5 rounded-full transition-colors cursor-pointer ${isCorrect ? 'text-iris-bolt' : 'text-fog-mist hover:text-slate-veil'}`}
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
                            updateQuizQuestion(qIdx, { options: newOpts });
                          }}
                          className="w-full text-xs p-1.5 rounded bg-chalk-canvas border border-mist-border focus:outline-none focus:border-iris-bolt text-ink-charcoal"
                        />
                        <button type="button" onClick={() => deleteOption(qIdx, optIdx)} className="text-slate-veil hover:text-[#dc2626] p-1 cursor-pointer">
                          <X size={13} />
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-veil mb-1">Lời giải thích (Erklärung):</label>
                  <input
                    type="text"
                    value={q.explanation || ''}
                    placeholder="Giải thích vì sao chọn đáp án này..."
                    onChange={(e) => updateQuizQuestion(qIdx, { explanation: e.target.value })}
                    className="w-full text-xs p-1.5 rounded bg-chalk-canvas border border-mist-border focus:outline-none focus:border-iris-bolt text-ink-charcoal"
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="p-3.5 bg-chalk-canvas border border-mist-border rounded-lg space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-ink-charcoal">Câu hỏi Tự luận (Mở)</span>
          <button type="button" onClick={addSimpleQuestion} className="text-[11px] font-semibold text-iris-bolt hover:underline cursor-pointer">
            + Thêm tự luận
          </button>
        </div>
        <div className="space-y-1.5">
          {simpleQuestions.length === 0 ? (
            <p className="text-[11px] text-fog-mist italic">Dùng cho các câu hỏi mở không có trắc nghiệm đáp án cố định.</p>
          ) : (
            simpleQuestions.map((q: string, idx: number) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold text-slate-veil">{idx + 1}.</span>
                <input
                  type="text"
                  value={q}
                  placeholder="z.B. Was denkst du darüber?"
                  onChange={(e) => updateSimpleQuestion(idx, e.target.value)}
                  className="w-full text-xs p-2 rounded bg-paper-white border border-mist-border focus:outline-none focus:border-iris-bolt text-ink-charcoal"
                />
                <button type="button" onClick={() => deleteSimpleQuestion(idx)} className="text-slate-veil hover:text-[#dc2626] p-1 cursor-pointer">
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