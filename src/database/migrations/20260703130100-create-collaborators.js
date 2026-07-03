'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('collaborators', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      document_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'documents', key: 'id' },
        onDelete: 'CASCADE',
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      role: {
        type: Sequelize.ENUM('owner', 'editor', 'viewer'),
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });

    await queryInterface.addIndex('collaborators', ['document_id', 'user_id'], {
      unique: true,
      name: 'collaborators_document_id_user_id_unique',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('collaborators');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_collaborators_role";');
  },
};
