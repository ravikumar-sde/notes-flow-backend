function createWorkspaceController({
  createWorkspace,
  listWorkspaces,
  workspacePresenter,
}) {
  if (!createWorkspace || !listWorkspaces || !workspacePresenter) {
    throw new Error(
      'createWorkspace, listWorkspaces and workspacePresenter are required for workspaceController',
    );
  }

  return {
    async createWorkspace(req, res) {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { name } = req.body || {};

      try {
        const result = await createWorkspace({ userId, name });
        return workspacePresenter.presentResult(
          res,
          result,
        );
      } catch (err) {
        return workspacePresenter.presentError(
          res,
          err,
          'workspaceController.createWorkspace',
        );
      }
    },

    async listWorkspaces(req, res) {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      try {
        const result = await listWorkspaces({ userId });
        return workspacePresenter.presentResult(res, result);
      } catch (err) {
        return workspacePresenter.presentError(
          res,
          err,
          'workspaceController.listWorkspaces',
        );
      }
    },
  };
}

module.exports = { createWorkspaceController };

