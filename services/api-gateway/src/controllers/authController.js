function createAuthController({
  registerUser,
  loginUser,
  getCurrentUser,
  authPresenter,
}) {
  if (!registerUser || !loginUser || !getCurrentUser || !authPresenter) {
    throw new Error(
      'registerUser, loginUser, getCurrentUser and authPresenter are required for authController',
    );
  }

  return {
    async register(req, res) {
      const { email, password, name } = req.body || {};

      try {
        const result = await registerUser({ email, password, name });
        return authPresenter.presentResult(res, result);
      } catch (err) {
        return authPresenter.presentError(res, err, 'authController.register');
      }
    },

    async login(req, res) {
      const { email, password } = req.body || {};

      try {
        const result = await loginUser({ email, password });
        return authPresenter.presentResult(res, result);
      } catch (err) {
        return authPresenter.presentError(res, err, 'authController.login');
      }
    },

    async me(req, res) {
      const authorization = req.headers['authorization'] || '';

      try {
        const result = await getCurrentUser({ authorization });
        return authPresenter.presentResult(res, result);
      } catch (err) {
        return authPresenter.presentError(res, err, 'authController.me');
      }
    },
  };
}

module.exports = { createAuthController };

