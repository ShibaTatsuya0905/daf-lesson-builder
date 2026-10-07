import React from 'react';
import { Block } from '../../types/lesson';
import { useLessonStore } from '../../store/useLessonStore';
import { TipTapEditor } from '../Editor/TipTapEditor';

export const DefaultActivity: React.FC<{ block: Block }> = ({ block }) => {
  const updateBlockContent = useLessonStore((state) => state.updateBlockContent);

  return (
    <div className="space-y-2">
      <TipTapEditor
        content={block.content || ''}
        onChange={(content: string) => updateBlockContent(block.id, content)}
        placeholder="Soạn nội dung chi tiết cho hoạt động này..."
      />
    </div>
  );
};