import {
  DataTypes,
  Model,
  type ModelStatic,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
} from 'sequelize';
import { sequelize } from '@/lib/db/sequelize';

export class Document extends Model<InferAttributes<Document>, InferCreationAttributes<Document>> {
  declare id: CreationOptional<string>;
  declare title: string;
  declare content: Record<string, unknown>;
  declare ownerId: string;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;

  static associate(models: Record<string, ModelStatic<Model>>) {
    Document.belongsTo(models.User, { as: 'owner', foreignKey: 'ownerId' });
    Document.hasMany(models.Collaborator, { as: 'collaborators', foreignKey: 'documentId' });
    Document.hasMany(models.Version, { as: 'versions', foreignKey: 'documentId' });
  }
}

Document.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Untitled Document',
    },
    content: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    ownerId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'owner_id',
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
    modelName: 'Document',
    tableName: 'documents',
  },
);
