const db = require('../db');

function createWorkspaceRepository({ dbClient = db } = {}) {
  return {
    async isSlugTaken(slug) {
      const result = await dbClient.query(
        'SELECT id FROM workspaces WHERE slug = $1',
        [slug]
      );
      return result.rowCount > 0;
    },

    async createWorkspace({ name, slug, ownerId }) {
      const result = await dbClient.query(
        'INSERT INTO workspaces (name, slug, owner_id) VALUES ($1, $2, $3) RETURNING id, name, slug, owner_id, created_at',
        [name, slug, ownerId]
      );
      return result.rows[0];
    },

    async addOwnerMembership({ workspaceId, userId }) {
      await dbClient.query(
        'INSERT INTO workspace_memberships (workspace_id, user_id, role) VALUES ($1, $2, $3)',
        [workspaceId, userId, 'owner']
      );
    },

    async listWorkspacesForUser(userId) {
      const result = await dbClient.query(
        `SELECT w.id, w.name, w.slug, w.owner_id, w.created_at, m.role
         FROM workspaces w
         JOIN workspace_memberships m ON m.workspace_id = w.id
         WHERE m.user_id = $1
         ORDER BY w.created_at ASC`,
        [userId]
      );
      return result.rows;
    },
  };
}

module.exports = { createWorkspaceRepository };

