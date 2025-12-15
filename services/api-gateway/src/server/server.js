const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

function createServer({ config, authController, workspaceController, authMiddleware }) {
  if (!config || !authController || !workspaceController || !authMiddleware) {
    throw new Error('Missing dependencies for api-gateway server');
  }

  const app = express();

  app.use(
    cors({
      origin: config.corsOrigin === '*' ? undefined : config.corsOrigin,
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(morgan('dev'));

  app.get('/api/v1/health', (req, res) => {
    res.json({ status: 'ok', service: 'api-gateway' });
  });

  // Auth routes
  app.post('/api/v1/auth/register', authController.register);
  app.post('/api/v1/auth/login', authController.login);
  app.get('/api/v1/auth/me', authController.me);

  // Workspace routes (protected)
  app.post(
    '/api/v1/workspaces',
    authMiddleware,
    workspaceController.createWorkspace
  );
  app.get(
    '/api/v1/workspaces',
    authMiddleware,
    workspaceController.listWorkspaces
  );

  return app;
}

module.exports = { createServer };

