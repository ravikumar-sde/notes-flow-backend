function createMembershipQueries(db) {
  return {
    createMembership,
    addMember,
    getMembership,
    getMembershipWithWorkspace,
    getWorkspaceMembers,
  };

  async function createMembership(workspaceId, userId, role) {
    await db.query(
      'INSERT INTO workspace_memberships (workspace_id, user_id, role) VALUES ($1, $2, $3)',
      [workspaceId, userId, role]
    );
  }

  async function addMember(workspaceId, userId, role) {
    const result = await db.query(
      `INSERT INTO workspace_memberships (workspace_id, user_id, role)
       VALUES ($1, $2, $3)
       RETURNING workspace_id, user_id, role, created_at`,
      [workspaceId, userId, role]
    );
    return result.rows[0];
  }

  async function getMembership(workspaceId, userId) {
    const result = await db.query(
      `SELECT role
       FROM workspace_memberships
       WHERE workspace_id = $1 AND user_id = $2`,
      [workspaceId, userId]
    );
    return result.rows[0] || null;
  }

  async function getMembershipWithWorkspace(workspaceId, userId) {
    const result = await db.query(
      `SELECT m.role, w.owner_id, w.slug
       FROM workspace_memberships m
       JOIN workspaces w ON w.id = m.workspace_id
       WHERE m.workspace_id = $1 AND m.user_id = $2`,
      [workspaceId, userId]
    );
    return result.rows[0] || null;
  }

  async function getWorkspaceMembers(workspaceId) {
    const result = await db.query(
      'SELECT user_id FROM workspace_memberships WHERE workspace_id = $1',
      [workspaceId]
    );
    return result.rows;
  }
}

module.exports = createMembershipQueries;

