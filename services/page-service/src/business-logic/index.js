const dataAccess = require('../data-access');
const createPageOrdering = require('./pageOrdering');
const permissions = require('./permissions');

const pageOrdering = createPageOrdering(dataAccess);

module.exports = {
  ...pageOrdering,
  ...permissions,
};

