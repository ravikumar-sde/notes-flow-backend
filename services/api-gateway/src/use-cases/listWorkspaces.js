const Joi = require('joi');

const schema = Joi.object({
  userId: Joi.alternatives(Joi.string(), Joi.number()).required(),
});

function createListWorkspacesUseCase({ workspaceApi }) {
  if (!workspaceApi) {
    throw new Error('workspaceApi is required to create listWorkspaces use-case');
  }

  return async function listWorkspaces({ userId }) {
    const { error, value } = schema.validate(
      { userId },
      { abortEarly: false, stripUnknown: true }
    );

    if (error) {
      const isMissingUserId = error.details.some(
        (d) => d.path[0] === 'userId' && d.type === 'any.required'
      );

      return {
        status: isMissingUserId ? 401 : 400,
        data: {
          message: 'Validation failed',
          details: error.details.map((d) => d.message),
        },
      };
    }

    try {
      const response = await workspaceApi.listWorkspaces({ userId: value.userId });
      return { status: response.status, data: response.data };
    } catch (err) {
      if (err.response) {
        return { status: err.response.status, data: err.response.data };
      }
      console.error(
        'Error calling workspace service GET /workspaces',
        err.message
      );
      return {
        status: 502,
        data: {
          message: 'Workspace service unavailable',
          detail: err.message,
        },
      };
    }
  };
}

module.exports = { createListWorkspacesUseCase };

