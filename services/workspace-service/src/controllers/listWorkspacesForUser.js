module.exports = function makeListWorkspacesForUser({ dataAccess, services, businessLogic, Joi }) {
  return async function listWorkspacesForUser(req, res) {
    const validationResult = ValidateInput({
      userId: req.headers['x-user-id']
    });

    if (validationResult.error) {
      return res.status(400).json({
        message: 'Validation error',
        details: validationResult.error.details.map(d => ({ field: d.path.join('.'), message: d.message }))
      });
    }

    const { userId } = validationResult.value;

    try {
      const cached = await services.getCachedWorkspaces(userId);
      if (cached) return res.json({ workspaces: cached, source: 'cache' });

      const workspaces = await dataAccess.getWorkspacesForUser(userId);
      await services.setCachedWorkspaces(userId, workspaces);

      return res.json({ workspaces, source: 'db' });
    } catch (err) {
      console.error('Error listing workspaces', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

  function ValidateInput({ userId }) {
    const schema = Joi.object({
      userId: Joi.string().uuid().required()
    });

    return schema.validate({ userId }, { abortEarly: false });
  }
};

