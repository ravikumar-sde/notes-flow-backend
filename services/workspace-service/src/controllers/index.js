const dataAccess = require('../data-access');
const services = require('../services');
const businessLogic = require('../business-logic');
const Joi = require('joi');

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
const createWorkspace = makeCreateWorkspace({ dataAccess, services, businessLogic, Joi });
const listWorkspacesForUser = makeListWorkspacesForUser({ dataAccess, services, businessLogic, Joi });
const getWorkspaceById = makeGetWorkspaceById({ dataAccess, services, businessLogic, Joi });
const updateWorkspace = makeUpdateWorkspace({ dataAccess, services, businessLogic, Joi });
const deleteWorkspace = makeDeleteWorkspace({ dataAccess, services, businessLogic, Joi });

// Create invitation controller functions
const createInvitation = makeCreateInvitation({ dataAccess, services, businessLogic, Joi });
const getWorkspaceInvitations = makeGetWorkspaceInvitations({ dataAccess, services, businessLogic, Joi });
const getInvitationByCode = makeGetInvitationByCode({ dataAccess, services, businessLogic, Joi });
const acceptInvitation = makeAcceptInvitation({ dataAccess, services, businessLogic, Joi });
const deactivateInvitation = makeDeactivateInvitation({ dataAccess, services, businessLogic, Joi });
const deleteInvitation = makeDeleteInvitation({ dataAccess, services, businessLogic, Joi });

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

