import React from 'react';
import { Block, SocialForm } from '../../types/lesson';
import { useLessonStore } from '../../store/useLessonStore';
import { TipTapEditor } from '../Editor/TipTapEditor';
import { Users, Lightbulb, Package } from 'lucide-react';

export const EinstiegActivity: React.FC<{ block: Block }> = ({ block }) => {
  const updateBlockData = useLessonStore((state) => state.updateBlockData);
  const data = block.data || {};

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-veil mb-1">
            Sozialform (Hình thức)
          </label>
          <div className="flex items-center gap-2 bg-chalk-canvas p-2 rounded border border-mist-border">
            <Users size={15} className="text-iris-bolt" />
            <select
              value={data.socialForm || 'PLENUM'}
              onChange={(e) => updateBlockData(block.id, { socialForm: e.target.value as SocialForm })}
              className="w-full bg-transparent text-xs font-semibold focus:outline-none text-ink-charcoal cursor-pointer"
            >
              <option value="PLENUM">Plenum (Toàn lớp)</option>
              <option value="PARTNERARBEIT">Partnerarbeit (Cặp đôi)</option>
              <option value="GRUPPENARBEIT">Gruppenarbeit (Nhóm)</option>
              <option value="EINZELARBEIT">Einzelarbeit (Cá nhân)</option>
            </select>
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-veil mb-1">
            Materialien / Hilfsmittel (Tài liệu chuẩn bị)
          </label>
          <div className="flex items-center gap-2 bg-chalk-canvas p-2 rounded border border-mist-border">
            <Package size={15} className="text-slate-veil" />
            <input
              type="text"
              value={data.materials || ''}
              placeholder="z.B. Bildkarten, Beamer, Ball..."
              onChange={(e) => updateBlockData(block.id, { materials: e.target.value })}
              className="w-full text-xs bg-transparent focus:outline-none text-ink-charcoal"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-veil mb-1">
          Ablauf & Anweisungen (Tiến trình khởi động)
        </label>
        <TipTapEditor
          content={data.instructions || block.content || ''}
          onChange={(html) => updateBlockData(block.id, { instructions: html })}
          placeholder="Câu hỏi mào đầu, hoạt động khởi động năng lượng lớp học..."
        />
      </div>

      <div className="p-3.5 bg-chalk-canvas border border-mist-border rounded-lg space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-charcoal">
          <Lightbulb size={14} className="text-iris-bolt" />
          <span>Lehrkraft-Notizen (Ghi chú sư phạm - Dành cho giáo viên)</span>
        </div>
        <textarea
          rows={2}
          value={data.teacherNotes || ''}
          placeholder="Lưu ý về phát âm, cách chia nhóm, hoặc mẹo quản lý lớp..."
          onChange={(e) => updateBlockData(block.id, { teacherNotes: e.target.value })}
          className="w-full text-xs p-2 rounded bg-paper-white border border-mist-border focus:outline-none focus:border-iris-bolt text-ink-charcoal"
        />
      </div>
    </div>
  );
};