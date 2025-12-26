const express = require('express');
const config = require('./config');
const { createClient } = require('./httpClient');
const authMiddleware = require('./authMiddleware');

const router = express.Router();
const workspaceClient = createClient(config.workspaceServiceUrl);

router.post('/', authMiddleware, async (req, res) => {
  try {
    const response = await workspaceClient.post('/workspaces', req.body, {
      headers: {
        'x-user-id': req.userId,
      },
    });
    return res.status(response.status).json(response.data);
  } catch (err) {
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }
    console.error('Error in POST /workspaces gateway handler', err.message);
    return res
      .status(502)
      .json({ message: 'Workspace service unavailable', detail: err.message });
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const response = await workspaceClient.get('/workspaces', {
      headers: {
        'x-user-id': req.userId,
      },
    });
    return res.status(response.status).json(response.data);
  } catch (err) {
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }
    console.error('Error in GET /workspaces gateway handler', err.message);
    return res
      .status(502)
      .json({ message: 'Workspace service unavailable', detail: err.message });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const response = await workspaceClient.get(`/workspaces/${req.params.id}`, {
      headers: {
        'x-user-id': req.userId,
      },
    });
    return res.status(response.status).json(response.data);
  } catch (err) {
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }
    console.error('Error in GET /workspaces/:id gateway handler', err.message);
    return res
      .status(502)
      .json({ message: 'Workspace service unavailable', detail: err.message });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const response = await workspaceClient.put(`/workspaces/${req.params.id}`, req.body, {
      headers: {
        'x-user-id': req.userId,
      },
    });
    return res.status(response.status).json(response.data);
  } catch (err) {
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }
    console.error('Error in PUT /workspaces/:id gateway handler', err.message);
    return res
      .status(502)
      .json({ message: 'Workspace service unavailable', detail: err.message });
  }
});

router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const response = await workspaceClient.patch(`/workspaces/${req.params.id}`, req.body, {
      headers: {
        'x-user-id': req.userId,
      },
    });
    return res.status(response.status).json(response.data);
  } catch (err) {
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }
    console.error('Error in PATCH /workspaces/:id gateway handler', err.message);
    return res
      .status(502)
      .json({ message: 'Workspace service unavailable', detail: err.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const response = await workspaceClient.delete(`/workspaces/${req.params.id}`, {
      headers: {
        'x-user-id': req.userId,
      },
    });
    return res.status(response.status).send(response.data);
  } catch (err) {
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }
    console.error('Error in DELETE /workspaces/:id gateway handler', err.message);
    return res
      .status(502)
      .json({ message: 'Workspace service unavailable', detail: err.message });
  }
});

module.exports = router;

