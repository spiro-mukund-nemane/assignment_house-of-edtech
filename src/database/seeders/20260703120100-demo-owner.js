'use strict';

const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');

const DEMO_EMAIL = 'owner@example.com';

module.exports = {
  async up(queryInterface) {
    const passwordHash = await bcrypt.hash('password123', 12);

    await queryInterface.bulkInsert('users', [
      {
        id: randomUUID(),
        name: 'Demo Owner',
        email: DEMO_EMAIL,
        password_hash: passwordHash,
        role: 'owner',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', { email: DEMO_EMAIL });
  },
};
