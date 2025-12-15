const { createRegisterUser } = require('./registerUser');
const { createLoginUser } = require('./loginUser');
const { createGetCurrentUser } = require('./getCurrentUser');

module.exports = {
  createRegisterUser,
  createLoginUser,
  createGetCurrentUser,
};

