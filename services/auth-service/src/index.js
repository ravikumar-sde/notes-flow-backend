const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config');
const authRoutes = require('./authRoutes');

async function start() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(morgan('dev'));

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'auth-service' });
  });

  app.use('/auth', authRoutes);

  app.listen(config.port, () => {
    console.log(`Auth service listening on port ${config.port}`);
  });
}

start().catch((err) => {
  console.error('Failed to start auth service', err);
  process.exit(1);
});

