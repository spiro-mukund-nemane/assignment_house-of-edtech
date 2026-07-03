import {
  DataTypes,
  Model,
  type ModelStatic,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
} from 'sequelize';
import { sequelize } from '@/lib/db/sequelize';
import { ROLES, type Role } from '@/constants/roles';

// A row per (document, user) pair recording that user's permission level on
// that document — including the owner, so every permission check (including
// the document's creator) goes through this single table.
export class Collaborator extends Model<InferAttributes<Collaborator>, InferCreationAttributes<Collaborator>> {
  declare id: CreationOptional<string>;
  declare documentId: string;
  declare userId: string;
  declare role: Role;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;

  static associate(models: Record<string, ModelStatic<Model>>) {
    Collaborator.belongsTo(models.Document, { as: 'document', foreignKey: 'documentId' });
    Collaborator.belongsTo(models.User, { as: 'user', foreignKey: 'userId' });
  }
}

Collaborator.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    documentId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'document_id',
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
    },
    role: {
      type: DataTypes.ENUM(...Object.values(ROLES)),
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updated_at',
    },
  },
  {
    sequelize,
    modelName: 'Collaborator',
    tableName: 'collaborators',
  },
);
