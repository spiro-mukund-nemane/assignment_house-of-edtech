import { redirect, notFound } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import { userService } from '@/services/user.service';
import { ROLES } from '@/constants/roles';
import { UserManagement } from '@/features/users/components/user-management';

export default async function UsersPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }
  if (session.user.role !== ROLES.OWNER) {
    notFound();
  }

  const users = await userService.listUsers();

  return (
    <main className="flex flex-1 flex-col items-center gap-6 p-8">
      <UserManagement users={users} currentUserId={session.user.id} />
    </main>
  );
}
