function createWorkspaceQueries(db) {
  return {
    checkSlugExists,
    checkSlugExistsExcludingId,
    createWorkspace,
    getWorkspaceById,
    getWorkspaceWithRole,
    getWorkspacesForUser,
    getWorkspaceOwner,
    updateWorkspace,
    deleteWorkspace,
  };
  
  async function checkSlugExists(slug) {
    const result = await db.query(
      'SELECT id FROM workspaces WHERE slug = $1',
      [slug]
    );
    return result.rowCount > 0;
  }

  async function checkSlugExistsExcludingId(slug, workspaceId) {
    const result = await db.query(
      'SELECT id FROM workspaces WHERE slug = $1 AND id != $2',
      [slug, workspaceId]
    );
    return result.rowCount > 0;
  }

  async function createWorkspace(name, slug, ownerId) {
    const result = await db.query(
      'INSERT INTO workspaces (name, slug, owner_id) VALUES ($1, $2, $3) RETURNING id, name, slug, owner_id, created_at',
      [name, slug, ownerId]
    );
    return result.rows[0];
  }

  async function getWorkspaceById(workspaceId) {
    const result = await db.query(
      'SELECT name FROM workspaces WHERE id = $1',
      [workspaceId]
    );
    return result.rows[0] || null;
  }

  async function getWorkspaceWithRole(workspaceId, userId) {
    const result = await db.query(
      `SELECT w.id, w.name, w.slug, w.owner_id, w.created_at, m.role
       FROM workspaces w
       JOIN workspace_memberships m ON m.workspace_id = w.id
       WHERE w.id = $1 AND m.user_id = $2`,
      [workspaceId, userId]
    );
    return result.rows[0] || null;
  }

  async function getWorkspacesForUser(userId) {
    const result = await db.query(
      `SELECT w.id, w.name, w.slug, w.owner_id, w.created_at, m.role
       FROM workspaces w
       JOIN workspace_memberships m ON m.workspace_id = w.id
       WHERE m.user_id = $1
       ORDER BY w.created_at ASC`,
      [userId]
    );
    return result.rows;
  }

  async function getWorkspaceOwner(workspaceId) {
    const result = await db.query(
      'SELECT owner_id FROM workspaces WHERE id = $1',
      [workspaceId]
    );
    return result.rows[0] || null;
  }

  async function updateWorkspace(workspaceId, name, slug) {
    const result = await db.query(
      'UPDATE workspaces SET name = $1, slug = $2 WHERE id = $3 RETURNING id, name, slug, owner_id, created_at',
      [name, slug, workspaceId]
    );
    return result.rows[0];
  }

  async function deleteWorkspace(workspaceId) {
    await db.query('DELETE FROM workspaces WHERE id = $1', [workspaceId]);
  }
}

module.exports = createWorkspaceQueries;

