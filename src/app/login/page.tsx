import Link from 'next/link';
import { LoginForm } from '@/features/auth/components/login-form';

export default function LoginPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Sign in</h1>
      <LoginForm />
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="font-medium text-slate-900 underline dark:text-slate-100">
          Sign up
        </Link>
      </p>
    </main>
  );
}
