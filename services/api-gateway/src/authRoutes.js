const express = require('express');
const config = require('./config');
const { createClient } = require('./httpClient');

const router = express.Router();
const authClient = createClient(config.authServiceUrl);

router.post('/register', async (req, res) => {
  try {
    const response = await authClient.post('/auth/register', req.body);
    return res.status(response.status).json(response.data);
  } catch (err) {
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }
    console.error('Error in /auth/register gateway handler', err.message);
    return res
      .status(502)
      .json({ message: 'Auth service unavailable', detail: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const response = await authClient.post('/auth/login', req.body);
    return res.status(response.status).json(response.data);
  } catch (err) {
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }
    console.error('Error in /auth/login gateway handler', err.message);
    return res
      .status(502)
      .json({ message: 'Auth service unavailable', detail: err.message });
  }
});

router.get('/me', async (req, res) => {
  try {
    const response = await authClient.get('/auth/me', {
      headers: {
        authorization: req.headers['authorization'] || '',
      },
    });
    return res.status(response.status).json(response.data);
  } catch (err) {
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }
    console.error('Error in /auth/me gateway handler', err.message);
    return res
      .status(502)
      .json({ message: 'Auth service unavailable', detail: err.message });
  }
});

module.exports = router;

