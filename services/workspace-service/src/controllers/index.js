const dataAccess = require('../data-access');
const services = require('../services');
const businessLogic = require('../business-logic');
const createWorkspaceController = require('./workspaceController');

const workspaceController = createWorkspaceController(dataAccess, services, businessLogic);

module.exports = {
  ...workspaceController,
};

