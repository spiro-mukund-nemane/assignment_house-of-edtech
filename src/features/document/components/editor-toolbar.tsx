'use client';

import type { Editor } from '@tiptap/react';
import type { ReactNode } from 'react';

function ToolbarButton({
  onClick,
  isActive,
  label,
  children,
}: {
  onClick: () => void;
  isActive?: boolean;
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      // Without this, mousedown shifts DOM focus to the button before the
      // click handler's editor.chain().focus() runs, forcing ProseMirror
      // through a blur→refocus cycle on every toolbar click. That's a real,
      // reproducible way to lose the current selection right before a
      // command that depends on it (e.g. clicking Bold, then hitting Enter).
      onMouseDown={(e) => e.preventDefault()}
      aria-label={label}
      aria-pressed={isActive}
      className={`rounded px-2 py-1 text-sm font-medium ${
        isActive
          ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
          : 'text-slate-700 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800'
      }`}
    >
      {children}
    </button>
  );
}

export function EditorToolbar({ editor }: { editor: Editor }) {
  return (
    <div className="flex flex-wrap items-center gap-1 rounded-t-md border border-b-0 border-slate-200 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-900">
      <ToolbarButton label="Bold" isActive={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
        B
      </ToolbarButton>
      <ToolbarButton
        label="Italic"
        isActive={editor.isActive('italic')}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        I
      </ToolbarButton>
      <ToolbarButton
        label="Strikethrough"
        isActive={editor.isActive('strike')}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        S
      </ToolbarButton>

      <span className="mx-1 h-5 w-px bg-slate-300 dark:bg-slate-700" />

      <ToolbarButton
        label="Heading 1"
        isActive={editor.isActive('heading', { level: 1 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        H1
      </ToolbarButton>
      <ToolbarButton
        label="Heading 2"
        isActive={editor.isActive('heading', { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        H2
      </ToolbarButton>

      <span className="mx-1 h-5 w-px bg-slate-300 dark:bg-slate-700" />

      <ToolbarButton
        label="Bullet list"
        isActive={editor.isActive('bulletList')}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        • List
      </ToolbarButton>
      <ToolbarButton
        label="Numbered list"
        isActive={editor.isActive('orderedList')}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        1. List
      </ToolbarButton>
      <ToolbarButton
        label="Blockquote"
        isActive={editor.isActive('blockquote')}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        “ ”
      </ToolbarButton>

      <span className="mx-1 h-5 w-px bg-slate-300 dark:bg-slate-700" />

      <ToolbarButton label="Undo" onClick={() => editor.chain().focus().undo().run()}>
        ↶
      </ToolbarButton>
      <ToolbarButton label="Redo" onClick={() => editor.chain().focus().redo().run()}>
        ↷
      </ToolbarButton>
    </div>
  );
}
