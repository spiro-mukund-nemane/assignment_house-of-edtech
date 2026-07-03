import {
  DataTypes,
  Model,
  type ModelStatic,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
} from 'sequelize';
import { sequelize } from '@/lib/db/sequelize';

// Immutable snapshots of a document's content. Restoring an old version
// creates a new row here rather than mutating or deleting anything.
export class Version extends Model<InferAttributes<Version>, InferCreationAttributes<Version>> {
  declare id: CreationOptional<string>;
  declare documentId: string;
  declare content: Record<string, unknown>;
  declare createdById: CreationOptional<string | null>;
  declare readonly createdAt: CreationOptional<Date>;

  static associate(models: Record<string, ModelStatic<Model>>) {
    Version.belongsTo(models.Document, { as: 'document', foreignKey: 'documentId' });
    Version.belongsTo(models.User, { as: 'createdBy', foreignKey: 'createdById' });
  }
}

Version.init(
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
    content: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    createdById: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'created_by_id',
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
    },
  },
  {
    sequelize,
    modelName: 'Version',
    tableName: 'versions',
    updatedAt: false,
  },
);
