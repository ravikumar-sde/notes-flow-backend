function createWorkspaceApi({ httpClient }) {
  if (!httpClient) {
    throw new Error('httpClient is required to create workspace API');
  }

  return {
    createWorkspace(body, { userId }) {
      return httpClient.post('/workspaces', body, {
        headers: {
          'x-user-id': userId,
        },
      });
    },

    listWorkspaces({ userId }) {
      return httpClient.get('/workspaces', {
        headers: {
          'x-user-id': userId,
        },
      });
    },
  };
}

module.exports = { createWorkspaceApi };

