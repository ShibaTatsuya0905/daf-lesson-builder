import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

const GermanGrammarHighlight = Extension.create({
  name: 'germanGrammarHighlight',
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('germanGrammarHighlight'),
        state: {
          init() {
            return DecorationSet.empty;
          },
          apply(tr) {
            const { doc } = tr;
            const decorations: Decoration[] = [];
            const regex = /\b(der|die|das)\b/gi;

            doc.descendants((node, pos) => {
              if (node.isText && node.text) {
                let match;
                while ((match = regex.exec(node.text)) !== null) {
                  const word = match[1].toLowerCase();
                  const colorClass =
                    word === 'der'
                      ? 'text-[#2563eb] font-semibold bg-[#eff6ff] px-1 rounded'
                      : word === 'die'
                      ? 'text-[#dc2626] font-semibold bg-[#fef2f2] px-1 rounded'
                      : 'text-[#16a34a] font-semibold bg-[#f0fdf4] px-1 rounded';

                  decorations.push(
                    Decoration.inline(pos + match.index, pos + match.index + match[0].length, {
                      class: colorClass,
                    })
                  );
                }
              }
            });
            return DecorationSet.create(doc, decorations);
          },
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
        },
      }),
    ];
  },
});

interface TipTapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export const TipTapEditor = ({
  content,
  onChange,
  minHeight = 'min-h-[100px]',
}: TipTapEditorProps) => {
  const editor = useEditor({
    extensions: [StarterKit, GermanGrammarHighlight],
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm focus:outline-none p-3.5 w-full ${minHeight} text-ink-charcoal font-sans bg-paper-white leading-relaxed`,
      },
    },
  });

  const insertSpecialChar = (char: string) => {
    editor?.chain().focus().insertContent(char).run();
  };

  if (!editor) return null;

  return (
    <div className="border border-mist-border rounded-lg bg-paper-white overflow-hidden shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-1 px-3 py-2 bg-chalk-canvas border-b border-mist-border">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-semibold text-slate-veil uppercase mr-1">Umlaute:</span>
          {['ä', 'ö', 'ü', 'ß', 'Ä', 'Ö', 'Ü'].map((char) => (
            <button
              key={char}
              type="button"
              onClick={() => insertSpecialChar(char)}
              className="w-7 h-7 flex items-center justify-center text-xs font-semibold rounded bg-paper-white border border-mist-border hover:border-iris-bolt text-ink-charcoal shadow-xs transition-colors cursor-pointer"
            >
              {char}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-veil">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#2563eb] inline-block"></span>der</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#dc2626] inline-block"></span>die</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#16a34a] inline-block"></span>das</span>
        </div>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
};