import { User } from '@/models';
import type { InferCreationAttributes } from 'sequelize';
import type { Role } from '@/constants/roles';

type NewUser = Pick<InferCreationAttributes<User>, 'name' | 'email' | 'passwordHash' | 'role'>;

export const userRepository = {
  findByEmail(email: string) {
    return User.findOne({ where: { email } });
  },

  findById(id: string) {
    return User.findByPk(id);
  },

  findAll() {
    return User.findAll({ order: [['createdAt', 'ASC']] });
  },

  create(attributes: NewUser) {
    return User.create(attributes);
  },

  updateRole(id: string, role: Role) {
    return User.update({ role }, { where: { id } });
  },
};
