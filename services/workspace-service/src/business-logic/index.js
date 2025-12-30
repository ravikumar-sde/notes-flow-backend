const utils = require('../utils');
const dataAccess = require('../data-access');
const createSlugGenerator = require('./slugGenerator');
const inviteCodeGenerator = require('./inviteCodeGenerator');
const permissions = require('./permissions');

const slugGenerator = createSlugGenerator(utils, dataAccess);

module.exports = {
  ...slugGenerator,
  ...inviteCodeGenerator,
  ...permissions,
};

