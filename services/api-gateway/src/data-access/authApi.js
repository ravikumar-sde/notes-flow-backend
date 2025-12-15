function createAuthApi({ httpClient }) {
  if (!httpClient) {
    throw new Error('httpClient is required to create auth API');
  }

  return {
    register(body) {
      return httpClient.post('/auth/register', body);
    },

    login(body) {
      return httpClient.post('/auth/login', body);
    },

    getCurrentUser(authorizationHeader) {
      return httpClient.get('/auth/me', {
        headers: {
          authorization: authorizationHeader || '',
        },
      });
    },
  };
}

module.exports = { createAuthApi };

