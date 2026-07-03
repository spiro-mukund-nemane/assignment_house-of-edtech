import { User } from '@/models/user';
import type { InferCreationAttributes } from 'sequelize';

type NewUser = Pick<InferCreationAttributes<User>, 'name' | 'email' | 'passwordHash' | 'role'>;

export const userRepository = {
  findByEmail(email: string) {
    return User.findOne({ where: { email } });
  },

  findById(id: string) {
    return User.findByPk(id);
  },

  create(attributes: NewUser) {
    return User.create(attributes);
  },
};
