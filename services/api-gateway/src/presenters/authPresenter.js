function createAuthPresenter() {
  function presentResult(res, result) {
    return res.status(result.status).json(result.data);
  }

  function presentError(res, err, context) {
    console.error(context || 'Auth controller error', err.message);
    return res
      .status(500)
      .json({ message: 'Internal server error', detail: err.message });
  }

  return {
    presentResult,
    presentError,
  };
}

module.exports = { createAuthPresenter };

