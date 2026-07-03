'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { Role } from '@/constants/roles';

interface DocumentListItem {
  id: string;
  title: string;
  role: Role;
  updatedAt: string;
}

export function DocumentList({ documents }: { documents: DocumentListItem[] }) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    setIsCreating(true);
    setError(null);

    const res = await fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const body = await res.json();

    if (!body.success) {
      setError(body.message);
      setIsCreating(false);
      return;
    }

    router.push(`/documents/${body.data.id}`);
  }

  return (
    <div className="flex w-full max-w-2xl flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Your documents</h1>
        <Button onClick={handleCreate} isLoading={isCreating}>
          New document
        </Button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {documents.length === 0 ? (
        <p className="text-sm text-slate-600 dark:text-slate-400">You don&apos;t have any documents yet.</p>
      ) : (
        <ul className="divide-y divide-slate-200 rounded-md border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
          {documents.map((doc) => (
            <li key={doc.id}>
              <Link
                href={`/documents/${doc.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-900"
              >
                <span className="font-medium text-slate-900 dark:text-slate-100">{doc.title}</span>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {doc.role} · {new Date(doc.updatedAt).toLocaleDateString()}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
