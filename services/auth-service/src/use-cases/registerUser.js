const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const { toUserEntity } = require('../entities');

const registerUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().trim().min(1).allow('', null),
});

function createRegisterUser({ userRepository, userCache, eventPublisher, config }) {
  if (!userRepository || !userCache || !eventPublisher || !config) {
    throw new Error('Missing dependencies for registerUser use-case');
  }

  return async function registerUser({ email, password, name }) {
    const { error, value } = registerUserSchema.validate(
      { email, password, name },
      { abortEarly: false, stripUnknown: true },
    );

    if (error) {
      const err = new Error(error.details.map((d) => d.message).join(', '));
      err.statusCode = 400;
      err.code = 'VALIDATION_ERROR';
      throw err;
    }

    const { email: validEmail, password: validPassword, name: validName } = value;

    const existing = await userRepository.findByEmail(validEmail);
    if (existing) {
      const err = new Error('User already exists');
      err.statusCode = 409;
      err.code = 'USER_ALREADY_EXISTS';
      throw err;
    }

    const passwordHash = await bcrypt.hash(
      validPassword,
      config.bcryptSaltRounds,
    );

    const userRow = await userRepository.createUser({
      email: validEmail,
      passwordHash,
      name: validName,
    });

    const user = toUserEntity(userRow);

    const token = jwt.sign(
      { sub: user.id, email: user.email },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn },
    );

    await userCache.setUser(user);

    await eventPublisher.publish('user.registered', {
      id: user.id,
      email: user.email,
      name: user.name,
    });

    return { token, user };
  };
}

module.exports = { createRegisterUser };

