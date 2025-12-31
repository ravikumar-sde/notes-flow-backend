const jwt = require('jsonwebtoken');
const config = require('../config');
const db = require('../db');
const redisClient = require('../redisClient');
const natsClient = require('../natsClient');

// Import controller factory functions
const makeRegister = require('./register');
const makeLogin = require('./login');
const makeMe = require('./me');

// Helper function to sign JWT tokens
function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
}

// Create controller functions
const register = makeRegister({ db, redisClient, natsClient, config, signToken });
const login = makeLogin({ db, redisClient, natsClient, config, signToken });
const me = makeMe({ db, redisClient, natsClient, config, signToken });

module.exports = {
  register,
  login,
  me,
};

