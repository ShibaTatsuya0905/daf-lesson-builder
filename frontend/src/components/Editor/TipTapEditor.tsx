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
                      ? 'text-blue-600 font-bold bg-blue-50 px-1 rounded'
                      : word === 'die'
                      ? 'text-red-600 font-bold bg-red-50 px-1 rounded'
                      : 'text-green-600 font-bold bg-green-50 px-1 rounded';

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
  minHeight = 'min-h-[90px]',
}: TipTapEditorProps) => {
  const editor = useEditor({
    extensions: [StarterKit, GermanGrammarHighlight],
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm focus:outline-none p-3 w-full ${minHeight} text-slate-800`,
      },
    },
  });

  const insertSpecialChar = (char: string) => {
    editor?.chain().focus().insertContent(char).run();
  };

  if (!editor) return null;

  return (
    <div className="border border-slate-200 rounded-lg bg-white overflow-hidden shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-1 px-3 py-1.5 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-1">
          <span className="text-[11px] font-medium text-slate-400 uppercase mr-1">Umlaute:</span>
          {['ä', 'ö', 'ü', 'ß', 'Ä', 'Ö', 'Ü'].map((char) => (
            <button
              key={char}
              type="button"
              onClick={() => insertSpecialChar(char)}
              className="w-6 h-6 flex items-center justify-center text-xs font-semibold rounded bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 shadow-sm transition-colors"
            >
              {char}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>der</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span>die</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>das</span>
        </div>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
};