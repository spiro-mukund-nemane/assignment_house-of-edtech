import { redirect, notFound } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import { documentService } from '@/services/document.service';
import { AppError } from '@/lib/errors';
import { DocumentDetail } from '@/features/document/components/document-detail';

export default async function DocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const { id } = await params;

  let document;
  try {
    document = await documentService.getDocument(id, session.user.id);
  } catch (error) {
    if (error instanceof AppError && error.statusCode === 404) {
      notFound();
    }
    throw error;
  }

  return (
    <main className="flex flex-1 flex-col items-center gap-6 p-8">
      <DocumentDetail
        document={{
          ...document,
          createdAt: document.createdAt.toISOString(),
          updatedAt: document.updatedAt.toISOString(),
        }}
      />
    </main>
  );
}
