const express = require('express');
const config = require('./config');
const { createClient } = require('./httpClient');
const authMiddleware = require('./authMiddleware');

const router = express.Router();
const workspaceClient = createClient(config.workspaceServiceUrl);

// Get invitation details by code (public preview - no auth required)
router.get('/:inviteCode', async (req, res) => {
  try {
    const response = await workspaceClient.get(`/invitations/${req.params.inviteCode}`);
    return res.status(response.status).json(response.data);
  } catch (err) {
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }
    console.error('Error in GET /invitations/:inviteCode gateway handler', err.message);
    return res
      .status(502)
      .json({ message: 'Workspace service unavailable', detail: err.message });
  }
});

// Accept an invitation (requires auth)
router.post('/:inviteCode/accept', authMiddleware, async (req, res) => {
  try {
    const response = await workspaceClient.post(
      `/invitations/${req.params.inviteCode}/accept`,
      req.body,
      {
        headers: {
          'x-user-id': req.userId,
        },
      }
    );
    return res.status(response.status).json(response.data);
  } catch (err) {
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }
    console.error('Error in POST /invitations/:inviteCode/accept gateway handler', err.message);
    return res
      .status(502)
      .json({ message: 'Workspace service unavailable', detail: err.message });
  }
});

module.exports = router;

