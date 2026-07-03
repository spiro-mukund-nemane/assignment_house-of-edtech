import Dexie, { type Table } from 'dexie';

// Local-first storage: the browser's IndexedDB is the source of truth, and
// changes sync to the server in the background. Tables for documents and the
// sync queue get added here as the document editor feature is built.
export class AppDatabase extends Dexie {
  constructor() {
    super('house-of-edutech');
    this.version(1).stores({});
  }
}

export const db = new AppDatabase();

export type { Table };
