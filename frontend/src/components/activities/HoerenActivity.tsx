import React from 'react';
import { Block, QuizQuestionItem } from '../../types/lesson';
import { useLessonStore } from '../../store/useLessonStore';
import { TipTapEditor } from '../Editor/TipTapEditor';
import { Music, FileText, Plus, Trash2, HelpCircle, CheckCircle2, X } from 'lucide-react';

export const HoerenActivity: React.FC<{ block: Block }> = ({ block }) => {
  const updateBlockData = useLessonStore((state) => state.updateBlockData);
  const data = block.data || {};
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
    if (q.options.length <= 2) return alert('Phải có ít nhất 2 đáp án!');
    const newOpts = q.options.filter((_, i) => i !== optIdx);
    let nextCorrect = q.correctAnswerIndex;
    if (nextCorrect === optIdx) nextCorrect = 0;
    else if (nextCorrect > optIdx) nextCorrect -= 1;
    updateQuizQuestion(qIdx, { options: newOpts, correctAnswerIndex: nextCorrect });
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-semibold text-slate-veil mb-1">
          Audioquelle (Link nghe / Tên tệp âm thanh)
        </label>
        <div className="flex items-center gap-2 bg-chalk-canvas p-2.5 rounded border border-mist-border">
          <Music size={15} className="text-iris-bolt" />
          <input
            type="text"
            value={data.audioUrl || ''}
            placeholder="z.B. Track 04 - Menschen A1 hoặc https://..."
            onChange={(e) => updateBlockData(block.id, { audioUrl: e.target.value })}
            className="w-full text-xs bg-transparent focus:outline-none text-ink-charcoal"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-veil mb-1">
          Höraufgaben & Anweisungen (Đề bài & Hướng dẫn)
        </label>
        <TipTapEditor
          content={data.instructions || block.content || ''}
          onChange={(html) => updateBlockData(block.id, { instructions: html })}
          placeholder="Hướng dẫn học viên: Nghe lần 1 bắt ý chính, nghe lần 2 trả lời chi tiết..."
        />
      </div>

      <div className="p-4 bg-chalk-canvas border border-mist-border rounded-lg space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-charcoal">
            <HelpCircle size={15} className="text-iris-bolt" />
            <span>Hörverständnisfragen (Trắc nghiệm Nghe hiểu)</span>
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
                  <button type="button" onClick={() => deleteQuizQuestion(qIdx)} className="text-slate-veil hover:text-[#dc2626] p-1 rounded cursor-pointer">
                    <Trash2 size={14} />
                  </button>
                </div>

                <input
                  type="text"
                  value={q.question || ''}
                  placeholder="Nội dung câu hỏi nghe..."
                  onChange={(e) => updateQuizQuestion(qIdx, { question: e.target.value })}
                  className="w-full text-xs font-semibold p-2 rounded bg-chalk-canvas border border-mist-border focus:outline-none focus:border-iris-bolt text-ink-charcoal"
                />

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
                    placeholder="Giải thích dựa trên lời thoại..."
                    onChange={(e) => updateQuizQuestion(qIdx, { explanation: e.target.value })}
                    className="w-full text-xs p-1.5 rounded bg-chalk-canvas border border-mist-border focus:outline-none focus:border-iris-bolt text-ink-charcoal"
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="p-3.5 bg-chalk-canvas border border-mist-border rounded-lg space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-charcoal">
          <FileText size={14} className="text-slate-veil" />
          <span>Hörtext / Transkript (Lời thoại bài nghe - Dành cho giáo viên)</span>
        </div>
        <textarea
          rows={3}
          value={data.transcript || ''}
          placeholder="Dán toàn bộ lời thoại audio ở đây để đối chiếu..."
          onChange={(e) => updateBlockData(block.id, { transcript: e.target.value })}
          className="w-full text-xs p-2 rounded bg-paper-white border border-mist-border focus:outline-none focus:border-iris-bolt text-ink-charcoal"
        />
      </div>
    </div>
  );
};