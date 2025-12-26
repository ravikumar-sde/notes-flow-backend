const db = require('../database');
const createPageQueries = require('./pageQueries');
const createWorkspaceMembershipQueries = require('./workspaceMembershipQueries');

const pageQueries = createPageQueries(db);
const workspaceMembershipQueries = createWorkspaceMembershipQueries(db);

module.exports = {
  ...pageQueries,
  ...workspaceMembershipQueries,
};

