'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('versions', {
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
      content: {
        type: Sequelize.JSONB,
        allowNull: false,
      },
      created_by_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'SET NULL',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });

    await queryInterface.addIndex('versions', ['document_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('versions');
  },
};
