module.exports = function makeCreateWorkspace({ dataAccess, services, businessLogic }) {
  return async function createWorkspace(req, res) {
    const userId = req.headers['x-user-id'];
    const { name } = req.body || {};

    if (!userId) {
      return res.status(401).json({ message: 'Missing x-user-id header' });
    }

    if (!name) {
      return res.status(400).json({ message: 'Workspace name is required' });
    }

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
};

