module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS pgcrypto');

    await queryInterface.createTable('workspaces', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
      },
      name: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      slug: {
        type: Sequelize.TEXT,
        allowNull: false,
        unique: true,
      },
      owner_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('now()'),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('workspaces');
  },
};

