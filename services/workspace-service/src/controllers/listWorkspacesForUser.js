module.exports = function makeListWorkspacesForUser({ dataAccess, services, businessLogic }) {
  return async function listWorkspacesForUser(req, res) {
    const userId = req.headers['x-user-id'];

    if (!userId) {
      return res.status(401).json({ message: 'Missing x-user-id header' });
    }

    try {
      const cached = await services.getCachedWorkspaces(userId);
      if (cached) {
        return res.json({ workspaces: cached, source: 'cache' });
      }

      const workspaces = await dataAccess.getWorkspacesForUser(userId);
      await services.setCachedWorkspaces(userId, workspaces);

      return res.json({ workspaces, source: 'db' });
    } catch (err) {
      console.error('Error listing workspaces', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
};

