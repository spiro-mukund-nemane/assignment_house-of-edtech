import type { Role } from '@/constants/roles';

export interface DocumentSummary {
  id: string;
  title: string;
  role: Role;
  updatedAt: Date;
}

export interface CollaboratorSummary {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: Role;
}

export interface DocumentDetail {
  id: string;
  title: string;
  content: Record<string, unknown>;
  ownerId: string;
  role: Role;
  collaborators: CollaboratorSummary[];
  createdAt: Date;
  updatedAt: Date;
}
