const express = require('express');
const config = require('./config');
const { createClient } = require('./httpClient');
const authMiddleware = require('./authMiddleware');

const router = express.Router({ mergeParams: true });
const pageClient = createClient(config.pageServiceUrl);

// Get all pages in a workspace (tree structure)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const response = await pageClient.get(`/workspaces/${req.params.workspaceId}/pages`, {
      headers: {
        'x-user-id': req.userId,
      },
    });
    return res.status(response.status).json(response.data);
  } catch (err) {
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }
    console.error('Error in GET /workspaces/:workspaceId/pages gateway handler', err.message);
    return res
      .status(502)
      .json({ message: 'Page service unavailable', detail: err.message });
  }
});

module.exports = router;

