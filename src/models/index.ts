import { ModelStatic, Model } from 'sequelize';
import { sequelize } from '@/lib/db/sequelize';
import { User } from './user';

// Explicit registry rather than a filesystem auto-loader: Next.js bundles this
// module, and a dynamic require(path) can't be statically analyzed by
// webpack/Turbopack. Each feature milestone adds its model here by hand.
// Repositories should import model classes (e.g. User) directly for full
// attribute typing — this registry exists for cross-model associate() wiring.
interface AssociableModel extends ModelStatic<Model> {
  associate?: (models: Record<string, ModelStatic<Model>>) => void;
}

const models: Record<string, AssociableModel> = {
  User,
  // Document: DocumentModel(sequelize),
};

Object.values(models).forEach((model) => {
  model.associate?.(models);
});

export { sequelize };
export default models;
