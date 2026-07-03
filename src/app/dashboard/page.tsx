import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import { documentService } from '@/services/document.service';
import { DocumentList } from '@/features/document/components/document-list';

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const documents = await documentService.listDocumentsForUser(session.user.id);

  return (
    <main className="flex flex-1 flex-col items-center gap-6 p-8">
      <DocumentList documents={documents.map((doc) => ({ ...doc, updatedAt: doc.updatedAt.toISOString() }))} />
    </main>
  );
}
