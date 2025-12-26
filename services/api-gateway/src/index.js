const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config');
const authRoutes = require('./authRoutes');
const workspaceRoutes = require('./workspaceRoutes');
const pageRoutes = require('./pageRoutes');
const workspacePageRoutes = require('./workspacePageRoutes');

function start() {
  const app = express();

  // CORS configuration
  const corsOptions = {
    origin: config.corsOrigin === '*' ? true : config.corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400, // 24 hours
    preflightContinue: false,
    optionsSuccessStatus: 204,
  };

  // Enable pre-flight across-the-board (must be before other routes)
  app.options('*', cors(corsOptions));

  app.use(cors(corsOptions));
  app.use(express.json());
  app.use(morgan('dev'));

  app.get('/api/v1/health', (req, res) => {
    res.json({ status: 'ok', service: 'api-gateway' });
  });

  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/workspaces/:workspaceId/pages', workspacePageRoutes);
  app.use('/api/v1/workspaces', workspaceRoutes);
  app.use('/api/v1/pages', pageRoutes);

  app.listen(config.port, () => {
    console.log(`API gateway listening on port ${config.port}`);
  });
}

start();

