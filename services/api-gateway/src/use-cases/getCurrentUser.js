const Joi = require('joi');

const schema = Joi.object({
  authorization: Joi.string().min(1).required(),
});

function createGetCurrentUserUseCase({ authApi }) {
  if (!authApi) {
    throw new Error('authApi is required to create getCurrentUser use-case');
  }

  return async function getCurrentUser({ authorization }) {
    const { error, value } = schema.validate(
      { authorization },
      { abortEarly: false, stripUnknown: true }
    );

    if (error) {
      const isMissingAuth = error.details.some(
        (d) => d.path[0] === 'authorization' && d.type === 'any.required'
      );

      return {
        status: isMissingAuth ? 401 : 400,
        data: {
          message: 'Invalid authorization header',
          details: error.details.map((d) => d.message),
        },
      };
    }

    try {
      const response = await authApi.getCurrentUser(value.authorization);
      return { status: response.status, data: response.data };
    } catch (err) {
      if (err.response) {
        return { status: err.response.status, data: err.response.data };
      }
      console.error('Error calling auth service /me', err.message);
      return {
        status: 502,
        data: {
          message: 'Auth service unavailable',
          detail: err.message,
        },
      };
    }
  };
}

module.exports = { createGetCurrentUserUseCase };

