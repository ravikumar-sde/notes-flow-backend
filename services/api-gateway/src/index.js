const config = require('./config');
const { createClient } = require('./httpClient');
const authMiddleware = require('./authMiddleware');

const { createAuthApi, createWorkspaceApi } = require('./data-access');
const {
  createRegisterUserUseCase,
  createLoginUserUseCase,
  createGetCurrentUserUseCase,
  createCreateWorkspaceUseCase,
  createListWorkspacesUseCase,
} = require('./use-cases');
const { createAuthController, createWorkspaceController } = require('./controllers');
const { createAuthPresenter, createWorkspacePresenter } = require('./presenters');
const { createServer } = require('./server');

function buildContainer() {
	const authClient = createClient(config.authServiceUrl);
	const workspaceClient = createClient(config.workspaceServiceUrl);

	const authApi = createAuthApi({ httpClient: authClient });
	const workspaceApi = createWorkspaceApi({ httpClient: workspaceClient });

		const registerUser = createRegisterUserUseCase({ authApi });
		const loginUser = createLoginUserUseCase({ authApi });
		const getCurrentUser = createGetCurrentUserUseCase({ authApi });
	
		const createWorkspace = createCreateWorkspaceUseCase({ workspaceApi });
		const listWorkspaces = createListWorkspacesUseCase({ workspaceApi });

		const authPresenter = createAuthPresenter();
		const workspacePresenter = createWorkspacePresenter();
	
		const authController = createAuthController({
			registerUser,
			loginUser,
			getCurrentUser,
			authPresenter,
		});
		const workspaceController = createWorkspaceController({
			createWorkspace,
			listWorkspaces,
			workspacePresenter,
		});
	
		const app = createServer({
			config,
			authController,
			workspaceController,
			authMiddleware,
		});

  return { app };
}

async function start() {
  const { app } = buildContainer();

  app.listen(config.port, () => {
    console.log(`API gateway listening on port ${config.port}`);
  });
}

start().catch((err) => {
  console.error('Failed to start API gateway', err);
  process.exit(1);
});

module.exports = { buildContainer };
