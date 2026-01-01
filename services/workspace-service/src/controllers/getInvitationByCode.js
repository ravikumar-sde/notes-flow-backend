module.exports = function makeGetInvitationByCode({ dataAccess, services, businessLogic, Joi }) {
  return async function getInvitationByCode(req, res) {
    const validationResult = ValidateInput({
      inviteCode: req.params.inviteCode
    });

    if (validationResult.error) {
      return res.status(400).json({
        message: 'Validation error',
        details: validationResult.error.details.map(d => ({ field: d.path.join('.'), message: d.message }))
      });
    }

    const { inviteCode } = validationResult.value;

    try {
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

  function ValidateInput({ inviteCode }) {
    const schema = Joi.object({
      inviteCode: Joi.string().required()
    });

    return schema.validate({ inviteCode }, { abortEarly: false });
  }
};

