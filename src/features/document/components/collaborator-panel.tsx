'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ROLES } from '@/constants/roles';
import { addCollaboratorSchema, type AddCollaboratorInput } from '@/validators/document.validator';
import type { CollaboratorSummary } from '@/types/document';

type EditableRole = typeof ROLES.EDITOR | typeof ROLES.VIEWER;

export function CollaboratorPanel({
  documentId,
  initialCollaborators,
}: {
  documentId: string;
  initialCollaborators: CollaboratorSummary[];
}) {
  const [collaborators, setCollaborators] = useState(initialCollaborators);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddCollaboratorInput>({
    resolver: zodResolver(addCollaboratorSchema),
    defaultValues: { role: ROLES.VIEWER },
  });

  async function onSubmit(values: AddCollaboratorInput) {
    setError(null);
    const res = await fetch(`/api/documents/${documentId}/collaborators`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    const body = await res.json();

    if (!body.success) {
      setError(body.message);
      return;
    }

    setCollaborators((prev) => [...prev, body.data]);
    reset({ email: '', role: ROLES.VIEWER });
  }

  async function handleRoleChange(collaboratorId: string, role: EditableRole) {
    setError(null);
    const res = await fetch(`/api/documents/${documentId}/collaborators/${collaboratorId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    const body = await res.json();

    if (!body.success) {
      setError(body.message);
      return;
    }

    setCollaborators((prev) => prev.map((c) => (c.id === collaboratorId ? { ...c, role } : c)));
  }

  async function handleRemove(collaboratorId: string) {
    setError(null);
    const res = await fetch(`/api/documents/${documentId}/collaborators/${collaboratorId}`, { method: 'DELETE' });
    const body = await res.json();

    if (!body.success) {
      setError(body.message);
      return;
    }

    setCollaborators((prev) => prev.filter((c) => c.id !== collaboratorId));
  }

  return (
    <div className="flex flex-col gap-4 rounded-md border border-slate-200 p-4">
      <h2 className="font-medium text-slate-900">Collaborators</h2>

      <ul className="flex flex-col gap-2">
        {collaborators.map((collaborator) => (
          <li key={collaborator.id} className="flex items-center justify-between text-sm">
            <span className="text-slate-700">
              {collaborator.name} ({collaborator.email})
            </span>
            {collaborator.role === ROLES.OWNER ? (
              <span className="text-slate-500">owner</span>
            ) : (
              <div className="flex items-center gap-2">
                <select
                  value={collaborator.role}
                  onChange={(e) => handleRoleChange(collaborator.id, e.target.value as EditableRole)}
                  className="rounded-md border border-slate-300 px-2 py-1 text-sm"
                >
                  <option value={ROLES.EDITOR}>editor</option>
                  <option value={ROLES.VIEWER}>viewer</option>
                </select>
                <button
                  type="button"
                  onClick={() => handleRemove(collaborator.id)}
                  className="text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>

      <form onSubmit={handleSubmit(onSubmit)} className="flex items-end gap-2" noValidate>
        <div className="flex-1">
          <Input label="Invite by email" type="email" error={errors.email?.message} {...register('email')} />
        </div>
        <select {...register('role')} className="rounded-md border border-slate-300 px-2 py-2 text-sm">
          <option value={ROLES.EDITOR}>editor</option>
          <option value={ROLES.VIEWER}>viewer</option>
        </select>
        <Button type="submit" isLoading={isSubmitting}>
          Invite
        </Button>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
