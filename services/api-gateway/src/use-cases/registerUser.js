const Joi = require('joi');

const schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().trim().min(1).allow('', null),
});

function createRegisterUserUseCase({ authApi }) {
  if (!authApi) {
    throw new Error('authApi is required to create registerUser use-case');
  }

  return async function registerUser({ email, password, name }) {
    const { error, value } = schema.validate(
      { email, password, name },
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
      const response = await authApi.register(value);
      return { status: response.status, data: response.data };
    } catch (err) {
      if (err.response) {
        return { status: err.response.status, data: err.response.data };
      }
      console.error('Error calling auth service /register', err.message);
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

module.exports = { createRegisterUserUseCase };

