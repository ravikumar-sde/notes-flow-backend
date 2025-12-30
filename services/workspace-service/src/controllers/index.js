const dataAccess = require('../data-access');
const services = require('../services');
const businessLogic = require('../business-logic');
const createWorkspaceController = require('./workspaceController');
const createInvitationController = require('./invitationController');

const workspaceController = createWorkspaceController(dataAccess, services, businessLogic);
const invitationController = createInvitationController(dataAccess, services, businessLogic);

module.exports = {
  ...workspaceController,
  ...invitationController,
};

