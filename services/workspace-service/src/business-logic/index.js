const utils = require('../utils');
const dataAccess = require('../data-access');
const createSlugGenerator = require('./slugGenerator');

const slugGenerator = createSlugGenerator(utils, dataAccess);

module.exports = {
  ...slugGenerator,
};

