const Joi = require('joi');

const schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

function createLoginUserUseCase({ authApi }) {
  if (!authApi) {
    throw new Error('authApi is required to create loginUser use-case');
  }

  return async function loginUser({ email, password }) {
    const { error, value } = schema.validate(
      { email, password },
      { abortEarly: false, stripUnknown: true }
    );

    if (error) {
      return {
        status: 400,
        data: {
          message: 'Validation failed',
          details: error.details.map((d) => d.message),
        },
      };
    }

    try {
      const response = await authApi.login(value);
      return { status: response.status, data: response.data };
    } catch (err) {
      if (err.response) {
        return { status: err.response.status, data: err.response.data };
      }
      console.error('Error calling auth service /login', err.message);
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

module.exports = { createLoginUserUseCase };

