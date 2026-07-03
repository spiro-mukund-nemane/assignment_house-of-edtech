import Dexie, { type Table } from 'dexie';
import type { Role } from '@/constants/roles';

// One row per document the user has opened. Content is the Tiptap/ProseMirror
// JSON tree — the same shape the server stores — so it can be handed straight
// to useEditor({ content }) with no conversion.
export interface LocalDocument {
  id: string;
  title: string;
  content: Record<string, unknown>;
  role: Role;
  updatedAt: string;
}

// Local-first storage: the browser's IndexedDB is the source of truth for the
// open document, and changes sync to the server in the background (sync
// queue lands in the next milestone). Tables for that queue get added here
// via a version bump when it's built.
export class AppDatabase extends Dexie {
  documents!: Table<LocalDocument, string>;

  constructor() {
    super('house-of-edutech');
    this.version(1).stores({
      documents: 'id, updatedAt',
    });
  }
}

export const db = new AppDatabase();

export type { Table };
