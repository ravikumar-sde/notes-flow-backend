function createWorkspacePresenter() {
  function presentError(res, err) {
    const status = (err && err.statusCode) || 500;

    if (status >= 500) {
      console.error('Workspace presenter error', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    return res.status(status).json({
      message: err && err.message ? err.message : 'Request failed',
      code: err && err.code,
    });
  }

  return {
    presentCreateSuccess(res, result) {
      return res.status(201).json(result);
    },

    presentListSuccess(res, result) {
      return res.json(result);
    },

    presentError,
  };
}

module.exports = { createWorkspacePresenter };

