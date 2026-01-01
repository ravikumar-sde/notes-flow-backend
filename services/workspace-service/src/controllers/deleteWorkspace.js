module.exports = function makeDeleteWorkspace({ dataAccess, services, businessLogic, Joi }) {
  return async function deleteWorkspace(req, res) {
    const validationResult = ValidateInput({
      userId: req.headers['x-user-id'],
      id: req.params.id
    });

    if (validationResult.error) {
      return res.status(400).json({
        message: 'Validation error',
        details: validationResult.error.details.map(d => ({ field: d.path.join('.'), message: d.message }))
      });
    }

    const { userId, id } = validationResult.value;

    try {
      const ownerData = await dataAccess.getWorkspaceOwner(id);
      if (!ownerData) return res.status(404).json({ message: 'Workspace not found' });

      if (ownerData.owner_id !== userId) {
        return res.status(403).json({ message: 'Only the workspace owner can delete the workspace' });
      }

      const members = await dataAccess.getWorkspaceMembers(id);
      await dataAccess.deleteWorkspace(id);

      const memberUserIds = members.map(m => m.user_id);
      await services.invalidateMultipleUserCaches(memberUserIds);
      await services.publishWorkspaceDeleted(id);

      return res.status(204).send();
    } catch (err) {
      console.error('Error deleting workspace', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

  function ValidateInput({ userId, id }) {
    const schema = Joi.object({
      userId: Joi.string().uuid().required(),
      id: Joi.string().uuid().required()
    });

    return schema.validate({ userId, id }, { abortEarly: false });
  }
};

