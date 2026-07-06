import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import { documentService } from '@/services/document.service';
import { Sidebar } from '@/components/layout/sidebar';
import { ROLES } from '@/constants/roles';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const documents = await documentService.listDocumentsForUser(session.user.id);
  const ownedDocuments = documents.filter((doc) => doc.role === ROLES.OWNER).map((doc) => ({ id: doc.id, title: doc.title }));
  const sharedDocuments = documents
    .filter((doc) => doc.role !== ROLES.OWNER)
    .map((doc) => ({ id: doc.id, title: doc.title }));

  const displayName = session.user.name ?? session.user.email ?? 'User';

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar
        user={{ name: displayName, email: session.user.email ?? '', role: session.user.role }}
        ownedDocuments={ownedDocuments}
        sharedDocuments={sharedDocuments}
      />
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
