module.exports = function makeGetWorkspaceById({ dataAccess, services, businessLogic }) {
  return async function getWorkspaceById(req, res) {
    const userId = req.headers['x-user-id'];
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Missing x-user-id header' });
    }

    if (!id) {
      return res.status(400).json({ message: 'Workspace ID is required' });
    }

    try {
      const workspace = await dataAccess.getWorkspaceWithRole(id, userId);

      if (!workspace) {
        return res.status(404).json({ message: 'Workspace not found or access denied' });
      }

      return res.json({ workspace });
    } catch (err) {
      console.error('Error getting workspace', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
};

