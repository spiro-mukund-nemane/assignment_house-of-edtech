import type { Transaction } from 'sequelize';
import { Collaborator, User } from '@/models';
import type { Role } from '@/constants/roles';

export const collaboratorRepository = {
  findByDocumentAndUser(documentId: string, userId: string) {
    return Collaborator.findOne({ where: { documentId, userId } });
  },

  findById(id: string) {
    return Collaborator.findByPk(id);
  },

  listForDocument(documentId: string) {
    return Collaborator.findAll({
      where: { documentId },
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'ASC']],
    });
  },

  create(
    attributes: { documentId: string; userId: string; role: Role },
    options?: { transaction?: Transaction },
  ) {
    return Collaborator.create(attributes, options);
  },

  updateRole(id: string, role: Role) {
    return Collaborator.update({ role }, { where: { id } });
  },

  delete(id: string) {
    return Collaborator.destroy({ where: { id } });
  },
};
