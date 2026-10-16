import React from 'react';
import { Block, SocialForm } from '../../types/lesson';
import { useLessonStore } from '../../store/useLessonStore';
import { TipTapEditor } from '../Editor/TipTapEditor';
import { Users, Target, Plus, Trash2, MessageSquare } from 'lucide-react';

export const SprechenActivity: React.FC<{ block: Block }> = ({ block }) => {
  const updateBlockData = useLessonStore((state) => state.updateBlockData);
  const data = block.data || {};
  const starters = data.sentenceStarters || [];
  const questions = data.questions || [];

  const addStarter = () => {
    updateBlockData(block.id, { sentenceStarters: [...starters, ''] });
  };

  const updateStarter = (index: number, val: string) => {
    const copy = [...starters];
    copy[index] = val;
    updateBlockData(block.id, { sentenceStarters: copy });
  };

  const deleteStarter = (index: number) => {
    updateBlockData(block.id, { sentenceStarters: starters.filter((_, i) => i !== index) });
  };

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-veil mb-1">
            Sozialform (Hình thức tương tác)
          </label>
          <div className="flex items-center gap-2 bg-chalk-canvas p-2 rounded border border-mist-border">
            <Users size={15} className="text-iris-bolt" />
            <select
              value={data.socialForm || 'PARTNERARBEIT'}
              onChange={(e) => updateBlockData(block.id, { socialForm: e.target.value as SocialForm })}
              className="w-full bg-transparent text-xs font-semibold focus:outline-none text-ink-charcoal cursor-pointer"
            >
              <option value="PARTNERARBEIT">Partnerarbeit (Luyện tập cặp đôi)</option>
              <option value="GRUPPENARBEIT">Gruppenarbeit (Luyện nhóm 3-4 người)</option>
              <option value="PLENUM">Plenum (Thuyết trình toàn lớp)</option>
              <option value="EINZELARBEIT">Einzelarbeit (Độc thoại cá nhân)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-veil mb-1">
            Lernziel (Mục tiêu giao tiếp)
          </label>
          <div className="flex items-center gap-2 bg-chalk-canvas p-2 rounded border border-mist-border">
            <Target size={15} className="text-iris-bolt" />
            <input
              type="text"
              value={data.goal || ''}
              placeholder="z.B. Hỏi và trả lời về sở thích bản thân..."
              onChange={(e) => updateBlockData(block.id, { goal: e.target.value })}
              className="w-full text-xs bg-transparent focus:outline-none text-ink-charcoal"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-veil mb-1">
          Anweisungen für Schüler (Hướng dẫn nhiệm vụ nói)
        </label>
        <TipTapEditor
          content={data.instructions || block.content || ''}
          onChange={(html) => updateBlockData(block.id, { instructions: html })}
          placeholder="Hướng dẫn học viên cách thức đối thoại, thời gian đổi lượt..."
        />
      </div>

      <div className="p-3.5 bg-chalk-canvas border border-mist-border rounded-lg space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-charcoal">
            <MessageSquare size={14} className="text-iris-bolt" />
            <span>Redemittel & Satzbausteine (Mẫu câu giao tiếp hỗ trợ)</span>
          </div>
          <button
            type="button"
            onClick={addStarter}
            className="flex items-center gap-1 text-[11px] font-semibold text-iris-bolt hover:underline cursor-pointer"
          >
            <Plus size={13} /> + Thêm mẫu câu
          </button>
        </div>

        <div className="space-y-1.5">
          {starters.length === 0 ? (
            <p className="text-[11px] text-fog-mist italic">Chưa có mẫu câu gợi ý.</p>
          ) : (
            starters.map((starter, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={starter}
                  placeholder="z.B. Was machst du gern? / Ich spiele gern..."
                  onChange={(e) => updateStarter(idx, e.target.value)}
                  className="w-full text-xs p-2 rounded bg-paper-white border border-mist-border focus:outline-none focus:border-iris-bolt text-ink-charcoal"
                />
                <button
                  type="button"
                  onClick={() => deleteStarter(idx)}
                  className="text-slate-veil hover:text-[#dc2626] p-1 cursor-pointer"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-veil">
            Leitfragen (Các câu hỏi gợi mở)
          </label>
          <button
            type="button"
            onClick={addQuestion}
            className="text-[11px] font-semibold text-iris-bolt hover:underline cursor-pointer"
          >
            + Thêm câu hỏi
          </button>
        </div>
        {questions.map((q, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="font-mono text-xs text-slate-veil font-semibold">{idx + 1}.</span>
            <input
              type="text"
              value={q}
              placeholder="z.B. Wie oft machst du Sport?"
              onChange={(e) => updateQuestion(idx, e.target.value)}
              className="w-full text-xs p-2 rounded bg-chalk-canvas border border-mist-border focus:outline-none focus:border-iris-bolt text-ink-charcoal"
            />
            <button
              type="button"
              onClick={() => deleteQuestion(idx)}
              className="text-slate-veil hover:text-[#dc2626] p-1 cursor-pointer"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};