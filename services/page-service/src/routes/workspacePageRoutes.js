const express = require('express');
const controllers = require('../controllers');

const router = express.Router({ mergeParams: true });

// Get all pages in a workspace (tree structure)
router.get('/', controllers.getWorkspacePages);

module.exports = router;

