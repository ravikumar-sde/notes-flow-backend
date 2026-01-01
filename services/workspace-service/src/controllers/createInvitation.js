module.exports = function makeCreateInvitation({ dataAccess, services, businessLogic, Joi }) {
  return async function createInvitation(req, res) {
    const validationResult = ValidateInput({
      userId: req.headers['x-user-id'],
      workspaceId: req.params.workspaceId,
      role: req.body.role,
      expiresInDays: req.body.expiresInDays,
      maxUses: req.body.maxUses
    });

    if (validationResult.error) {
      return res.status(400).json({
        message: 'Validation error',
        details: validationResult.error.details.map(d => ({ field: d.path.join('.'), message: d.message }))
      });
    }

    const { userId, workspaceId, role, expiresInDays, maxUses } = validationResult.value;

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

  function ValidateInput({ userId, workspaceId, role, expiresInDays, maxUses }) {
    const schema = Joi.object({
      userId: Joi.string().uuid().required(),
      workspaceId: Joi.string().uuid().required(),
      role: Joi.string().valid('owner', 'admin', 'member', 'viewer').default('member'),
      expiresInDays: Joi.number().integer().min(1).max(365),
      maxUses: Joi.number().integer().min(1)
    });

    return schema.validate({ userId, workspaceId, role, expiresInDays, maxUses }, { abortEarly: false });
  }
};

