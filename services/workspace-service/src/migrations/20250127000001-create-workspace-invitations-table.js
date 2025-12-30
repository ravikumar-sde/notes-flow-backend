module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS pgcrypto');

    await queryInterface.createTable('workspace_invitations', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      workspace_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'workspaces',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      invite_code: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      role: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'member',
      },
      created_by: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      max_uses: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      uses_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('now()'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('now()'),
      },
    });

    // Create indexes
    await queryInterface.addIndex('workspace_invitations', ['workspace_id'], {
      name: 'idx_workspace_invitations_workspace',
    });

    await queryInterface.addIndex('workspace_invitations', ['invite_code'], {
      name: 'idx_workspace_invitations_code',
      unique: true,
    });

    await queryInterface.addIndex('workspace_invitations', ['created_by'], {
      name: 'idx_workspace_invitations_creator',
    });

    // Create table for tracking invitation acceptances
    await queryInterface.createTable('workspace_invitation_acceptances', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      invitation_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'workspace_invitations',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      accepted_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('now()'),
      },
    });

    await queryInterface.addIndex('workspace_invitation_acceptances', ['invitation_id'], {
      name: 'idx_invitation_acceptances_invitation',
    });

    await queryInterface.addIndex('workspace_invitation_acceptances', ['user_id'], {
      name: 'idx_invitation_acceptances_user',
    });

    // Unique constraint: user can only accept an invitation once
    await queryInterface.addIndex('workspace_invitation_acceptances', ['invitation_id', 'user_id'], {
      name: 'idx_invitation_acceptances_unique',
      unique: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('workspace_invitation_acceptances');
    await queryInterface.dropTable('workspace_invitations');
  },
};

