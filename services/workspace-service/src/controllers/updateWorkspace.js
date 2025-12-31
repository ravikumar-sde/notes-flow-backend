module.exports = function makeUpdateWorkspace({ dataAccess, services, businessLogic }) {
  return async function updateWorkspace(req, res) {
    const userId = req.headers['x-user-id'];
    const { id } = req.params;
    const { name } = req.body || {};

    if (!userId) {
      return res.status(401).json({ message: 'Missing x-user-id header' });
    }

    if (!id) {
      return res.status(400).json({ message: 'Workspace ID is required' });
    }

    if (!name) {
      return res.status(400).json({ message: 'Workspace name is required' });
    }

    try {
      const membership = await dataAccess.getMembershipWithWorkspace(id, userId);

      if (!membership) {
        return res.status(404).json({ message: 'Workspace not found or access denied' });
      }

      const { role, slug: currentSlug } = membership;

      if (!businessLogic.canEditSettings(role)) {
        return res.status(403).json({ message: 'You do not have permission to update workspace settings' });
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
  };
};

