module.exports = function makeDeleteInvitation({ dataAccess, services, businessLogic }) {
  return async function deleteInvitation(req, res) {
    const userId = req.headers['x-user-id'];
    const { workspaceId, invitationId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Missing x-user-id header' });
    }

    try {
      // Check if user has permission to delete invitations
      const membership = await dataAccess.getMembership(workspaceId, userId);
      if (!membership) {
        return res.status(404).json({ message: 'Workspace not found or access denied' });
      }

      if (!businessLogic.canManageInvitations(membership.role)) {
        return res.status(403).json({ message: 'You do not have permission to delete invitations' });
      }

      // Get invitation to verify it belongs to this workspace
      const invitation = await dataAccess.getInvitationById(invitationId);
      if (!invitation || invitation.workspace_id !== workspaceId) {
        return res.status(404).json({ message: 'Invitation not found' });
      }

      // Delete
      await dataAccess.deleteInvitation(invitationId);

      // Publish event
      await services.publishInvitationDeleted(invitationId, workspaceId);

      return res.status(204).send();
    } catch (err) {
      console.error('Error deleting invitation', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
};

