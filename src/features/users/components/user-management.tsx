'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ROLES, type Role } from '@/constants/roles';
import { createUserSchema, type CreateUserInput } from '@/validators/user.validator';
import type { PublicUser } from '@/types/user';

export function UserManagement({ users: initialUsers, currentUserId }: { users: PublicUser[]; currentUserId: string }) {
  const [users, setUsers] = useState(initialUsers);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { role: ROLES.EDITOR },
  });

  async function onCreate(values: CreateUserInput) {
    setError(null);
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    const body = await res.json();

    if (!body.success) {
      setError(body.message);
      return;
    }

    setUsers((prev) => [...prev, body.data]);
    reset({ name: '', email: '', password: '', role: ROLES.EDITOR });
  }

  async function handleRoleChange(userId: string, role: Role) {
    setError(null);
    const res = await fetch(`/api/users/${userId}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    const body = await res.json();

    if (!body.success) {
      setError(body.message);
      return;
    }

    setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, role } : user)));
  }

  return (
    <div className="flex w-full max-w-3xl flex-col gap-6">
      <h1 className="text-2xl font-semibold text-slate-900">Manage users</h1>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <ul className="flex flex-col gap-2 rounded-md border border-slate-200 p-4">
        {users.map((user) => (
          <li key={user.id} className="flex items-center justify-between text-sm">
            <span className="text-slate-700">
              {user.name} ({user.email})
            </span>
            {user.id === currentUserId ? (
              <span className="capitalize text-slate-500">{user.role} (you)</span>
            ) : (
              <select
                value={user.role}
                onChange={(e) => handleRoleChange(user.id, e.target.value as Role)}
                className="rounded-md border border-slate-300 px-2 py-1 text-sm"
              >
                <option value={ROLES.OWNER}>owner</option>
                <option value={ROLES.EDITOR}>editor</option>
                <option value={ROLES.VIEWER}>viewer</option>
              </select>
            )}
          </li>
        ))}
      </ul>

      <form
        onSubmit={handleSubmit(onCreate)}
        className="flex flex-col gap-3 rounded-md border border-slate-200 p-4"
        noValidate
      >
        <h2 className="font-medium text-slate-900">Create user</h2>
        <Input label="Name" error={errors.name?.message} {...register('name')} />
        <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
        <Input label="Password" type="password" error={errors.password?.message} {...register('password')} />
        <select {...register('role')} className="rounded-md border border-slate-300 px-2 py-2 text-sm">
          <option value={ROLES.OWNER}>owner</option>
          <option value={ROLES.EDITOR}>editor</option>
          <option value={ROLES.VIEWER}>viewer</option>
        </select>
        <Button type="submit" isLoading={isSubmitting}>
          Create user
        </Button>
      </form>
    </div>
  );
}
