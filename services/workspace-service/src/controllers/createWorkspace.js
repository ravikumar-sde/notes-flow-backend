module.exports = function makeCreateWorkspace({ dataAccess, services, businessLogic, Joi }) {
  return async function createWorkspace(req, res) {
    const validationResult = ValidateInput({
      userId: req.headers['x-user-id'],
      name: req.body.name
    });

    if (validationResult.error) {
      return res.status(400).json({
        message: 'Validation error',
        details: validationResult.error.details.map(d => ({ field: d.path.join('.'), message: d.message }))
      });
    }

    const { userId, name } = validationResult.value;

    try {
      const slug = await businessLogic.generateUniqueSlug(name);
      const workspace = await dataAccess.createWorkspace(name, slug, userId);
      await dataAccess.createMembership(workspace.id, userId, 'owner');
      await services.invalidateUserCache(userId);
      await services.publishWorkspaceCreated(workspace);

      return res.status(201).json({ workspace });
    } catch (err) {
      console.error('Error creating workspace', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

  function ValidateInput({ userId, name }) {
    const schema = Joi.object({
      userId: Joi.string().uuid().required(),
      name: Joi.string().min(1).max(100).required()
    });

    return schema.validate({ userId, name }, { abortEarly: false });
  }
};

