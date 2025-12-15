const Joi = require('joi');
const { toWorkspaceEntity } = require('../entities');

const createWorkspaceSchema = Joi.object({
  userId: Joi.alternatives(Joi.string(), Joi.number()).required(),
  name: Joi.string().trim().min(1).required(),
});

function slugify(input) {
  return input
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function createCreateWorkspace({ workspaceRepository, workspaceCache, eventPublisher }) {
  if (!workspaceRepository || !workspaceCache || !eventPublisher) {
    throw new Error('Missing dependencies for createWorkspace use-case');
  }

  return async function createWorkspace({ userId, name }) {
    const { error, value } = createWorkspaceSchema.validate(
      { userId, name },
      { abortEarly: false, stripUnknown: true },
    );

    if (error) {
      const err = new Error(error.details.map((d) => d.message).join(', '));
      err.statusCode = 400;
      err.code = 'VALIDATION_ERROR';
      throw err;
    }

    const { userId: validUserId, name: validName } = value;

    let baseSlug = slugify(validName);
    if (!baseSlug) {
      baseSlug = `workspace-${Date.now()}`;
    }

    let slug = baseSlug;
    let attempts = 0;
    // simple uniqueness loop, max 5 attempts
    while (attempts < 5) {
      const taken = await workspaceRepository.isSlugTaken(slug);
      if (!taken) break;
      attempts += 1;
      slug = `${baseSlug}-${attempts}`;
    }

    const workspaceRow = await workspaceRepository.createWorkspace({
      name: validName,
      slug,
      ownerId: validUserId,
    });

    const workspace = toWorkspaceEntity(workspaceRow);

    await workspaceRepository.addOwnerMembership({
      workspaceId: workspace.id,
      userId: validUserId,
    });

    await workspaceCache.invalidateUserWorkspaces(validUserId);

    await eventPublisher.publish('workspace.created', {
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
      ownerId: workspace.owner_id,
    });

    return { workspace };
  };
}

module.exports = { createCreateWorkspace };

