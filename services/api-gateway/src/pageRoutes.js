const express = require('express');
const config = require('./config');
const { createClient } = require('./httpClient');
const authMiddleware = require('./authMiddleware');

const router = express.Router({ mergeParams: true });
const pageClient = createClient(config.pageServiceUrl);

// Create a new page
router.post('/', authMiddleware, async (req, res) => {
  try {
    const response = await pageClient.post('/pages', req.body, {
      headers: {
        'x-user-id': req.userId,
      },
    });
    return res.status(response.status).json(response.data);
  } catch (err) {
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }
    console.error('Error in POST /pages gateway handler', err.message);
    return res
      .status(502)
      .json({ message: 'Page service unavailable', detail: err.message });
  }
});

// Get a single page by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const response = await pageClient.get(`/pages/${req.params.id}`, {
      headers: {
        'x-user-id': req.userId,
      },
    });
    return res.status(response.status).json(response.data);
  } catch (err) {
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }
    console.error('Error in GET /pages/:id gateway handler', err.message);
    return res
      .status(502)
      .json({ message: 'Page service unavailable', detail: err.message });
  }
});

// Get child pages
router.get('/:id/children', authMiddleware, async (req, res) => {
  try {
    const response = await pageClient.get(`/pages/${req.params.id}/children`, {
      headers: {
        'x-user-id': req.userId,
      },
    });
    return res.status(response.status).json(response.data);
  } catch (err) {
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }
    console.error('Error in GET /pages/:id/children gateway handler', err.message);
    return res
      .status(502)
      .json({ message: 'Page service unavailable', detail: err.message });
  }
});

// Update a page
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const response = await pageClient.put(`/pages/${req.params.id}`, req.body, {
      headers: {
        'x-user-id': req.userId,
      },
    });
    return res.status(response.status).json(response.data);
  } catch (err) {
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }
    console.error('Error in PUT /pages/:id gateway handler', err.message);
    return res
      .status(502)
      .json({ message: 'Page service unavailable', detail: err.message });
  }
});

router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const response = await pageClient.patch(`/pages/${req.params.id}`, req.body, {
      headers: {
        'x-user-id': req.userId,
      },
    });
    return res.status(response.status).json(response.data);
  } catch (err) {
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }
    console.error('Error in PATCH /pages/:id gateway handler', err.message);
    return res
      .status(502)
      .json({ message: 'Page service unavailable', detail: err.message });
  }
});

// Move a page
router.patch('/:id/move', authMiddleware, async (req, res) => {
  try {
    const response = await pageClient.patch(`/pages/${req.params.id}/move`, req.body, {
      headers: {
        'x-user-id': req.userId,
      },
    });
    return res.status(response.status).json(response.data);
  } catch (err) {
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }
    console.error('Error in PATCH /pages/:id/move gateway handler', err.message);
    return res
      .status(502)
      .json({ message: 'Page service unavailable', detail: err.message });
  }
});

// Archive a page
router.patch('/:id/archive', authMiddleware, async (req, res) => {
  try {
    const response = await pageClient.patch(`/pages/${req.params.id}/archive`, req.body, {
      headers: {
        'x-user-id': req.userId,
      },
    });
    return res.status(response.status).json(response.data);
  } catch (err) {
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }
    console.error('Error in PATCH /pages/:id/archive gateway handler', err.message);
    return res
      .status(502)
      .json({ message: 'Page service unavailable', detail: err.message });
  }
});

// Delete a page
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const response = await pageClient.delete(`/pages/${req.params.id}`, {
      headers: {
        'x-user-id': req.userId,
      },
    });
    return res.status(response.status).send(response.data);
  } catch (err) {
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }
    console.error('Error in DELETE /pages/:id gateway handler', err.message);
    return res
      .status(502)
      .json({ message: 'Page service unavailable', detail: err.message });
  }
});

module.exports = router;

