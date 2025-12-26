const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config');
const { workspaceRoutes } = require('./routes');

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

  app.use('/workspaces', workspaceRoutes);

  app.listen(config.port, () => {
    console.log(`Workspace service listening on port ${config.port}`);
  });
}

start().catch((err) => {
  console.error('Failed to start workspace service', err);
  process.exit(1);
});

