const dataAccess = require('../data-access');
const services = require('../services');
const businessLogic = require('../business-logic');

// Import workspace controller factory functions
const makeCreateWorkspace = require('./createWorkspace');
const makeListWorkspacesForUser = require('./listWorkspacesForUser');
const makeGetWorkspaceById = require('./getWorkspaceById');
const makeUpdateWorkspace = require('./updateWorkspace');
const makeDeleteWorkspace = require('./deleteWorkspace');

// Import invitation controller factory functions
const makeCreateInvitation = require('./createInvitation');
const makeGetWorkspaceInvitations = require('./getWorkspaceInvitations');
const makeGetInvitationByCode = require('./getInvitationByCode');
const makeAcceptInvitation = require('./acceptInvitation');
const makeDeactivateInvitation = require('./deactivateInvitation');
const makeDeleteInvitation = require('./deleteInvitation');

// Create workspace controller functions
const createWorkspace = makeCreateWorkspace({ dataAccess, services, businessLogic });
const listWorkspacesForUser = makeListWorkspacesForUser({ dataAccess, services, businessLogic });
const getWorkspaceById = makeGetWorkspaceById({ dataAccess, services, businessLogic });
const updateWorkspace = makeUpdateWorkspace({ dataAccess, services, businessLogic });
const deleteWorkspace = makeDeleteWorkspace({ dataAccess, services, businessLogic });

// Create invitation controller functions
const createInvitation = makeCreateInvitation({ dataAccess, services, businessLogic });
const getWorkspaceInvitations = makeGetWorkspaceInvitations({ dataAccess, services, businessLogic });
const getInvitationByCode = makeGetInvitationByCode({ dataAccess, services, businessLogic });
const acceptInvitation = makeAcceptInvitation({ dataAccess, services, businessLogic });
const deactivateInvitation = makeDeactivateInvitation({ dataAccess, services, businessLogic });
const deleteInvitation = makeDeleteInvitation({ dataAccess, services, businessLogic });

module.exports = {
  createWorkspace,
  listWorkspacesForUser,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
  createInvitation,
  getWorkspaceInvitations,
  getInvitationByCode,
  acceptInvitation,
  deactivateInvitation,
  deleteInvitation,
};

