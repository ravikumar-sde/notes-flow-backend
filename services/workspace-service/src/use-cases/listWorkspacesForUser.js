const Joi = require('joi');
const { toWorkspaceEntities } = require('../entities');

const listWorkspacesSchema = Joi.object({
  userId: Joi.alternatives(Joi.string(), Joi.number()).required(),
});

function createListWorkspacesForUser({ workspaceRepository, workspaceCache }) {
  if (!workspaceRepository || !workspaceCache) {
    throw new Error('Missing dependencies for listWorkspacesForUser use-case');
  }

  return async function listWorkspacesForUser({ userId }) {
    const { error, value } = listWorkspacesSchema.validate(
      { userId },
      { abortEarly: false, stripUnknown: true },
    );

    if (error) {
      const err = new Error(error.details.map((d) => d.message).join(', '));
      err.statusCode = 400;
      err.code = 'VALIDATION_ERROR';
      throw err;
    }

    const { userId: validUserId } = value;

    const cached = await workspaceCache.getWorkspacesForUser(validUserId);
    if (cached) {
      const workspaces = toWorkspaceEntities(cached);
      return { workspaces, source: 'cache' };
    }

    const rows = await workspaceRepository.listWorkspacesForUser(validUserId);

    const workspaces = toWorkspaceEntities(rows);

    await workspaceCache.setWorkspacesForUser(validUserId, workspaces);

    return { workspaces, source: 'db' };
  };
}

module.exports = { createListWorkspacesForUser };

