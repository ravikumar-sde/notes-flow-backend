module.exports = function makeCreatePage({ dataAccess, services, businessLogic }) {
    return async function createPage(req, res) {
    const userId = req.headers['x-user-id'];
    const workspaceId = req.params.workspaceId || req.body.workspace_id;
    const { parent_page_id, title, content, icon, cover_image } = req.body || {};

    if (!userId) {
      return res.status(401).json({ message: 'Missing x-user-id header' });
    }

    if (!workspaceId) {
      return res.status(400).json({ message: 'workspace_id is required' });
    }

    try {
      // Check if user has access to the workspace
      const membership = await dataAccess.checkUserWorkspaceAccess(workspaceId, userId);
      if (!membership) {
        return res.status(403).json({ message: 'Access denied to this workspace' });
      }

      // Check if user has permission to create pages (edit permission)
      if (!businessLogic.canEdit(membership.role)) {
        return res.status(403).json({ message: 'You do not have permission to create pages in this workspace' });
      }

      // If parent_page_id is provided, verify it exists and belongs to the same workspace
      if (parent_page_id) {
        const parentPage = await dataAccess.getPageById(parent_page_id);
        if (!parentPage) {
          return res.status(404).json({ message: 'Parent page not found' });
        }
        if (parentPage.workspace_id !== workspaceId) {
          return res.status(400).json({ message: 'Parent page does not belong to this workspace' });
        }
      }

      // Calculate position for the new page
      const position = await businessLogic.calculateNewPosition(workspaceId, parent_page_id || null);

      // Create the page
      const page = await dataAccess.createPage(
        workspaceId,
        parent_page_id || null,
        title || 'Untitled',
        content || { blocks: [] },
        icon || null,
        cover_image || null,
        userId
      );

      // Update position
      await dataAccess.movePage(page.id, parent_page_id || null, position, userId);

      // Invalidate caches
      await services.invalidateWorkspaceCache(workspaceId);
      if (parent_page_id) {
        await services.invalidateChildPagesCache(parent_page_id);
      }

      // Publish event
      await services.publishPageCreated(page);

      return res.status(201).json({ page });
    } catch (err) {
      console.error('Error creating page', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}