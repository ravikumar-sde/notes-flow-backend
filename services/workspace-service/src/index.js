const config = require('./config');
const db = require('./db');
const { getRedisClient } = require('./redisClient');
const { publish } = require('./natsClient');

const { createWorkspaceRepository, createWorkspaceCache } = require('./data-access');
const {
	createCreateWorkspace,
	createListWorkspacesForUser,
} = require('./use-cases');
const { createWorkspaceController } = require('./controllers');
const { createWorkspacePresenter } = require('./presenters');
const { createServer } = require('./server');

function buildContainer() {
  const redis = getRedisClient();

  const workspaceRepository = createWorkspaceRepository({ dbClient: db });
  const workspaceCache = createWorkspaceCache({
    redis,
    ttlSeconds: config.workspaceCacheTtlSeconds,
  });

  const eventPublisher = {
    publish: (subject, data) => publish(subject, data),
  };

  const createWorkspace = createCreateWorkspace({
	  workspaceRepository,
	  workspaceCache,
	  eventPublisher,
	});

	const listWorkspacesForUser = createListWorkspacesForUser({
	  workspaceRepository,
	  workspaceCache,
	});

	const workspacePresenter = createWorkspacePresenter();

	const workspaceController = createWorkspaceController({
	  createWorkspace,
	  listWorkspacesForUser,
	  workspacePresenter,
	});

  const app = createServer({
    workspaceController,
    config,
  });

  return { app };
}

async function start() {
  const { app } = buildContainer();

  app.listen(config.port, () => {
    console.log(`Workspace service listening on port ${config.port}`);
  });
}

start().catch((err) => {
  console.error('Failed to start workspace service', err);
  process.exit(1);
});

module.exports = { buildContainer };
