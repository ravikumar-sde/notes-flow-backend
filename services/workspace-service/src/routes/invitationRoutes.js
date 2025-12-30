const express = require('express');
const controllers = require('../controllers');

const router = express.Router({ mergeParams: true });

// Create a new invitation for a workspace
router.post('/', controllers.createInvitation);

// Get all invitations for a workspace
router.get('/', controllers.getWorkspaceInvitations);

// Deactivate an invitation
router.patch('/:invitationId/deactivate', controllers.deactivateInvitation);

// Delete an invitation
router.delete('/:invitationId', controllers.deleteInvitation);

module.exports = router;

