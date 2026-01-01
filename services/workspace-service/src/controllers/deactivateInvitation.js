module.exports = function makeDeactivateInvitation({ dataAccess, services, businessLogic, Joi }) {
  return async function deactivateInvitation(req, res) {
    const validationResult = ValidateInput({
      userId: req.headers['x-user-id'],
      workspaceId: req.params.workspaceId,
      invitationId: req.params.invitationId
    });

    if (validationResult.error) {
      return res.status(400).json({
        message: 'Validation error',
        details: validationResult.error.details.map(d => ({ field: d.path.join('.'), message: d.message }))
      });
    }

    const { userId, workspaceId, invitationId } = validationResult.value;

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
  };

  function ValidateInput({ userId, workspaceId, invitationId }) {
    const schema = Joi.object({
      userId: Joi.string().uuid().required(),
      workspaceId: Joi.string().uuid().required(),
      invitationId: Joi.string().uuid().required()
    });

    return schema.validate({ userId, workspaceId, invitationId }, { abortEarly: false });
  }
};

