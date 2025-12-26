require('dotenv').config();

const config = {
  port: process.env.PORT || 4000,
  authServiceUrl:
    process.env.AUTH_SERVICE_URL || 'http://localhost:4001',
  workspaceServiceUrl:
    process.env.WORKSPACE_SERVICE_URL || 'http://localhost:4002',
  pageServiceUrl:
    process.env.PAGE_SERVICE_URL || 'http://localhost:4003',
  jwtSecret: process.env.JWT_SECRET || 'dev_jwt_secret_change_me',
  corsOrigin: process.env.CORS_ORIGIN || '*',
};

module.exports = config;

