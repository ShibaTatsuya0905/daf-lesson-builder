import React from 'react';
import { Block } from '../../types/lesson';
import { useLessonStore } from '../../store/useLessonStore';
import { TipTapEditor } from '../Editor/TipTapEditor';
import { PenTool, Key, Quote, Sparkles, Award } from 'lucide-react';

export const SchreibenActivity: React.FC<{ block: Block }> = ({ block }) => {
  const updateBlockData = useLessonStore((state) => state.updateBlockData);
  const data = block.data || {};

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-ink-charcoal">
          <PenTool size={15} className="text-iris-bolt" />
          <span>Schreibaufgabe (Đề bài & Nhiệm vụ viết)</span>
        </div>
        <TipTapEditor
          content={data.instructions || block.content || ''}
          onChange={(html) => updateBlockData(block.id, { instructions: html })}
          placeholder="Đề bài: Viết một đoạn văn ngắn 30-40 từ giới thiệu về sở thích của em..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <div className="p-3 bg-chalk-canvas border border-mist-border rounded-lg space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-charcoal">
            <Key size={13} className="text-iris-bolt" />
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
            className="w-full text-xs p-2 rounded bg-paper-white border border-mist-border focus:outline-none focus:border-iris-bolt text-ink-charcoal"
          />
        </div>

        <div className="p-3 bg-chalk-canvas border border-mist-border rounded-lg space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-charcoal">
            <Quote size={13} className="text-iris-bolt" />
            <span>Satzanfänge (Mở đầu câu - cách nhau bởi dấu |)</span>
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
            className="w-full text-xs p-2 rounded bg-paper-white border border-mist-border focus:outline-none focus:border-iris-bolt text-ink-charcoal"
          />
        </div>
      </div>

      <div className="p-4 bg-chalk-canvas border border-mist-border rounded-lg space-y-3.5">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-charcoal mb-2">
            <Sparkles size={14} className="text-iris-bolt" />
            <span>Musterlösung (Bài văn mẫu đạt điểm tối đa - Dành cho giáo viên)</span>
          </div>
          <textarea
            rows={4}
            value={data.sampleSolution || ''}
            placeholder="Bài viết mẫu chuẩn CEFR..."
            onChange={(e) => updateBlockData(block.id, { sampleSolution: e.target.value })}
            className="w-full text-xs p-3 rounded bg-paper-white border border-mist-border focus:outline-none focus:border-iris-bolt text-ink-charcoal leading-relaxed"
          />
        </div>

        <div className="pt-2 border-t border-mist-border">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-charcoal mb-2">
            <Award size={14} className="text-iris-bolt" />
            <span>Bewertungskriterien (Khung chấm điểm CEFR)</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="space-y-1">
              <label className="text-[11px] text-slate-veil">Inhalt (Nội dung)</label>
              <input 
                type="number" 
                value={data.rubric?.taskCompletion || 0} 
                onChange={(e) => updateBlockData(block.id, { rubric: { ...data.rubric, taskCompletion: Number(e.target.value) } })}
                className="w-full p-2 bg-paper-white border border-mist-border rounded text-center font-bold text-ink-charcoal focus:outline-none focus:border-iris-bolt"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-slate-veil">Kohärenz (Mạch lạc)</label>
              <input 
                type="number" 
                value={data.rubric?.coherence || 0} 
                onChange={(e) => updateBlockData(block.id, { rubric: { ...data.rubric, coherence: Number(e.target.value) } })}
                className="w-full p-2 bg-paper-white border border-mist-border rounded text-center font-bold text-ink-charcoal focus:outline-none focus:border-iris-bolt"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-slate-veil">Wortschatz (Từ vựng)</label>
              <input 
                type="number" 
                value={data.rubric?.vocabulary || 0} 
                onChange={(e) => updateBlockData(block.id, { rubric: { ...data.rubric, vocabulary: Number(e.target.value) } })}
                className="w-full p-2 bg-paper-white border border-mist-border rounded text-center font-bold text-ink-charcoal focus:outline-none focus:border-iris-bolt"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-slate-veil">Grammatik (Ngữ pháp)</label>
              <input 
                type="number" 
                value={data.rubric?.grammar || 0} 
                onChange={(e) => updateBlockData(block.id, { rubric: { ...data.rubric, grammar: Number(e.target.value) } })}
                className="w-full p-2 bg-paper-white border border-mist-border rounded text-center font-bold text-ink-charcoal focus:outline-none focus:border-iris-bolt"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};