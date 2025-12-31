module.exports = function makeAcceptInvitation({ dataAccess, services, businessLogic }) {
  return async function acceptInvitation(req, res) {
    const userId = req.headers['x-user-id'];
    const { inviteCode } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Missing x-user-id header' });
    }

    if (!inviteCode) {
      return res.status(400).json({ message: 'Invite code is required' });
    }

    try {
      // Normalize the code
      const normalizedCode = businessLogic.normalizeInviteCode(inviteCode);

      if (!businessLogic.isValidInviteCodeFormat(normalizedCode)) {
        return res.status(400).json({ message: 'Invalid invite code format' });
      }

      const invitation = await dataAccess.getInvitationByCode(normalizedCode);

      if (!invitation) {
        return res.status(404).json({ message: 'Invitation not found' });
      }

      const validation = businessLogic.canUseInvitation(invitation);
      if (!validation.valid) {
        return res.status(400).json({ message: validation.reason });
      }

      // Check if user is already a member
      const existingMembership = await dataAccess.getMembership(invitation.workspace_id, userId);
      if (existingMembership) {
        return res.status(400).json({ message: 'You are already a member of this workspace' });
      }

      // Check if user has already accepted this specific invitation
      const hasAccepted = await dataAccess.hasUserAcceptedInvitation(invitation.id, userId);
      if (hasAccepted) {
        return res.status(400).json({ message: 'You have already used this invitation' });
      }

      // Add user to workspace
      const membership = await dataAccess.addMember(invitation.workspace_id, userId, invitation.role);

      // Record acceptance
      await dataAccess.recordInvitationAcceptance(invitation.id, userId);

      // Increment uses count
      await dataAccess.incrementInvitationUses(invitation.id);

      // Invalidate cache for all workspace members (including the new member)
      const members = await dataAccess.getWorkspaceMembers(invitation.workspace_id);
      const memberUserIds = members.map(m => m.user_id);
      await services.invalidateMultipleUserCaches(memberUserIds);

      // Publish events
      await services.publishMemberAdded(invitation.workspace_id, userId, invitation.role);
      await services.publishInvitationAccepted(invitation, userId);

      return res.status(201).json({
        membership,
        workspace: {
          id: invitation.workspace_id,
          name: invitation.workspace_name,
          slug: invitation.workspace_slug,
        },
      });
    } catch (err) {
      console.error('Error accepting invitation', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
};

