const express = require('express');
const config = require('./config');
const { createClient } = require('./httpClient');
const authMiddleware = require('./authMiddleware');

const router = express.Router({ mergeParams: true });
const workspaceClient = createClient(config.workspaceServiceUrl);

// Create a new invitation
router.post('/', authMiddleware, async (req, res) => {
  try {
    const response = await workspaceClient.post(
      `/workspaces/${req.params.workspaceId}/invitations`,
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
    console.error('Error in POST /workspaces/:workspaceId/invitations gateway handler', err.message);
    return res
      .status(502)
      .json({ message: 'Workspace service unavailable', detail: err.message });
  }
});

// Get workspace invitations
router.get('/', authMiddleware, async (req, res) => {
  try {
    const response = await workspaceClient.get(
      `/workspaces/${req.params.workspaceId}/invitations`,
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
    console.error('Error in GET /workspaces/:workspaceId/invitations gateway handler', err.message);
    return res
      .status(502)
      .json({ message: 'Workspace service unavailable', detail: err.message });
  }
});

// Deactivate an invitation
router.patch('/:invitationId/deactivate', authMiddleware, async (req, res) => {
  try {
    const response = await workspaceClient.patch(
      `/workspaces/${req.params.workspaceId}/invitations/${req.params.invitationId}/deactivate`,
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
    console.error('Error in PATCH /workspaces/:workspaceId/invitations/:invitationId/deactivate gateway handler', err.message);
    return res
      .status(502)
      .json({ message: 'Workspace service unavailable', detail: err.message });
  }
});

// Delete an invitation
router.delete('/:invitationId', authMiddleware, async (req, res) => {
  try {
    const response = await workspaceClient.delete(
      `/workspaces/${req.params.workspaceId}/invitations/${req.params.invitationId}`,
      {
        headers: {
          'x-user-id': req.userId,
        },
      }
    );
    return res.status(response.status).send(response.data);
  } catch (err) {
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }
    console.error('Error in DELETE /workspaces/:workspaceId/invitations/:invitationId gateway handler', err.message);
    return res
      .status(502)
      .json({ message: 'Workspace service unavailable', detail: err.message });
  }
});

module.exports = router;

