'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SignOutButton } from '@/features/auth/components/sign-out-button';
import { ROLES } from '@/constants/roles';
import { addCollaboratorSchema, type AddCollaboratorInput } from '@/validators/document.validator';

interface SidebarUser {
  name: string;
  email: string;
  role: string;
}

interface SidebarDocument {
  id: string;
  title: string;
}

function initials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || '?'
  );
}

function DocumentNavSection({
  label,
  documents,
  activeId,
  emptyLabel,
}: {
  label: string;
  documents: SidebarDocument[];
  activeId: string | null;
  emptyLabel: string;
}) {
  return (
    <div>
      <p className="px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      {documents.length === 0 ? (
        <p className="px-3 py-1.5 text-sm text-slate-400">{emptyLabel}</p>
      ) : (
        <ul className="mt-1 flex flex-col gap-0.5">
          {documents.map((doc) => (
            <li key={doc.id}>
              <Link
                href={`/documents/${doc.id}`}
                className={`block truncate rounded-md px-3 py-1.5 text-sm ${
                  doc.id === activeId ? 'bg-slate-100 font-medium text-slate-900' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {doc.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Reachable without scrolling past the editor — the full collaborator list
// with role/remove controls still lives on the document page itself.
function QuickInvite({ documentId }: { documentId: string }) {
  const router = useRouter();
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
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
    setMessage(null);
    const res = await fetch(`/api/documents/${documentId}/collaborators`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    const body = await res.json();

    if (!body.success) {
      setMessage({ text: body.message, isError: true });
      return;
    }

    setMessage({ text: `Invited ${values.email}`, isError: false });
    reset({ email: '', role: ROLES.VIEWER });
    router.refresh();
  }

  return (
    <div className="rounded-md border border-slate-200 p-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Invite by email</p>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-1.5" noValidate>
        <input
          type="email"
          placeholder="email@example.com"
          aria-invalid={Boolean(errors.email)}
          className="rounded-md border border-slate-300 px-2 py-1.5 text-xs outline-none focus:ring-2 focus:ring-slate-400"
          {...register('email')}
        />
        {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
        <div className="flex gap-1.5">
          <select {...register('role')} className="flex-1 rounded-md border border-slate-300 px-1.5 py-1 text-xs">
            <option value={ROLES.EDITOR}>editor</option>
            <option value={ROLES.VIEWER}>viewer</option>
          </select>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-slate-900 px-2.5 py-1 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            Invite
          </button>
        </div>
        {message && <p className={`text-xs ${message.isError ? 'text-red-600' : 'text-slate-500'}`}>{message.text}</p>}
      </form>
    </div>
  );
}

export function Sidebar({
  user,
  ownedDocuments,
  sharedDocuments,
}: {
  user: SidebarUser;
  ownedDocuments: SidebarDocument[];
  sharedDocuments: SidebarDocument[];
}) {
  const pathname = usePathname();
  const activeId = pathname?.startsWith('/documents/') ? pathname.split('/')[2] : null;
  const ownsActiveDocument = activeId !== null && ownedDocuments.some((doc) => doc.id === activeId);

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-6 py-5">
        <Link href="/dashboard" className="text-lg font-semibold text-slate-900">
          House of EduTech
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-4 overflow-y-auto px-3 py-4">
        <Link
          href="/dashboard"
          className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          Dashboard
        </Link>

        {user.role === ROLES.OWNER && (
          <Link
            href="/users"
            className="-mt-3 flex items-center rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Manage Users
          </Link>
        )}

        <DocumentNavSection
          label="Documents"
          documents={ownedDocuments}
          activeId={activeId}
          emptyLabel="No documents yet"
        />

        <DocumentNavSection
          label="Collaborators"
          documents={sharedDocuments}
          activeId={activeId}
          emptyLabel="Nothing shared with you"
        />

        {ownsActiveDocument && activeId && <QuickInvite documentId={activeId} />}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-medium text-white">
            {initials(user.name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-900">{user.name}</p>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium capitalize text-slate-600">
            {user.role}
          </span>
          <SignOutButton />
        </div>
      </div>
    </aside>
  );
}
