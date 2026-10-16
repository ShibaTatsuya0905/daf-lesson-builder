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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-charcoal">
          <Layers size={15} className="text-iris-bolt" />
          <span>Digitale Karteikarten ({cards.length} Flashcards)</span>
        </div>
        <button
          type="button"
          onClick={addCard}
          className="flex items-center gap-1 text-xs font-semibold px-4 py-2 rounded-full bg-iris-bolt hover:opacity-90 text-paper-white shadow-xs transition-opacity cursor-pointer"
        >
          <Plus size={14} /> + Karte hinzufügen
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
        {cards.length === 0 ? (
          <p className="col-span-3 text-xs text-center py-8 text-fog-mist bg-chalk-canvas border border-dashed border-mist-border rounded-lg">
            Chưa có thẻ từ vựng nào. Nhấp "+ Karte hinzufügen" để tạo flashcard ôn tập.
          </p>
        ) : (
          cards.map((card) => {
            const isFlipped = flippedMap[card.id];
            return (
              <div
                key={card.id}
                className="p-3.5 bg-paper-white border border-mist-border rounded-lg shadow-xs space-y-2 relative"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-iris-bolt">
                    {isFlipped ? 'Mặt sau (Bedeutung)' : 'Mặt trước (Deutsch)'}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => toggleFlip(card.id)}
                      className="p-1 text-slate-veil hover:text-iris-bolt rounded transition-colors cursor-pointer"
                      title="Lật thẻ kiểm tra"
                    >
                      <RotateCw size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteCard(card.id)}
                      className="p-1 text-slate-veil hover:text-[#dc2626] rounded transition-colors cursor-pointer"
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
                    className="w-full text-xs font-semibold p-2 rounded bg-chalk-canvas border border-mist-border focus:outline-none focus:border-iris-bolt text-ink-charcoal"
                  />
                ) : (
                  <input
                    type="text"
                    value={card.back}
                    placeholder="Mặt sau (z.B. sở thích)"
                    onChange={(e) => updateCard(card.id, { back: e.target.value })}
                    className="w-full text-xs font-semibold p-2 rounded bg-lilac-wash border border-iris-bolt focus:outline-none text-ink-charcoal"
                  />
                )}

                <input
                  type="text"
                  value={card.hint || ''}
                  placeholder="Gợi ý/Plural (z.B. die Hobbys)"
                  onChange={(e) => updateCard(card.id, { hint: e.target.value })}
                  className="w-full text-[11px] p-1.5 rounded bg-chalk-canvas border border-mist-border focus:outline-none focus:border-iris-bolt text-slate-veil"
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};