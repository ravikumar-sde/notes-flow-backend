const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config');
const authRoutes = require('./authRoutes');
const workspaceRoutes = require('./workspaceRoutes');

function start() {
  const app = express();

  app.use(
    cors({
      origin: config.corsOrigin === '*' ? true : config.corsOrigin,
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(morgan('dev'));

  app.get('/api/v1/health', (req, res) => {
    res.json({ status: 'ok', service: 'api-gateway' });
  });

  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/workspaces', workspaceRoutes);

  app.listen(config.port, () => {
    console.log(`API gateway listening on port ${config.port}`);
  });
}

start();

