import React, { useState } from 'react';
import { Block, FlashcardItem } from '../../types/lesson';
import { useLessonStore } from '../../store/useLessonStore';
import { Plus, Trash2, RotateCw, Layers } from 'lucide-react';

export const KarteikartenActivity: React.FC<{ block: Block }> = ({ block }) => {
  const updateBlockData = useLessonStore((state) => state.updateBlockData);
  const cards = block.data?.flashcards || [];
  const [flippedMap, setFlippedMap] = useState<Record<string, boolean>>({});

  const toggleFlip = (id: string) => {
    setFlippedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const addCard = () => {
    const newCard: FlashcardItem = {
      id: `c-${Date.now()}`,
      front: '',
      back: '',
      hint: '',
    };
    updateBlockData(block.id, { flashcards: [...cards, newCard] });
  };

  const updateCard = (id: string, patch: Partial<FlashcardItem>) => {
    const updated = cards.map((c) => (c.id === id ? { ...c, ...patch } : c));
    updateBlockData(block.id, { flashcards: updated });
  };

  const deleteCard = (id: string) => {
    updateBlockData(block.id, { flashcards: cards.filter((c) => c.id !== id) });
  };

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-800">
          <Layers size={15} className="text-indigo-600" />
          <span>Digitale Karteikarten ({cards.length} Karten)</span>
        </div>
        <button
          type="button"
          onClick={addCard}
          className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors"
        >
          <Plus size={14} /> + Karte hinzufügen
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {cards.length === 0 ? (
          <p className="col-span-3 text-xs text-center py-6 text-slate-400 bg-indigo-50/30 border border-dashed border-indigo-200 rounded-xl">
            Chưa có thẻ từ vựng nào. Bấm "+ Karte hinzufügen" để tạo thẻ flashcard.
          </p>
        ) : (
          cards.map((card) => {
            const isFlipped = flippedMap[card.id];
            return (
              <div
                key={card.id}
                className="p-3 bg-white border border-indigo-200 rounded-xl shadow-sm space-y-2 relative"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">
                    {isFlipped ? 'Mặt sau (Bedeutung)' : 'Mặt trước (Deutsch)'}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => toggleFlip(card.id)}
                      className="p-1 text-slate-400 hover:text-indigo-600 rounded transition-colors"
                      title="Lật thẻ kiểm tra"
                    >
                      <RotateCw size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteCard(card.id)}
                      className="p-1 text-slate-300 hover:text-red-500 rounded transition-colors"
                      title="Xóa thẻ này"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {!isFlipped ? (
                  <input
                    type="text"
                    value={card.front}
                    placeholder="Mặt trước (z.B. das Hobby)"
                    onChange={(e) => updateCard(card.id, { front: e.target.value })}
                    className="w-full text-xs font-bold p-1.5 rounded bg-indigo-50/40 border border-indigo-100 focus:outline-none text-slate-800"
                  />
                ) : (
                  <input
                    type="text"
                    value={card.back}
                    placeholder="Mặt sau (z.B. sở thích)"
                    onChange={(e) => updateCard(card.id, { back: e.target.value })}
                    className="w-full text-xs p-1.5 rounded bg-emerald-50/40 border border-emerald-100 focus:outline-none text-slate-800"
                  />
                )}

                <input
                  type="text"
                  value={card.hint || ''}
                  placeholder="Gợi ý/Plural (z.B. die Hobbys)"
                  onChange={(e) => updateCard(card.id, { hint: e.target.value })}
                  className="w-full text-[11px] p-1 rounded bg-slate-50 border border-slate-200 focus:outline-none text-slate-600"
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};