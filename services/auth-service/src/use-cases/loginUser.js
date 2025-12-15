const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const { toUserEntity } = require('../entities');

const loginUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

function createLoginUser({ userRepository, userCache, config }) {
  if (!userRepository || !userCache || !config) {
    throw new Error('Missing dependencies for loginUser use-case');
  }

  return async function loginUser({ email, password }) {
    const { error, value } = loginUserSchema.validate(
      { email, password },
      { abortEarly: false, stripUnknown: true },
    );

    if (error) {
      const err = new Error(error.details.map((d) => d.message).join(', '));
      err.statusCode = 400;
      err.code = 'VALIDATION_ERROR';
      throw err;
    }

    const { email: validEmail, password: validPassword } = value;

    const user = await userRepository.findByEmail(validEmail);

    if (!user) {
      const err = new Error('Invalid credentials');
      err.statusCode = 401;
      err.code = 'INVALID_CREDENTIALS';
      throw err;
    }

    const valid = await bcrypt.compare(validPassword, user.password_hash);
    if (!valid) {
      const err = new Error('Invalid credentials');
      err.statusCode = 401;
      err.code = 'INVALID_CREDENTIALS';
      throw err;
    }

    const { password_hash, ...safeUser } = user;
    const userEntity = toUserEntity(safeUser);

    const token = jwt.sign(
      { sub: userEntity.id, email: userEntity.email },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn },
    );

    await userCache.setUser(userEntity);

    return { token, user: userEntity };
  };
}

module.exports = { createLoginUser };

