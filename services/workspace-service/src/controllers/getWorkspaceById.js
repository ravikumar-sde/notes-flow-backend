module.exports = function makeGetWorkspaceById({ dataAccess, services, businessLogic, Joi }) {
  return async function getWorkspaceById(req, res) {
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
      const workspace = await dataAccess.getWorkspaceWithRole(id, userId);
      if (!workspace) return res.status(404).json({ message: 'Workspace not found or access denied' });

      return res.json({ workspace });
    } catch (err) {
      console.error('Error getting workspace', err);
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

