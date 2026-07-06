'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { signupSchema, type SignupInput } from '@/validators/auth.validator';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SignupApiResponse {
  success: boolean;
  message: string;
  errors: Record<string, string[]> | null;
}

export function SignupForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({ resolver: zodResolver(signupSchema) });

  async function onSubmit(values: SignupInput) {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    const body: SignupApiResponse = await res.json();

    if (!body.success) {
      if (body.errors) {
        for (const [field, messages] of Object.entries(body.errors)) {
          setError(field as keyof SignupInput, { message: messages[0] });
        }
      } else {
        setError('email', { message: body.message });
      }
      return;
    }

    await signIn('credentials', { email: values.email, password: values.password, redirect: false });
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex w-full max-w-sm flex-col gap-4" noValidate>
      <Input label="Name" autoComplete="name" error={errors.name?.message} {...register('name')} />
      <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
      <Input
        label="Password"
        type="password"
        autoComplete="new-password"
        error={errors.password?.message}
        {...register('password')}
      />
      <Button type="submit" isLoading={isSubmitting}>
        Create account
      </Button>
    </form>
  );
}
