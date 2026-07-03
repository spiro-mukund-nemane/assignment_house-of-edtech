import { AppError } from '@/lib/errors';
import { collaboratorRepository } from '@/repositories/collaborator.repository';
import { userRepository } from '@/repositories/user.repository';
import { ROLES, type Role } from '@/constants/roles';
import type { AddCollaboratorInput, UpdateCollaboratorRoleInput } from '@/validators/document.validator';
import type { CollaboratorSummary } from '@/types/document';

// Every document permission check funnels through here: no record means the
// user has no access at all (404, so we don't leak whether the doc exists),
// a record with the wrong role means 403.
export async function assertDocumentAccess(
  documentId: string,
  userId: string,
  allowedRoles: Role[],
): Promise<Role> {
  const collaborator = await collaboratorRepository.findByDocumentAndUser(documentId, userId);
  if (!collaborator) {
    throw new AppError(404, 'Document not found');
  }
  if (!allowedRoles.includes(collaborator.role)) {
    throw new AppError(403, 'You do not have permission to perform this action');
  }
  return collaborator.role;
}

export const collaboratorService = {
  async addCollaborator(
    documentId: string,
    requesterId: string,
    input: AddCollaboratorInput,
  ): Promise<CollaboratorSummary> {
    await assertDocumentAccess(documentId, requesterId, [ROLES.OWNER]);

    const user = await userRepository.findByEmail(input.email);
    if (!user) {
      throw new AppError(404, 'No user found with that email');
    }

    const existing = await collaboratorRepository.findByDocumentAndUser(documentId, user.id);
    if (existing) {
      throw new AppError(409, 'This user already has access to the document');
    }

    const collaborator = await collaboratorRepository.create({
      documentId,
      userId: user.id,
      role: input.role,
    });

    return { id: collaborator.id, userId: user.id, name: user.name, email: user.email, role: collaborator.role };
  },

  async updateCollaboratorRole(
    documentId: string,
    collaboratorId: string,
    requesterId: string,
    input: UpdateCollaboratorRoleInput,
  ) {
    await assertDocumentAccess(documentId, requesterId, [ROLES.OWNER]);

    const collaborator = await collaboratorRepository.findById(collaboratorId);
    if (!collaborator || collaborator.documentId !== documentId) {
      throw new AppError(404, 'Collaborator not found');
    }
    if (collaborator.role === ROLES.OWNER) {
      throw new AppError(400, "The document owner's role cannot be changed");
    }

    await collaboratorRepository.updateRole(collaboratorId, input.role);
  },

  async removeCollaborator(documentId: string, collaboratorId: string, requesterId: string) {
    await assertDocumentAccess(documentId, requesterId, [ROLES.OWNER]);

    const collaborator = await collaboratorRepository.findById(collaboratorId);
    if (!collaborator || collaborator.documentId !== documentId) {
      throw new AppError(404, 'Collaborator not found');
    }
    if (collaborator.role === ROLES.OWNER) {
      throw new AppError(400, 'The document owner cannot be removed');
    }

    await collaboratorRepository.delete(collaboratorId);
  },
};
