import { ModelStatic, Model } from 'sequelize';
import { sequelize } from '@/lib/db/sequelize';
import { User } from './user';
import { Document } from './document';
import { Collaborator } from './collaborator';
import { Version } from './version';

// Explicit registry rather than a filesystem auto-loader: Next.js bundles this
// module, and a dynamic require(path) can't be statically analyzed by
// webpack/Turbopack. Each feature milestone adds its model here by hand.
//
// Repositories must import model classes from this file (not from
// './user', './document', etc. directly) — associate() below is what wires
// up belongsTo/hasMany, and it only runs once, when this module loads.
// Importing a model file directly skips that wiring and include: [...]
// queries fail at runtime with "X is not associated to Y".
interface AssociableModel extends ModelStatic<Model> {
  associate?: (models: Record<string, ModelStatic<Model>>) => void;
}

const models: Record<string, AssociableModel> = {
  User,
  Document,
  Collaborator,
  Version,
};

Object.values(models).forEach((model) => {
  model.associate?.(models);
});

export { sequelize, User, Document, Collaborator, Version };
export default models;
