module.exports = function makeDeleteWorkspace({ dataAccess, services, businessLogic }) {
  return async function deleteWorkspace(req, res) {
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

      // Only the owner can delete the workspace
      if (ownerData.owner_id !== userId) {
        return res.status(403).json({ message: 'Only the workspace owner can delete the workspace' });
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
  };
};

