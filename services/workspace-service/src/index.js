const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config');
const { workspaceRoutes, invitationRoutes, publicInvitationRoutes } = require('./routes');

async function start() {
  const app = express();

  app.use(
    cors({
      origin: config.corsOrigin === '*' ? true : config.corsOrigin,
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(morgan('dev'));

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'workspace-service' });
  });

  // Public invitation routes (no workspace prefix)
  app.use('/invitations', publicInvitationRoutes);

  // Workspace-specific invitation routes
  app.use('/workspaces/:workspaceId/invitations', invitationRoutes);

  // Workspace routes
  app.use('/workspaces', workspaceRoutes);

  app.listen(config.port, () => {
    console.log(`Workspace service listening on port ${config.port}`);
  });
}

start().catch((err) => {
  console.error('Failed to start workspace service', err);
  process.exit(1);
});

