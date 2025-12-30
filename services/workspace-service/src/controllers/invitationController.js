function createInvitationController(dataAccess, services, businessLogic) {
  async function createInvitation(req, res) {
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
  }

  async function getWorkspaceInvitations(req, res) {
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
  }

  async function getInvitationByCode(req, res) {
    const { inviteCode } = req.params;

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

      // Check if invitation can be used
      const validation = businessLogic.canUseInvitation(invitation);

      // Return public info (don't expose sensitive data)
      return res.json({
        invitation: {
          workspace_id: invitation.workspace_id,
          workspace_name: invitation.workspace_name,
          workspace_slug: invitation.workspace_slug,
          role: invitation.role,
          expires_at: invitation.expires_at,
          is_valid: validation.valid,
          reason: validation.reason,
        },
      });
    } catch (err) {
      console.error('Error getting invitation by code', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async function acceptInvitation(req, res) {
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
  }

  async function deactivateInvitation(req, res) {
    const userId = req.headers['x-user-id'];
    const { workspaceId, invitationId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Missing x-user-id header' });
    }

    try {
      // Check if user has permission to deactivate invitations
      const membership = await dataAccess.getMembership(workspaceId, userId);
      if (!membership) {
        return res.status(404).json({ message: 'Workspace not found or access denied' });
      }

      if (!businessLogic.canManageInvitations(membership.role)) {
        return res.status(403).json({ message: 'You do not have permission to deactivate invitations' });
      }

      // Get invitation to verify it belongs to this workspace
      const invitation = await dataAccess.getInvitationById(invitationId);
      if (!invitation || invitation.workspace_id !== workspaceId) {
        return res.status(404).json({ message: 'Invitation not found' });
      }

      // Deactivate
      const updated = await dataAccess.deactivateInvitation(invitationId);

      // Publish event
      await services.publishInvitationDeactivated(updated);

      return res.json({ invitation: updated });
    } catch (err) {
      console.error('Error deactivating invitation', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Delete an invitation
   * DELETE /workspaces/:workspaceId/invitations/:invitationId
   */
  async function deleteInvitation(req, res) {
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
  }

  return {
    createInvitation,
    getWorkspaceInvitations,
    getInvitationByCode,
    acceptInvitation,
    deactivateInvitation,
    deleteInvitation,
  };
}

module.exports = createInvitationController;

