import Link from 'next/link';
import { SignupForm } from '@/features/auth/components/signup-form';

export default function SignupPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Create an account</h1>
      <SignupForm />
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-slate-900 underline dark:text-slate-100">
          Sign in
        </Link>
      </p>
    </main>
  );
}
