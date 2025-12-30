const db = require('../database');
const createWorkspaceQueries = require('./workspaceQueries');
const createMembershipQueries = require('./membershipQueries');
const invitationQueries = require('./invitationQueries');

const workspaceQueries = createWorkspaceQueries(db);
const membershipQueries = createMembershipQueries(db);

module.exports = {
  ...workspaceQueries,
  ...membershipQueries,
  ...invitationQueries,
};

