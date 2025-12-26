module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS pgcrypto');

    await queryInterface.createTable('pages', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
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
      parent_page_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'pages',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      title: {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: 'Untitled',
      },
      content: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: { blocks: [] },
      },
      icon: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      cover_image: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      is_archived: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      position: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      created_by: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      last_edited_by: {
        type: Sequelize.UUID,
        allowNull: false,
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

    // Create indexes for performance
    await queryInterface.addIndex('pages', ['workspace_id'], {
      name: 'idx_pages_workspace',
    });

    await queryInterface.addIndex('pages', ['parent_page_id'], {
      name: 'idx_pages_parent',
    });

    await queryInterface.addIndex('pages', ['created_by'], {
      name: 'idx_pages_created_by',
    });

    await queryInterface.addIndex('pages', ['workspace_id', 'parent_page_id', 'position'], {
      name: 'idx_pages_position',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('pages');
  },
};

