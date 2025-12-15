function createWorkspaceCache({ redis, ttlSeconds }) {
  if (!redis) {
    throw new Error('redis client is required to create workspace cache');
  }

  const makeKey = (userId) => `user:${userId}:workspaces`;

  return {
    async getWorkspacesForUser(userId) {
      const cached = await redis.get(makeKey(userId));
      if (!cached) return null;
      try {
        return JSON.parse(cached);
      } catch {
        return null;
      }
    },

    async setWorkspacesForUser(userId, workspaces) {
      await redis.setex(
        makeKey(userId),
        ttlSeconds,
        JSON.stringify(workspaces)
      );
    },

    async invalidateUserWorkspaces(userId) {
      await redis.del(makeKey(userId));
    },
  };
}

module.exports = { createWorkspaceCache };

