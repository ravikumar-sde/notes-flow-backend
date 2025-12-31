module.exports = function makeCreateInvitation({ dataAccess, services, businessLogic }) {
  return async function createInvitation(req, res) {
    const userId = req.headers['x-user-id'];
    const { workspaceId } = req.params;
    const { role, expiresInDays, maxUses } = req.body || {};

    if (!userId) {
      return res.status(401).json({ message: 'Missing x-user-id header' });
    }

    if (!workspaceId) {
      return res.status(400).json({ message: 'Workspace ID is required' });
    }

    try {
      // Check if user has permission to create invitations
      const membership = await dataAccess.getMembership(workspaceId, userId);
      if (!membership) {
        return res.status(404).json({ message: 'Workspace not found or access denied' });
      }

      if (!businessLogic.canManageInvitations(membership.role)) {
        return res.status(403).json({ message: 'You do not have permission to create invitations' });
      }

      // Validate role
      const validRoles = businessLogic.getInvitableRoles();
      const inviteRole = role || 'member';
      if (!validRoles.includes(inviteRole)) {
        return res.status(400).json({ message: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
      }

      // Generate unique invite code
      let inviteCode;
      let attempts = 0;
      const maxAttempts = 10;

      while (attempts < maxAttempts) {
        inviteCode = businessLogic.generateInviteCode();
        const existing = await dataAccess.getInvitationByCode(inviteCode);
        if (!existing) {
          break;
        }
        attempts++;
      }

      if (attempts >= maxAttempts) {
        return res.status(500).json({ message: 'Failed to generate unique invite code' });
      }

      // Calculate expiry date
      let expiresAt = null;
      if (expiresInDays && expiresInDays > 0) {
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expiresInDays);
      }

      // Create invitation
      const invitation = await dataAccess.createInvitation(
        workspaceId,
        inviteCode,
        inviteRole,
        userId,
        expiresAt,
        maxUses || null
      );

      // Publish event
      await services.publishInvitationCreated(invitation);

      return res.status(201).json({ invitation });
    } catch (err) {
      console.error('Error creating invitation', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
};

