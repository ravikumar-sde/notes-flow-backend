const Joi = require('joi');
const { toUserEntity } = require('../entities');

const getCurrentUserSchema = Joi.object({
  userId: Joi.alternatives(Joi.string(), Joi.number()).required(),
});

function createGetCurrentUser({ userRepository, userCache }) {
  if (!userRepository || !userCache) {
    throw new Error('Missing dependencies for getCurrentUser use-case');
  }

  return async function getCurrentUser({ userId }) {
    const { error, value } = getCurrentUserSchema.validate(
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

    const cached = await userCache.getUser(validUserId);
    if (cached) {
      const user = toUserEntity(cached);
      return { user, source: 'cache' };
    }

    const userRow = await userRepository.findById(validUserId);
    if (!userRow) {
      const err = new Error('User not found');
      err.statusCode = 404;
      err.code = 'USER_NOT_FOUND';
      throw err;
    }

    const user = toUserEntity(userRow);

    await userCache.setUser(user);

    return { user, source: 'db' };
  };
}

module.exports = { createGetCurrentUser };

