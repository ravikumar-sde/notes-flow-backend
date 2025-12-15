function createAuthController({
  registerUser,
  loginUser,
  getCurrentUser,
  authPresenter,
}) {
  if (!registerUser || !loginUser || !getCurrentUser || !authPresenter) {
    throw new Error('Missing dependencies for authController');
  }

  return {
    async register(req, res) {
      const { email, password, name } = req.body || {};

      try {
        const result = await registerUser({ email, password, name });
        return authPresenter.presentRegisterSuccess(res, result);
      } catch (err) {
        return authPresenter.presentError(res, err);
      }
    },

    async login(req, res) {
      const { email, password } = req.body || {};

      try {
        const result = await loginUser({ email, password });
        return authPresenter.presentLoginSuccess(res, result);
      } catch (err) {
        return authPresenter.presentError(res, err);
      }
    },

    async me(req, res) {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      try {
        const result = await getCurrentUser({ userId });
        return authPresenter.presentGetCurrentUserSuccess(res, result);
      } catch (err) {
        return authPresenter.presentError(res, err);
      }
    },
  };
}

module.exports = { createAuthController };

