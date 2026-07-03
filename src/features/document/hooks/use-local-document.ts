'use client';

import { useEffect, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type LocalDocument } from '@/lib/db/dexie';

interface ServerDocument {
  id: string;
  title: string;
  content: Record<string, unknown>;
  role: LocalDocument['role'];
  updatedAt: string;
}

// Hydrates Dexie from the server once on open (server wins unless the local
// copy is already newer — e.g. unsynced edits from an earlier session), then
// exposes the document as a live IndexedDB query so every read and write
// after that goes through the same local-first source of truth.
export function useLocalDocument(serverDoc: ServerDocument) {
  const hydrated = useRef(false);

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;

    db.documents.get(serverDoc.id).then((existing) => {
      const isLocalNewer = existing && new Date(existing.updatedAt) > new Date(serverDoc.updatedAt);
      if (isLocalNewer) return;

      db.documents.put({
        id: serverDoc.id,
        title: serverDoc.title,
        content: serverDoc.content,
        role: serverDoc.role,
        updatedAt: serverDoc.updatedAt,
      });
    });
    // Runs once per mount (guarded above) — this is the initial hydration, not a sync on every prop change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverDoc.id]);

  const localDoc = useLiveQuery(() => db.documents.get(serverDoc.id), [serverDoc.id]);

  function updateContent(content: Record<string, unknown>) {
    return db.documents.update(serverDoc.id, { content, updatedAt: new Date().toISOString() });
  }

  function updateTitle(title: string) {
    return db.documents.update(serverDoc.id, { title, updatedAt: new Date().toISOString() });
  }

  return { localDoc, updateContent, updateTitle };
}
