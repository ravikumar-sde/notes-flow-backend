function createWorkspaceController({
  createWorkspace,
  listWorkspacesForUser,
  workspacePresenter,
}) {
  if (!createWorkspace || !listWorkspacesForUser || !workspacePresenter) {
    throw new Error('Missing dependencies for workspaceController');
  }

  return {
    async createWorkspace(req, res) {
      const userId = req.headers['x-user-id'];
      const { name } = req.body || {};

      if (!userId) {
        return res.status(401).json({ message: 'Missing x-user-id header' });
      }

      try {
        const result = await createWorkspace({ userId, name });
        return workspacePresenter.presentCreateSuccess(res, result);
      } catch (err) {
        return workspacePresenter.presentError(res, err);
      }
    },

    async listWorkspacesForUser(req, res) {
      const userId = req.headers['x-user-id'];

      if (!userId) {
        return res.status(401).json({ message: 'Missing x-user-id header' });
      }

      try {
        const result = await listWorkspacesForUser({ userId });
        return workspacePresenter.presentListSuccess(res, result);
      } catch (err) {
        return workspacePresenter.presentError(res, err);
      }
    },
  };
}

module.exports = { createWorkspaceController };

