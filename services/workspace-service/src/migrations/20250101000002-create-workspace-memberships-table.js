module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('workspace_memberships', {
      workspace_id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'workspaces',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
      },
      role: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('now()'),
      },
    });

    await queryInterface.addIndex('workspace_memberships', ['user_id'], {
      name: 'idx_workspace_memberships_user',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('workspace_memberships');
  },
};

