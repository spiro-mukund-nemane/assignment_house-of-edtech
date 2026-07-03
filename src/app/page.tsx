import Link from 'next/link';
import { auth } from '@/lib/auth/auth';
import { SignOutButton } from '@/features/auth/components/sign-out-button';

export default async function Home() {
  const session = await auth();

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">House of EduTech</h1>
      <p className="text-slate-600 dark:text-slate-400">Local-first collaborative document editor</p>

      {session?.user ? (
        <div className="flex flex-col items-center gap-3">
          <p className="text-slate-700 dark:text-slate-300">
            Signed in as <span className="font-medium">{session.user.email}</span> ({session.user.role})
          </p>
          <SignOutButton />
        </div>
      ) : (
        <div className="flex gap-4">
          <Link
            href="/login"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            Sign up
          </Link>
        </div>
      )}
    </main>
  );
}
