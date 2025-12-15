const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

function createServer({ authController, authMiddleware, config }) {
  if (!authController || !authMiddleware || !config) {
    throw new Error('Missing dependencies for auth-service server');
  }

  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(morgan('dev'));

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'auth-service' });
  });

  app.post('/auth/register', authController.register);
  app.post('/auth/login', authController.login);
  app.get('/auth/me', authMiddleware, authController.me);

  return app;
}

module.exports = { createServer };

