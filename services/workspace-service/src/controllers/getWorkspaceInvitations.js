module.exports = function makeGetWorkspaceInvitations({ dataAccess, services, businessLogic }) {
  return async function getWorkspaceInvitations(req, res) {
    const userId = req.headers['x-user-id'];
    const { workspaceId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Missing x-user-id header' });
    }

    if (!workspaceId) {
      return res.status(400).json({ message: 'Workspace ID is required' });
    }

    try {
      // Check if user has permission to view invitations
      const membership = await dataAccess.getMembership(workspaceId, userId);
      if (!membership) {
        return res.status(404).json({ message: 'Workspace not found or access denied' });
      }

      if (!businessLogic.canManageInvitations(membership.role)) {
        return res.status(403).json({ message: 'You do not have permission to view invitations' });
      }

      const invitations = await dataAccess.getWorkspaceInvitations(workspaceId);

      return res.json({ invitations });
    } catch (err) {
      console.error('Error getting workspace invitations', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
};

