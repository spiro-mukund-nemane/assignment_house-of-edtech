'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CollaboratorPanel } from './collaborator-panel';
import { ROLES } from '@/constants/roles';
import type { DocumentDetail as DocumentDetailType } from '@/types/document';

type SerializedDocumentDetail = Omit<DocumentDetailType, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
};

export function DocumentDetail({ document }: { document: SerializedDocumentDetail }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!confirm('Delete this document? This cannot be undone.')) return;

    setIsDeleting(true);
    const res = await fetch(`/api/documents/${document.id}`, { method: 'DELETE' });
    const body = await res.json();

    if (!body.success) {
      setError(body.message);
      setIsDeleting(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div className="flex w-full max-w-2xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{document.title}</h1>
        {document.role === ROLES.OWNER && (
          <Button variant="secondary" onClick={handleDelete} isLoading={isDeleting}>
            Delete
          </Button>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
        <p className="mb-2 font-medium text-slate-900 dark:text-slate-100">Content (editor lands next milestone)</p>
        <pre className="overflow-x-auto whitespace-pre-wrap">{JSON.stringify(document.content, null, 2)}</pre>
      </div>

      {document.role === ROLES.OWNER && (
        <CollaboratorPanel documentId={document.id} initialCollaborators={document.collaborators} />
      )}
    </div>
  );
}
