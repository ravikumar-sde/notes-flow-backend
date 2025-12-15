function createAuthPresenter() {
  function presentError(res, err) {
    const status = (err && err.statusCode) || 500;

    if (status >= 500) {
      console.error('Auth presenter error', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    return res.status(status).json({
      message: err && err.message ? err.message : 'Request failed',
      code: err && err.code,
    });
  }

  return {
    presentRegisterSuccess(res, result) {
      return res.status(201).json(result);
    },

    presentLoginSuccess(res, result) {
      return res.json(result);
    },

    presentGetCurrentUserSuccess(res, result) {
      return res.json(result);
    },

    presentError,
  };
}

module.exports = { createAuthPresenter };

