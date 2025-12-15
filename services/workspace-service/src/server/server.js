const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

function createServer({ workspaceController, config }) {
  if (!workspaceController || !config) {
    throw new Error('Missing dependencies for workspace-service server');
  }

  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(morgan('dev'));

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'workspace-service' });
  });

  app.post('/workspaces', workspaceController.createWorkspace);
  app.get('/workspaces', workspaceController.listWorkspacesForUser);

  return app;
}

module.exports = { createServer };

