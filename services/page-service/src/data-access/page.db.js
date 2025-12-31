function createPageQueries(db) {
  return {
    createPage,
    getPageById,
    getPageWithPermissions,
    getWorkspacePages,
    getChildPages,
    updatePage,
    movePage,
    archivePage,
    deletePage,
    getMaxPosition,
  };

  async function createPage(workspaceId, parentPageId, title, content, icon, coverImage, userId) {
    const result = await db.query(
      `INSERT INTO pages (workspace_id, parent_page_id, title, content, icon, cover_image, created_by, last_edited_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, workspace_id, parent_page_id, title, content, icon, cover_image, is_archived, position, created_by, last_edited_by, created_at, updated_at`,
      [workspaceId, parentPageId, title, JSON.stringify(content), icon, coverImage, userId, userId]
    );
    return result.rows[0];
  }

  async function getPageById(pageId) {
    const result = await db.query(
      `SELECT id, workspace_id, parent_page_id, title, content, icon, cover_image, is_archived, position, created_by, last_edited_by, created_at, updated_at
       FROM pages
       WHERE id = $1`,
      [pageId]
    );
    return result.rows[0] || null;
  }

  async function getPageWithPermissions(pageId, userId) {
    const result = await db.query(
      `SELECT p.id, p.workspace_id, p.parent_page_id, p.title, p.content, p.icon, p.cover_image, 
              p.is_archived, p.position, p.created_by, p.last_edited_by, p.created_at, p.updated_at,
              m.role
       FROM pages p
       JOIN workspace_memberships m ON m.workspace_id = p.workspace_id
       WHERE p.id = $1 AND m.user_id = $2`,
      [pageId, userId]
    );
    return result.rows[0] || null;
  }

  async function getWorkspacePages(workspaceId, userId) {
    const result = await db.query(
      `SELECT p.id, p.workspace_id, p.parent_page_id, p.title, p.icon, p.cover_image, 
              p.is_archived, p.position, p.created_by, p.last_edited_by, p.created_at, p.updated_at
       FROM pages p
       JOIN workspace_memberships m ON m.workspace_id = p.workspace_id
       WHERE p.workspace_id = $1 AND m.user_id = $2 AND p.is_archived = false
       ORDER BY p.position ASC, p.created_at ASC`,
      [workspaceId, userId]
    );
    return result.rows;
  }

  async function getChildPages(parentPageId) {
    const result = await db.query(
      `SELECT id, workspace_id, parent_page_id, title, icon, cover_image, 
              is_archived, position, created_by, last_edited_by, created_at, updated_at
       FROM pages
       WHERE parent_page_id = $1 AND is_archived = false
       ORDER BY position ASC, created_at ASC`,
      [parentPageId]
    );
    return result.rows;
  }

  async function updatePage(pageId, updates, userId) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (updates.title !== undefined) {
      fields.push(`title = $${paramIndex++}`);
      values.push(updates.title);
    }
    if (updates.content !== undefined) {
      fields.push(`content = $${paramIndex++}`);
      values.push(JSON.stringify(updates.content));
    }
    if (updates.icon !== undefined) {
      fields.push(`icon = $${paramIndex++}`);
      values.push(updates.icon);
    }
    if (updates.cover_image !== undefined) {
      fields.push(`cover_image = $${paramIndex++}`);
      values.push(updates.cover_image);
    }

    fields.push(`last_edited_by = $${paramIndex++}`);
    values.push(userId);
    fields.push(`updated_at = now()`);

    values.push(pageId);

    const result = await db.query(
      `UPDATE pages SET ${fields.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING id, workspace_id, parent_page_id, title, content, icon, cover_image, is_archived, position, created_by, last_edited_by, created_at, updated_at`,
      values
    );
    return result.rows[0];
  }

  async function movePage(pageId, newParentId, newPosition, userId) {
    const result = await db.query(
      `UPDATE pages 
       SET parent_page_id = $1, position = $2, last_edited_by = $3, updated_at = now()
       WHERE id = $4
       RETURNING id, workspace_id, parent_page_id, title, content, icon, cover_image, is_archived, position, created_by, last_edited_by, created_at, updated_at`,
      [newParentId, newPosition, userId, pageId]
    );
    return result.rows[0];
  }

  async function archivePage(pageId, isArchived, userId) {
    const result = await db.query(
      `UPDATE pages 
       SET is_archived = $1, last_edited_by = $2, updated_at = now()
       WHERE id = $3
       RETURNING id, workspace_id, parent_page_id, title, content, icon, cover_image, is_archived, position, created_by, last_edited_by, created_at, updated_at`,
      [isArchived, userId, pageId]
    );
    return result.rows[0];
  }

  async function deletePage(pageId) {
    await db.query('DELETE FROM pages WHERE id = $1', [pageId]);
  }

  async function getMaxPosition(workspaceId, parentPageId) {
    const result = await db.query(
      `SELECT COALESCE(MAX(position), -1) as max_position
       FROM pages
       WHERE workspace_id = $1 AND parent_page_id IS NOT DISTINCT FROM $2`,
      [workspaceId, parentPageId]
    );
    return result.rows[0].max_position;
  }
}

module.exports = createPageQueries;

