module.exports = function makeGetWorkspaceInvitations({ dataAccess, services, businessLogic, Joi }) {
  return async function getWorkspaceInvitations(req, res) {
    const validationResult = ValidateInput({
      userId: req.headers['x-user-id'],
      workspaceId: req.params.workspaceId
    });

    if (validationResult.error) {
      return res.status(400).json({
        message: 'Validation error',
        details: validationResult.error.details.map(d => ({ field: d.path.join('.'), message: d.message }))
      });
    }

    const { userId, workspaceId } = validationResult.value;

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

  function ValidateInput({ userId, workspaceId }) {
    const schema = Joi.object({
      userId: Joi.string().uuid().required(),
      workspaceId: Joi.string().uuid().required()
    });

    return schema.validate({ userId, workspaceId }, { abortEarly: false });
  }
};

