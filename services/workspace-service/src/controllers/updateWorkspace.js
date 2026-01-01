module.exports = function makeUpdateWorkspace({ dataAccess, services, businessLogic, Joi }) {
  return async function updateWorkspace(req, res) {
    const validationResult = ValidateInput({
      userId: req.headers['x-user-id'],
      id: req.params.id,
      name: req.body.name
    });

    if (validationResult.error) {
      return res.status(400).json({
        message: 'Validation error',
        details: validationResult.error.details.map(d => ({ field: d.path.join('.'), message: d.message }))
      });
    }

    const { userId, id, name } = validationResult.value;

    try {
      const membership = await dataAccess.getMembershipWithWorkspace(id, userId);
      if (!membership) return res.status(404).json({ message: 'Workspace not found or access denied' });

      const { role, slug: currentSlug } = membership;

      if (!businessLogic.canEditSettings(role)) {
        return res.status(403).json({ message: 'You do not have permission to update workspace settings' });
      }

      let newSlug = currentSlug;
      const currentWorkspace = await dataAccess.getWorkspaceById(id);

      if (currentWorkspace && currentWorkspace.name !== name) {
        newSlug = await businessLogic.generateUniqueSlugForUpdate(name, id);
      }

      const workspace = await dataAccess.updateWorkspace(id, name, newSlug);

      const members = await dataAccess.getWorkspaceMembers(id);
      const memberUserIds = members.map(m => m.user_id);
      await services.invalidateMultipleUserCaches(memberUserIds);
      await services.publishWorkspaceUpdated(workspace);

      return res.json({ workspace });
    } catch (err) {
      console.error('Error updating workspace', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

  function ValidateInput({ userId, id, name }) {
    const schema = Joi.object({
      userId: Joi.string().uuid().required(),
      id: Joi.string().uuid().required(),
      name: Joi.string().min(1).max(100).required()
    });

    return schema.validate({ userId, id, name }, { abortEarly: false });
  }
};

