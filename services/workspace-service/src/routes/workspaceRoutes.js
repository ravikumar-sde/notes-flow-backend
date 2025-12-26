const express = require('express');
const controllers = require('../controllers');

const router = express.Router();

router.post('/', controllers.createWorkspace);
router.get('/', controllers.listWorkspacesForUser);
router.get('/:id', controllers.getWorkspaceById);
router.put('/:id', controllers.updateWorkspace);
router.patch('/:id', controllers.updateWorkspace);
router.delete('/:id', controllers.deleteWorkspace);

module.exports = router;

