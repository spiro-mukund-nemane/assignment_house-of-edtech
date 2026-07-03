import { z } from 'zod';
import { ROLES } from '@/constants/roles';

export const createDocumentSchema = z.object({
  title: z.string().trim().min(1).max(255).default('Untitled Document'),
});

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;

export const updateDocumentSchema = z
  .object({
    title: z.string().trim().min(1, 'Title cannot be empty').max(255).optional(),
    content: z.record(z.string(), z.unknown()).optional(),
  })
  .refine((data) => data.title !== undefined || data.content !== undefined, {
    message: 'Provide a title or content to update',
  });

export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;

// Owner is assigned automatically on document creation, never through an invite.
export const addCollaboratorSchema = z.object({
  email: z.email('Enter a valid email address'),
  role: z.enum([ROLES.EDITOR, ROLES.VIEWER] as const),
});

export type AddCollaboratorInput = z.infer<typeof addCollaboratorSchema>;

export const updateCollaboratorRoleSchema = z.object({
  role: z.enum([ROLES.EDITOR, ROLES.VIEWER] as const),
});

export type UpdateCollaboratorRoleInput = z.infer<typeof updateCollaboratorRoleSchema>;
