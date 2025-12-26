function createWorkspaceController(dataAccess, services, businessLogic) {
  async function createWorkspace(req, res) {
    const userId = req.headers['x-user-id'];
    const { name } = req.body || {};

    if (!userId) {
      return res.status(401).json({ message: 'Missing x-user-id header' });
    }

    if (!name) {
      return res.status(400).json({ message: 'Workspace name is required' });
    }

    try {
      const slug = await businessLogic.generateUniqueSlug(name);
      const workspace = await dataAccess.createWorkspace(name, slug, userId);
      await dataAccess.createMembership(workspace.id, userId, 'owner');
      await services.invalidateUserCache(userId);
      await services.publishWorkspaceCreated(workspace);

      return res.status(201).json({ workspace });
    } catch (err) {
      console.error('Error creating workspace', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async function listWorkspacesForUser(req, res) {
    const userId = req.headers['x-user-id'];

    if (!userId) {
      return res.status(401).json({ message: 'Missing x-user-id header' });
    }

    try {
      const cached = await services.getCachedWorkspaces(userId);
      if (cached) {
        return res.json({ workspaces: cached, source: 'cache' });
      }

      const workspaces = await dataAccess.getWorkspacesForUser(userId);
      await services.setCachedWorkspaces(userId, workspaces);

      return res.json({ workspaces, source: 'db' });
    } catch (err) {
      console.error('Error listing workspaces', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async function getWorkspaceById(req, res) {
    const userId = req.headers['x-user-id'];
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Missing x-user-id header' });
    }

    if (!id) {
      return res.status(400).json({ message: 'Workspace ID is required' });
    }

    try {
      const workspace = await dataAccess.getWorkspaceWithRole(id, userId);

      if (!workspace) {
        return res.status(404).json({ message: 'Workspace not found or access denied' });
      }

      return res.json({ workspace });
    } catch (err) {
      console.error('Error getting workspace', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async function updateWorkspace(req, res) {
    const userId = req.headers['x-user-id'];
    const { id } = req.params;
    const { name } = req.body || {};

    if (!userId) res.status(401).json({ message: 'Missing x-user-id header' });
    if (!id) res.status(400).json({ message: 'Workspace ID is required' });
    if (!name) res.status(400).json({ message: 'Workspace name is required' });

    try {
      const membership = await dataAccess.getMembershipWithWorkspace(id, userId);

      if (!membership) {
        return res.status(404).json({ message: 'Workspace not found or access denied' });
      }

      const { role, slug: currentSlug } = membership;

      if (role !== 'owner' && role !== 'admin') {
        return res.status(403).json({ message: 'Only workspace owners and admins can update workspaces' });
      }

      // Generate new slug if name changed
      let newSlug = currentSlug;
      const currentWorkspace = await dataAccess.getWorkspaceById(id);

      if (currentWorkspace && currentWorkspace.name !== name) {
        newSlug = await businessLogic.generateUniqueSlugForUpdate(name, id);
      }

      const workspace = await dataAccess.updateWorkspace(id, name, newSlug);

      // Invalidate cache for all members
      const members = await dataAccess.getWorkspaceMembers(id);
      const memberUserIds = members.map(m => m.user_id);
      await services.invalidateMultipleUserCaches(memberUserIds);

      await services.publishWorkspaceUpdated(workspace);

      return res.json({ workspace });
    } catch (err) {
      console.error('Error updating workspace', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async function deleteWorkspace(req, res) {
    const userId = req.headers['x-user-id'];
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Missing x-user-id header' });
    }

    if (!id) {
      return res.status(400).json({ message: 'Workspace ID is required' });
    }

    try {
      const ownerData = await dataAccess.getWorkspaceOwner(id);

      if (!ownerData) {
        return res.status(404).json({ message: 'Workspace not found' });
      }

      if (ownerData.owner_id !== userId) {
        return res.status(403).json({ message: 'Only workspace owner can delete the workspace' });
      }

      // Get all members before deletion for cache invalidation
      const members = await dataAccess.getWorkspaceMembers(id);

      await dataAccess.deleteWorkspace(id);

      const memberUserIds = members.map(m => m.user_id);
      await services.invalidateMultipleUserCaches(memberUserIds);
      await services.publishWorkspaceDeleted(id);

      return res.status(204).send();
    } catch (err) {
      console.error('Error deleting workspace', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return {
    createWorkspace,
    listWorkspacesForUser,
    getWorkspaceById,
    updateWorkspace,
    deleteWorkspace,
  };
}

module.exports = createWorkspaceController;

