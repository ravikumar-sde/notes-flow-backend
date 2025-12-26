function createPageController(dataAccess, services, businessLogic) {
  async function createPage(req, res) {
    const userId = req.headers['x-user-id'];
    const { workspace_id, parent_page_id, title, content, icon, cover_image } = req.body || {};

    if (!userId) {
      return res.status(401).json({ message: 'Missing x-user-id header' });
    }

    if (!workspace_id) {
      return res.status(400).json({ message: 'workspace_id is required' });
    }

    try {
      // Check if user has access to the workspace
      const membership = await dataAccess.checkUserWorkspaceAccess(workspace_id, userId);
      if (!membership) {
        return res.status(403).json({ message: 'Access denied to this workspace' });
      }

      // If parent_page_id is provided, verify it exists and belongs to the same workspace
      if (parent_page_id) {
        const parentPage = await dataAccess.getPageById(parent_page_id);
        if (!parentPage) {
          return res.status(404).json({ message: 'Parent page not found' });
        }
        if (parentPage.workspace_id !== workspace_id) {
          return res.status(400).json({ message: 'Parent page does not belong to this workspace' });
        }
      }

      // Calculate position for the new page
      const position = await businessLogic.calculateNewPosition(workspace_id, parent_page_id || null);

      // Create the page
      const page = await dataAccess.createPage(
        workspace_id,
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
      await services.invalidateWorkspaceCache(workspace_id);
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

  async function getPageById(req, res) {
    const userId = req.headers['x-user-id'];
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Missing x-user-id header' });
    }

    if (!id) {
      return res.status(400).json({ message: 'Page ID is required' });
    }

    try {
      // Check cache first
      const cached = await services.getCachedPage(id);
      if (cached) {
        // Still need to verify user has access
        const membership = await dataAccess.checkUserWorkspaceAccess(cached.workspace_id, userId);
        if (membership) {
          return res.json({ page: cached, source: 'cache' });
        }
      }

      // Get page with permission check
      const page = await dataAccess.getPageWithPermissions(id, userId);

      if (!page) {
        return res.status(404).json({ message: 'Page not found or access denied' });
      }

      // Cache the page
      await services.setCachedPage(id, page);

      return res.json({ page, source: 'db' });
    } catch (err) {
      console.error('Error getting page', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async function getWorkspacePages(req, res) {
    const userId = req.headers['x-user-id'];
    const { workspaceId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Missing x-user-id header' });
    }

    if (!workspaceId) {
      return res.status(400).json({ message: 'Workspace ID is required' });
    }

    try {
      // Check if user has access to the workspace
      const membership = await dataAccess.checkUserWorkspaceAccess(workspaceId, userId);
      if (!membership) {
        return res.status(403).json({ message: 'Access denied to this workspace' });
      }

      // Check cache first
      const cached = await services.getCachedWorkspacePages(workspaceId);
      if (cached) {
        return res.json({ pages: buildPageTree(cached), source: 'cache' });
      }

      // Get all pages in workspace
      const pages = await dataAccess.getWorkspacePages(workspaceId, userId);

      // Cache the pages
      await services.setCachedWorkspacePages(workspaceId, pages);

      // Build tree structure
      const tree = buildPageTree(pages);

      return res.json({ pages: tree, source: 'db' });
    } catch (err) {
      console.error('Error getting workspace pages', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Helper function to build page tree
  function buildPageTree(pages) {
    const pageMap = new Map();
    const rootPages = [];

    // Create a map of all pages
    pages.forEach(page => {
      pageMap.set(page.id, { ...page, children: [] });
    });

    // Build the tree
    pages.forEach(page => {
      const pageNode = pageMap.get(page.id);
      if (page.parent_page_id === null) {
        rootPages.push(pageNode);
      } else {
        const parent = pageMap.get(page.parent_page_id);
        if (parent) {
          parent.children.push(pageNode);
        }
      }
    });

    return rootPages;
  }

  async function getChildPages(req, res) {
    const userId = req.headers['x-user-id'];
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Missing x-user-id header' });
    }

    if (!id) {
      return res.status(400).json({ message: 'Page ID is required' });
    }

    try {
      // Verify user has access to the parent page
      const page = await dataAccess.getPageWithPermissions(id, userId);
      if (!page) {
        return res.status(404).json({ message: 'Page not found or access denied' });
      }

      // Check cache first
      const cached = await services.getCachedChildPages(id);
      if (cached) {
        return res.json({ pages: cached, source: 'cache' });
      }

      // Get child pages
      const children = await dataAccess.getChildPages(id);

      // Cache the children
      await services.setCachedChildPages(id, children);

      return res.json({ pages: children, source: 'db' });
    } catch (err) {
      console.error('Error getting child pages', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async function updatePage(req, res) {
    const userId = req.headers['x-user-id'];
    const { id } = req.params;
    const { title, content, icon, cover_image } = req.body || {};

    if (!userId) {
      return res.status(401).json({ message: 'Missing x-user-id header' });
    }

    if (!id) {
      return res.status(400).json({ message: 'Page ID is required' });
    }

    try {
      // Verify user has access to the page
      const existingPage = await dataAccess.getPageWithPermissions(id, userId);
      if (!existingPage) {
        return res.status(404).json({ message: 'Page not found or access denied' });
      }

      // Check if user has permission to edit (member or higher)
      const role = existingPage.role;
      if (role === 'viewer') {
        return res.status(403).json({ message: 'Viewers cannot edit pages' });
      }

      // Build updates object
      const updates = {};
      if (title !== undefined) updates.title = title;
      if (content !== undefined) updates.content = content;
      if (icon !== undefined) updates.icon = icon;
      if (cover_image !== undefined) updates.cover_image = cover_image;

      // Update the page
      const page = await dataAccess.updatePage(id, updates, userId);

      // Invalidate caches
      await services.invalidateAllPageCaches(id, page.workspace_id, page.parent_page_id);

      // Publish event
      await services.publishPageUpdated(page);

      return res.json({ page });
    } catch (err) {
      console.error('Error updating page', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async function movePage(req, res) {
    const userId = req.headers['x-user-id'];
    const { id } = req.params;
    const { parent_page_id, position } = req.body || {};

    if (!userId) {
      return res.status(401).json({ message: 'Missing x-user-id header' });
    }

    if (!id) {
      return res.status(400).json({ message: 'Page ID is required' });
    }

    try {
      // Verify user has access to the page
      const existingPage = await dataAccess.getPageWithPermissions(id, userId);
      if (!existingPage) {
        return res.status(404).json({ message: 'Page not found or access denied' });
      }

      // Check if user has permission to move (member or higher)
      const role = existingPage.role;
      if (role === 'viewer') {
        return res.status(403).json({ message: 'Viewers cannot move pages' });
      }

      const oldParentId = existingPage.parent_page_id;

      // If new parent is provided, verify it exists and belongs to the same workspace
      if (parent_page_id) {
        const newParent = await dataAccess.getPageById(parent_page_id);
        if (!newParent) {
          return res.status(404).json({ message: 'New parent page not found' });
        }
        if (newParent.workspace_id !== existingPage.workspace_id) {
          return res.status(400).json({ message: 'Cannot move page to different workspace' });
        }
      }

      // Calculate new position if not provided
      const newPosition = position !== undefined
        ? position
        : await businessLogic.calculateNewPosition(existingPage.workspace_id, parent_page_id || null);

      // Move the page
      const page = await dataAccess.movePage(id, parent_page_id || null, newPosition, userId);

      // Invalidate caches
      await services.invalidateWorkspaceCache(page.workspace_id);
      if (oldParentId) {
        await services.invalidateChildPagesCache(oldParentId);
      }
      if (parent_page_id) {
        await services.invalidateChildPagesCache(parent_page_id);
      }

      // Publish event
      await services.publishPageMoved(page, oldParentId);

      return res.json({ page });
    } catch (err) {
      console.error('Error moving page', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async function archivePage(req, res) {
    const userId = req.headers['x-user-id'];
    const { id } = req.params;
    const { is_archived } = req.body || {};

    if (!userId) {
      return res.status(401).json({ message: 'Missing x-user-id header' });
    }

    if (!id) {
      return res.status(400).json({ message: 'Page ID is required' });
    }

    if (is_archived === undefined) {
      return res.status(400).json({ message: 'is_archived is required' });
    }

    try {
      // Verify user has access to the page
      const existingPage = await dataAccess.getPageWithPermissions(id, userId);
      if (!existingPage) {
        return res.status(404).json({ message: 'Page not found or access denied' });
      }

      // Check if user has permission to archive (admin or owner)
      const role = existingPage.role;
      if (role !== 'owner' && role !== 'admin') {
        return res.status(403).json({ message: 'Only owners and admins can archive pages' });
      }

      // Archive the page
      const page = await dataAccess.archivePage(id, is_archived, userId);

      // Invalidate caches
      await services.invalidateAllPageCaches(id, page.workspace_id, page.parent_page_id);

      // Publish event
      await services.publishPageArchived(page);

      return res.json({ page });
    } catch (err) {
      console.error('Error archiving page', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async function deletePage(req, res) {
    const userId = req.headers['x-user-id'];
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Missing x-user-id header' });
    }

    if (!id) {
      return res.status(400).json({ message: 'Page ID is required' });
    }

    try {
      // Verify user has access to the page
      const existingPage = await dataAccess.getPageWithPermissions(id, userId);
      if (!existingPage) {
        return res.status(404).json({ message: 'Page not found or access denied' });
      }

      // Check if user has permission to delete (owner only)
      const role = existingPage.role;
      if (role !== 'owner') {
        return res.status(403).json({ message: 'Only workspace owners can permanently delete pages' });
      }

      const workspaceId = existingPage.workspace_id;
      const parentPageId = existingPage.parent_page_id;

      // Delete the page
      await dataAccess.deletePage(id);

      // Invalidate caches
      await services.invalidateAllPageCaches(id, workspaceId, parentPageId);

      // Publish event
      await services.publishPageDeleted(id, workspaceId, userId);

      return res.status(204).send();
    } catch (err) {
      console.error('Error deleting page', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return {
    createPage,
    getPageById,
    getWorkspacePages,
    getChildPages,
    updatePage,
    movePage,
    archivePage,
    deletePage,
  };
}

module.exports = createPageController;

