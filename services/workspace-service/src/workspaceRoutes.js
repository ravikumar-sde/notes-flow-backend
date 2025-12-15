const express = require('express');
const {
  createWorkspace,
  listWorkspacesForUser,
} = require('./workspaceController');

const router = express.Router();

router.post('/', createWorkspace);
router.get('/', listWorkspacesForUser);

module.exports = router;

