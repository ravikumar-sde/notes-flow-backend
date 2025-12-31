const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config');
const { workspacePageRoutes } = require('./routes');

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
    res.json({ status: 'ok', service: 'page-service' });
  });

  // Workspace pages routes (all page operations are workspace-scoped)
  app.use('/workspaces/:workspaceId/pages', workspacePageRoutes);

  app.listen(config.port, () => {
    console.log(`Page service listening on port ${config.port}`);
  });
}

start().catch((err) => {
  console.error('Failed to start page service', err);
  process.exit(1);
});

