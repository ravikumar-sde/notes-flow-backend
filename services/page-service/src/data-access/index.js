const db = require('../database');
const createPageQueries = require('./page.db');
const createWorkspaceMembershipQueries = require('./workspaceMembership.db');

const pageQueries = createPageQueries(db);
const workspaceMembershipQueries = createWorkspaceMembershipQueries(db);

module.exports = {
  ...pageQueries,
  ...workspaceMembershipQueries,
};

