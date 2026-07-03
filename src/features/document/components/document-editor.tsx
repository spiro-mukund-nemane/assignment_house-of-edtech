'use client';

import { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useLocalDocument } from '@/features/document/hooks/use-local-document';
import { EditorToolbar } from './editor-toolbar';
import { ROLES, type Role } from '@/constants/roles';

interface Props {
  id: string;
  title: string;
  content: Record<string, unknown>;
  role: Role;
  updatedAt: string;
}

export function DocumentEditor({ id, title, content, role, updatedAt }: Props) {
  const { localDoc, updateContent, updateTitle } = useLocalDocument({ id, title, content, role, updatedAt });
  const isEditable = role === ROLES.OWNER || role === ROLES.EDITOR;

  const [titleValue, setTitleValue] = useState(title);
  const titleDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contentDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTitleFocused = useRef(false);

  // Same reasoning as the content sync below: pull the locally-saved title in
  // once Dexie resolves (it may be newer than the `title` prop), but don't
  // clobber the field while the user is actively typing in it.
  useEffect(() => {
    if (!localDoc || isTitleFocused.current) return;
    setTitleValue(localDoc.title);
  }, [localDoc]);

  const editor = useEditor({
    extensions: [StarterKit],
    content,
    editable: isEditable,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      if (contentDebounce.current) clearTimeout(contentDebounce.current);
      contentDebounce.current = setTimeout(() => {
        updateContent(editor.getJSON());
      }, 400);
    },
  });

  // Dexie is the source of truth once hydrated — if the local copy differs
  // from what the editor currently shows (initial hydration, or a write from
  // another tab sharing the same IndexedDB), push it into the live editor.
  // Skipped while this editor is focused: localDoc also changes right after
  // OUR OWN debounced write, and re-applying that snapshot mid-keystroke
  // would overwrite whatever the user typed since the write was scheduled.
  useEffect(() => {
    if (!editor || !localDoc || editor.isFocused) return;
    if (JSON.stringify(editor.getJSON()) === JSON.stringify(localDoc.content)) return;
    editor.commands.setContent(localDoc.content, { emitUpdate: false });
  }, [editor, localDoc]);

  useEffect(() => {
    editor?.setEditable(isEditable);
  }, [editor, isEditable]);

  function handleTitleChange(value: string) {
    setTitleValue(value);
    if (titleDebounce.current) clearTimeout(titleDebounce.current);
    titleDebounce.current = setTimeout(() => updateTitle(value), 400);
  }

  if (!editor) return null;

  return (
    <div className="flex w-full flex-col gap-2">
      {isEditable ? (
        <input
          value={titleValue}
          onChange={(e) => handleTitleChange(e.target.value)}
          onFocus={() => {
            isTitleFocused.current = true;
          }}
          onBlur={() => {
            isTitleFocused.current = false;
          }}
          aria-label="Document title"
          className="w-full rounded-md border border-transparent bg-transparent px-1 text-2xl font-semibold text-slate-900 outline-none focus:border-slate-300 dark:text-slate-100 dark:focus:border-slate-700"
        />
      ) : (
        <h1 className="px-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">{titleValue}</h1>
      )}

      <div>
        {isEditable && <EditorToolbar editor={editor} />}
        <EditorContent
          editor={editor}
          className={`min-h-[300px] rounded-md border border-slate-200 p-4 dark:border-slate-800 ${
            isEditable ? 'rounded-t-none' : ''
          }`}
        />
      </div>

      <p className="text-xs text-slate-400 dark:text-slate-600">
        Saved locally on this device. Server sync lands in the next milestone.
      </p>
    </div>
  );
}
