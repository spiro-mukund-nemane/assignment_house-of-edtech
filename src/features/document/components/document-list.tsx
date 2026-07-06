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
    router.refresh();
  }

  return (
    <div className="flex w-full max-w-5xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Your documents</h1>
        <Button onClick={handleCreate} isLoading={isCreating}>
          New document
        </Button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {documents.length === 0 ? (
        <p className="text-sm text-slate-600">You don&apos;t have any documents yet.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
            <li key={doc.id}>
              <Link
                href={`/documents/${doc.id}`}
                className="flex h-36 flex-col justify-between rounded-lg border border-slate-200 p-4 transition-colors hover:border-slate-300 hover:bg-slate-50"
              >
                <span className="line-clamp-2 font-medium text-slate-900">{doc.title}</span>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium capitalize text-slate-600">
                    {doc.role}
                  </span>
                  <span>{new Date(doc.updatedAt).toLocaleDateString()}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
