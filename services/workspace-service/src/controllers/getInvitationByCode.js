module.exports = function makeGetInvitationByCode({ dataAccess, services, businessLogic }) {
  return async function getInvitationByCode(req, res) {
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
  };
};

