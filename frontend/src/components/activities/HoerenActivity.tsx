import React from 'react';
import { Block, QuizQuestionItem } from '../../types/lesson';
import { useLessonStore } from '../../store/useLessonStore';
import { TipTapEditor } from '../Editor/TipTapEditor';
import { Music, FileText, Plus, Trash2, HelpCircle, CheckCircle2, X } from 'lucide-react';

export const HoerenActivity: React.FC<{ block: Block }> = ({ block }) => {
  const updateBlockData = useLessonStore((state) => state.updateBlockData);
  const data = block.data || {};
  
  const simpleQuestions = data.questions || [];
  const quizQuestions = data.quizQuestions || [];

  // --- LOGIC TRẮC NGHIỆM NGHE ---
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

  // --- TỰ LUẬN NGHE ---
  const addSimpleQuestion = () => updateBlockData(block.id, { questions: [...simpleQuestions, ''] });
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
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">
          Audioquelle (Link nghe / Tên tệp âm thanh)
        </label>
        <div className="flex items-center gap-2 bg-stone-50 p-2 rounded-lg border border-stone-200">
          <Music size={16} className="text-orange-500" />
          <input
            type="text"
            value={data.audioUrl || ''}
            placeholder="z.B. Track 04 - Menschen A1 hoặc https://..."
            onChange={(e) => updateBlockData(block.id, { audioUrl: e.target.value })}
            className="w-full text-xs bg-transparent focus:outline-none text-slate-800"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">
          Höraufgaben & Anweisungen (Đề bài & Hướng dẫn)
        </label>
        <TipTapEditor
          content={data.instructions || block.content || ''}
          onChange={(html) => updateBlockData(block.id, { instructions: html })}
          placeholder="Hướng dẫn học viên: Nghe lần 1 bắt ý chính, nghe lần 2 trả lời chi tiết..."
        />
      </div>

      {/* CÂU HỎI TRẮC NGHIỆM NGHE (AI) */}
      <div className="p-4 bg-orange-50/50 border border-orange-200 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-orange-800">
            <HelpCircle size={15} className="text-orange-600" />
            <span>Hörverständnisfragen (Trắc nghiệm Nghe hiểu)</span>
          </div>
          <button
            type="button"
            onClick={addQuizQuestion}
            className="flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors shadow-sm"
          >
            <Plus size={13} /> + Thêm trắc nghiệm
          </button>
        </div>

        <div className="space-y-3">
          {quizQuestions.length === 0 ? (
            <p className="text-[11px] text-slate-400 italic">Chưa có câu hỏi trắc nghiệm nào.</p>
          ) : (
            quizQuestions.map((q: any, qIdx: number) => (
              <div key={q.id || qIdx} className="p-4 bg-white border border-orange-200 rounded-xl space-y-3 shadow-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-orange-800">Frage {qIdx + 1}:</span>
                  <button type="button" onClick={() => deleteQuizQuestion(qIdx)} className="text-slate-300 hover:text-red-500 p-1 rounded">
                    <Trash2 size={15} />
                  </button>
                </div>

                <input
                  type="text"
                  value={q.question || ''}
                  placeholder="Nội dung câu hỏi nghe..."
                  onChange={(e) => updateQuizQuestion(qIdx, { question: e.target.value })}
                  className="w-full text-sm font-bold p-2.5 rounded-lg bg-stone-50 border border-orange-200 focus:outline-none focus:border-orange-500 text-slate-800"
                />

                <div className="space-y-2 pl-1">
                  <div className="flex justify-between items-center text-[11px] text-slate-500 font-medium">
                    <span>Các lựa chọn (Click nút tròn để đặt đáp án đúng):</span>
                    <button type="button" onClick={() => addOption(qIdx)} className="text-orange-700 hover:underline font-bold">+ Thêm lựa chọn</button>
                  </div>

                  {q.options?.map((opt: string, optIdx: number) => {
                    const isCorrect = q.correctAnswerIndex === optIdx || (Array.isArray(q.correctAnswerIndices) && q.correctAnswerIndices.includes(optIdx));
                    return (
                      <div key={optIdx} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateQuizQuestion(qIdx, { correctAnswerIndex: optIdx, correctAnswerIndices: undefined })}
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
                          className="w-full text-xs p-2 rounded-lg bg-stone-50 border border-slate-200 focus:outline-none focus:border-orange-500 text-slate-700"
                        />
                        <button type="button" onClick={() => deleteOption(qIdx, optIdx)} className="text-slate-300 hover:text-red-500 p-1">
                          <X size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-orange-900 mb-1">Lời giải thích (Erklärung):</label>
                  <input
                    type="text"
                    value={q.explanation || ''}
                    placeholder="Giải thích dựa trên lời thoại..."
                    onChange={(e) => updateQuizQuestion(qIdx, { explanation: e.target.value })}
                    className="w-full text-xs p-2 rounded-lg bg-stone-50 border border-orange-200 focus:outline-none focus:border-orange-500 text-orange-900"
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
          <FileText size={14} className="text-slate-500" />
          <span>Hörtext / Transkript (Lời thoại bài nghe - Dành cho giáo viên)</span>
        </div>
        <textarea
          rows={4}
          value={data.transcript || ''}
          placeholder="Dán toàn bộ lời thoại audio ở đây để đối chiếu..."
          onChange={(e) => updateBlockData(block.id, { transcript: e.target.value })}
          className="w-full text-xs p-2 rounded-lg bg-white border border-stone-200 focus:outline-none focus:border-slate-400 text-slate-700"
        />
      </div>
    </div>
  );
};