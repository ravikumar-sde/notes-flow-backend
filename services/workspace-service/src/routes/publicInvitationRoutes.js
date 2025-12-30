const express = require('express');
const controllers = require('../controllers');

const router = express.Router();

// Get invitation details by code (public preview)
router.get('/:inviteCode', controllers.getInvitationByCode);

// Accept an invitation (join workspace)
router.post('/:inviteCode/accept', controllers.acceptInvitation);

module.exports = router;

