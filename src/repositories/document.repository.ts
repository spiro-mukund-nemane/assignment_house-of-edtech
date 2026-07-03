import type { InferCreationAttributes, Transaction } from 'sequelize';
import { Document, Collaborator } from '@/models';

type NewDocument = Pick<InferCreationAttributes<Document>, 'title' | 'content' | 'ownerId'>;
type DocumentUpdate = Partial<Pick<InferCreationAttributes<Document>, 'title' | 'content'>>;

export const documentRepository = {
  findById(id: string) {
    return Document.findByPk(id);
  },

  create(attributes: NewDocument, options?: { transaction?: Transaction }) {
    return Document.create(attributes, options);
  },

  update(id: string, attributes: DocumentUpdate) {
    return Document.update(attributes, { where: { id } });
  },

  delete(id: string) {
    return Document.destroy({ where: { id } });
  },

  // One row per document the user collaborates on (including ones they own),
  // with the document eager-loaded so the caller gets title/updatedAt in one query.
  findAllForUser(userId: string) {
    return Collaborator.findAll({
      where: { userId },
      include: [{ model: Document, as: 'document' }],
      order: [[{ model: Document, as: 'document' }, 'updatedAt', 'DESC']],
    });
  },
};
