import React from 'react';
import { Block } from '../../types/lesson';
import { useLessonStore } from '../../store/useLessonStore';
import { TipTapEditor } from '../Editor/TipTapEditor';
import { Music, FileText, Plus, Trash2 } from 'lucide-react';

export const HoerenActivity: React.FC<{ block: Block }> = ({ block }) => {
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
        <label className="block text-xs font-semibold text-slate-600 mb-1">
          Audioquelle (Link nghe / Tên tệp âm thanh)
        </label>
        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
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
          Höraufgaben & Anweisungen (Nhiệm vụ khi nghe)
        </label>
        <TipTapEditor
          content={data.instructions || block.content || ''}
          onChange={(html) => updateBlockData(block.id, { instructions: html })}
          placeholder="Hướng dẫn học viên: Nghe lần 1 bắt ý chính, nghe lần 2 trả lời chi tiết..."
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-600">
            Hörverständnisfragen (Câu hỏi kiểm tra nghe)
          </label>
          <button
            type="button"
            onClick={addQuestion}
            className="flex items-center gap-1 text-[11px] font-semibold text-orange-600 hover:text-orange-800"
          >
            <Plus size={13} /> + Thêm câu hỏi
          </button>
        </div>
        {questions.map((q, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="font-mono text-xs text-orange-600 font-bold">{idx + 1}.</span>
            <input
              type="text"
              value={q}
              placeholder="z.B. Richtig oder Falsch? / Wer spielt Gitarre?"
              onChange={(e) => updateQuestion(idx, e.target.value)}
              className="w-full text-xs p-1.5 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none text-slate-800"
            />
            <button
              type="button"
              onClick={() => deleteQuestion(idx)}
              className="text-slate-300 hover:text-red-500 p-1"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>

      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
          <FileText size={14} className="text-slate-500" />
          <span>Hörtext / Transkript (Lời thoại bài nghe - Dành cho giáo viên)</span>
        </div>
        <textarea
          rows={3}
          value={data.transcript || ''}
          placeholder="Dán toàn bộ lời thoại audio ở đây để đối chiếu..."
          onChange={(e) => updateBlockData(block.id, { transcript: e.target.value })}
          className="w-full text-xs p-2 rounded-lg bg-white border border-slate-200 focus:outline-none text-slate-700"
        />
      </div>
    </div>
  );
};