function createWorkspaceMembershipQueries(db) {
  return {
    checkUserWorkspaceAccess,
    getWorkspaceIdByPageId,
  };

  async function checkUserWorkspaceAccess(workspaceId, userId) {
    const result = await db.query(
      `SELECT role FROM workspace_memberships
       WHERE workspace_id = $1 AND user_id = $2`,
      [workspaceId, userId]
    );
    return result.rows[0] || null;
  }

  async function getWorkspaceIdByPageId(pageId) {
    const result = await db.query(
      `SELECT workspace_id FROM pages WHERE id = $1`,
      [pageId]
    );
    return result.rows[0] || null;
  }
}

module.exports = createWorkspaceMembershipQueries;

