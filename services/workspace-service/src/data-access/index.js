const db = require('../database');
const createWorkspaceQueries = require('./workspaceQueries');
const createMembershipQueries = require('./membershipQueries');

const workspaceQueries = createWorkspaceQueries(db);
const membershipQueries = createMembershipQueries(db);

module.exports = {
  ...workspaceQueries,
  ...membershipQueries,
};

