import { sequelize } from '@/lib/db/sequelize';
import { AppError } from '@/lib/errors';
import { documentRepository } from '@/repositories/document.repository';
import { collaboratorRepository } from '@/repositories/collaborator.repository';
import { assertDocumentAccess } from '@/services/collaborator.service';
import { ROLES } from '@/constants/roles';
import type { CreateDocumentInput, UpdateDocumentInput } from '@/validators/document.validator';
import type { DocumentSummary, DocumentDetail } from '@/types/document';

const EMPTY_CONTENT = { type: 'doc', content: [] };

export const documentService = {
  async createDocument(userId: string, input: CreateDocumentInput): Promise<DocumentDetail> {
    const document = await sequelize.transaction(async (transaction) => {
      const doc = await documentRepository.create(
        { title: input.title, content: EMPTY_CONTENT, ownerId: userId },
        { transaction },
      );
      await collaboratorRepository.create({ documentId: doc.id, userId, role: ROLES.OWNER }, { transaction });
      return doc;
    });

    return {
      id: document.id,
      title: document.title,
      content: document.content,
      ownerId: document.ownerId,
      role: ROLES.OWNER,
      collaborators: [],
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    };
  },

  async listDocumentsForUser(userId: string): Promise<DocumentSummary[]> {
    const collaborations = await documentRepository.findAllForUser(userId);

    return collaborations
      .filter((collaboration) => collaboration.document != null)
      .map((collaboration) => ({
        id: collaboration.document!.id,
        title: collaboration.document!.title,
        role: collaboration.role,
        updatedAt: collaboration.document!.updatedAt,
      }));
  },

  async getDocument(documentId: string, userId: string): Promise<DocumentDetail> {
    const role = await assertDocumentAccess(documentId, userId, [ROLES.OWNER, ROLES.EDITOR, ROLES.VIEWER]);

    const document = await documentRepository.findById(documentId);
    if (!document) {
      throw new AppError(404, 'Document not found');
    }

    const collaborators = await collaboratorRepository.listForDocument(documentId);

    return {
      id: document.id,
      title: document.title,
      content: document.content,
      ownerId: document.ownerId,
      role,
      collaborators: collaborators.map((collaborator) => ({
        id: collaborator.id,
        userId: collaborator.userId,
        name: collaborator.user!.name,
        email: collaborator.user!.email,
        role: collaborator.role,
      })),
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    };
  },

  async updateDocument(documentId: string, userId: string, input: UpdateDocumentInput): Promise<DocumentDetail> {
    await assertDocumentAccess(documentId, userId, [ROLES.OWNER, ROLES.EDITOR]);
    await documentRepository.update(documentId, input);
    return documentService.getDocument(documentId, userId);
  },

  async deleteDocument(documentId: string, userId: string): Promise<void> {
    await assertDocumentAccess(documentId, userId, [ROLES.OWNER]);
    await documentRepository.delete(documentId);
  },
};
