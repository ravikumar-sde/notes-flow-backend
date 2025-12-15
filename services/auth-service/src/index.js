const config = require('./config');
const db = require('./db');
const { getRedisClient } = require('./redisClient');
const { publish } = require('./natsClient');
const authMiddleware = require('./authMiddleware');

const { createUserRepository, createUserCache } = require('./data-access');
const {
  createRegisterUser,
  createLoginUser,
  createGetCurrentUser,
} = require('./use-cases');
const { createAuthController } = require('./controllers');
const { createAuthPresenter } = require('./presenters');
const { createServer } = require('./server');

function buildContainer() {
  const redis = getRedisClient();

  const userRepository = createUserRepository({ dbClient: db });
  const userCache = createUserCache({
    redis,
    ttlSeconds: config.userCacheTtlSeconds,
  });

  const eventPublisher = {
    publish: (subject, data) => publish(subject, data),
  };

  const registerUser = createRegisterUser({
    userRepository,
    userCache,
    eventPublisher,
    config,
  });

  const loginUser = createLoginUser({
    userRepository,
    userCache,
    config,
  });

  const getCurrentUser = createGetCurrentUser({
    userRepository,
    userCache,
  });

  const authPresenter = createAuthPresenter();

  const authController = createAuthController({
    registerUser,
    loginUser,
    getCurrentUser,
    authPresenter,
  });

  const app = createServer({
    authController,
    authMiddleware,
    config,
  });

  return { app };
}

async function start() {
  const { app } = buildContainer();

  app.listen(config.port, () => {
    console.log(`Auth service listening on port ${config.port}`);
  });
}

start().catch((err) => {
  console.error('Failed to start auth service', err);
  process.exit(1);
});

module.exports = { buildContainer };
