'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CollaboratorPanel } from './collaborator-panel';
import { DocumentEditor } from './document-editor';
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
    <div className="flex w-full max-w-3xl flex-col gap-6">
      {document.role === ROLES.OWNER && (
        <div className="flex justify-end">
          <Button variant="secondary" onClick={handleDelete} isLoading={isDeleting}>
            Delete document
          </Button>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <DocumentEditor
        id={document.id}
        title={document.title}
        content={document.content}
        role={document.role}
        updatedAt={document.updatedAt}
      />

      {document.role === ROLES.OWNER && (
        <CollaboratorPanel documentId={document.id} initialCollaborators={document.collaborators} />
      )}
    </div>
  );
}
