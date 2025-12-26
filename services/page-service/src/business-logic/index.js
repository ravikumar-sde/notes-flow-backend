const dataAccess = require('../data-access');
const createPageOrdering = require('./pageOrdering');

const pageOrdering = createPageOrdering(dataAccess);

module.exports = {
  ...pageOrdering,
};

