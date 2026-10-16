import React from 'react';
import { Block } from '../../types/lesson';
import { useLessonStore } from '../../store/useLessonStore';
import { TipTapEditor } from '../Editor/TipTapEditor';
import { PenTool, Key, Quote, Sparkles, Award } from 'lucide-react';

export const SchreibenActivity: React.FC<{ block: Block }> = ({ block }) => {
  const updateBlockData = useLessonStore((state) => state.updateBlockData);
  const data = block.data || {};

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-1.5 mb-2 text-xs font-bold text-pink-800">
          <PenTool size={15} className="text-pink-600" />
          <span>Schreibaufgabe (Đề bài & Nhiệm vụ viết)</span>
        </div>
        <TipTapEditor
          content={data.instructions || block.content || ''}
          onChange={(html) => updateBlockData(block.id, { instructions: html })}
          placeholder="Đề bài: Viết một đoạn văn ngắn 30-40 từ giới thiệu về sở thích của em..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-3 bg-pink-50/40 border border-pink-200 rounded-xl space-y-1.5">
          <div className="flex items-center gap-1 text-xs font-bold text-pink-800">
            <Key size={13} className="text-pink-600" />
            <span>Hilfswörter (Từ khóa gợi ý - cách nhau bởi dấu phẩy)</span>
          </div>
          <input
            type="text"
            value={data.wordBank?.join(', ') || ''}
            placeholder="am Wochenende, gern, mein Hobby, mit Freunden..."
            onChange={(e) =>
              updateBlockData(block.id, {
                wordBank: e.target.value.split(',').map((w) => w.trim()).filter(Boolean),
              })
            }
            className="w-full text-xs p-2.5 rounded-lg bg-white border border-pink-200 focus:outline-none text-slate-800"
          />
        </div>

        <div className="p-3 bg-pink-50/40 border border-pink-200 rounded-xl space-y-1.5">
          <div className="flex items-center gap-1 text-xs font-bold text-pink-800">
            <Quote size={13} className="text-pink-600" />
            <span>Satzanfänge (Gợi ý mở đầu câu - cách nhau bởi dấu |)</span>
          </div>
          <input
            type="text"
            value={data.sentenceStarters?.join(' | ') || ''}
            placeholder="Mein Name ist... | In meiner Freizeit... | Ich spiele gern..."
            onChange={(e) =>
              updateBlockData(block.id, {
                sentenceStarters: e.target.value.split('|').map((w) => w.trim()).filter(Boolean),
              })
            }
            className="w-full text-xs p-2.5 rounded-lg bg-white border border-pink-200 focus:outline-none text-slate-800"
          />
        </div>
      </div>

      {/* KHU VỰC DÀNH CHO GIÁO VIÊN: BÀI MẪU VÀ TIÊU CHÍ CHẤM (THƯỜNG DO AI SINH RA) */}
      <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl space-y-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 mb-2">
            <Sparkles size={14} className="text-emerald-600" />
            <span>Musterlösung (Bài văn mẫu đạt điểm tối đa - Chỉ giáo viên thấy)</span>
          </div>
          <textarea
            rows={4}
            value={data.sampleSolution || ''}
            placeholder="Bài viết mẫu chuẩn CEFR..."
            onChange={(e) => updateBlockData(block.id, { sampleSolution: e.target.value })}
            className="w-full text-xs p-3 rounded-xl bg-white border border-emerald-200 focus:outline-none focus:border-emerald-500 text-slate-800 leading-relaxed"
          />
        </div>

        <div className="pt-2 border-t border-emerald-200/60">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 mb-2">
            <Award size={14} className="text-emerald-600" />
            <span>Bewertungskriterien (Khung chấm điểm CEFR)</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500">Inhalt (Nội dung)</label>
              <input 
                type="number" 
                value={data.rubric?.taskCompletion || 0} 
                onChange={(e) => updateBlockData(block.id, { rubric: { ...data.rubric, taskCompletion: Number(e.target.value) } })}
                className="w-full p-2 bg-white border border-emerald-200 rounded text-center font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500">Kohärenz (Mạch lạc)</label>
              <input 
                type="number" 
                value={data.rubric?.coherence || 0} 
                onChange={(e) => updateBlockData(block.id, { rubric: { ...data.rubric, coherence: Number(e.target.value) } })}
                className="w-full p-2 bg-white border border-emerald-200 rounded text-center font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500">Wortschatz (Từ vựng)</label>
              <input 
                type="number" 
                value={data.rubric?.vocabulary || 0} 
                onChange={(e) => updateBlockData(block.id, { rubric: { ...data.rubric, vocabulary: Number(e.target.value) } })}
                className="w-full p-2 bg-white border border-emerald-200 rounded text-center font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500">Grammatik (Ngữ pháp)</label>
              <input 
                type="number" 
                value={data.rubric?.grammar || 0} 
                onChange={(e) => updateBlockData(block.id, { rubric: { ...data.rubric, grammar: Number(e.target.value) } })}
                className="w-full p-2 bg-white border border-emerald-200 rounded text-center font-bold"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};