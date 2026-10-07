import React from 'react';
import { Block } from '../../types/lesson';
import { useLessonStore } from '../../store/useLessonStore';
import { TipTapEditor } from '../Editor/TipTapEditor';
import { PenTool, Key, Quote } from 'lucide-react';

export const SchreibenActivity: React.FC<{ block: Block }> = ({ block }) => {
  const updateBlockData = useLessonStore((state) => state.updateBlockData);
  const data = block.data || {};

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-1.5 mb-1 text-xs font-bold text-pink-800">
          <PenTool size={15} className="text-pink-600" />
          <span>Schreibaufgabe (Nhiệm vụ viết)</span>
        </div>
        <TipTapEditor
          content={data.instructions || block.content || ''}
          onChange={(html) => updateBlockData(block.id, { instructions: html })}
          placeholder="Đề bài: Viết một đoạn văn ngắn 30-40 từ giới thiệu về sở thích của em..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
            className="w-full text-xs p-2 rounded-lg bg-white border border-pink-200 focus:outline-none text-slate-800"
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
            className="w-full text-xs p-2 rounded-lg bg-white border border-pink-200 focus:outline-none text-slate-800"
          />
        </div>
      </div>
    </div>
  );
};