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
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Sozialform (Hình thức)
          </label>
          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
            <Users size={16} className="text-emerald-500" />
            <select
              value={data.socialForm || 'PLENUM'}
              onChange={(e) => updateBlockData(block.id, { socialForm: e.target.value as SocialForm })}
              className="w-full bg-transparent text-xs font-semibold focus:outline-none text-slate-800"
            >
              <option value="PLENUM">Plenum (Toàn lớp)</option>
              <option value="PARTNERARBEIT">Partnerarbeit (Cặp)</option>
              <option value="GRUPPENARBEIT">Gruppenarbeit (Nhóm)</option>
              <option value="EINZELARBEIT">Einzelarbeit (Cá nhân)</option>
            </select>
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Materialien / Hilfsmittel (Tài liệu chuẩn bị)
          </label>
          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
            <Package size={16} className="text-slate-400" />
            <input
              type="text"
              value={data.materials || ''}
              placeholder="z.B. Bildkarten, Beamer, Ball..."
              onChange={(e) => updateBlockData(block.id, { materials: e.target.value })}
              className="w-full text-xs bg-transparent focus:outline-none text-slate-800"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">
          Ablauf & Anweisungen (Tiến trình khởi động)
        </label>
        <TipTapEditor
          content={data.instructions || block.content || ''}
          onChange={(html) => updateBlockData(block.id, { instructions: html })}
          placeholder="Câu hỏi mào đầu, hoạt động khởi động năng lượng lớp học..."
        />
      </div>

      <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
          <Lightbulb size={15} className="text-amber-600" />
          <span>Lehrkraft-Notizen (Ghi chú sư phạm - Chỉ giáo viên thấy)</span>
        </div>
        <textarea
          rows={2}
          value={data.teacherNotes || ''}
          placeholder="Lưu ý về phát âm, cách chia nhóm, hoặc mẹo quản lý lớp..."
          onChange={(e) => updateBlockData(block.id, { teacherNotes: e.target.value })}
          className="w-full text-xs p-2 rounded-lg bg-white border border-amber-200 focus:outline-none text-slate-700 placeholder:text-slate-400"
        />
      </div>
    </div>
  );
};