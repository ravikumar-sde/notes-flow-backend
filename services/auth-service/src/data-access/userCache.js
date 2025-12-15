function createUserCache({ redis, ttlSeconds }) {
  if (!redis) {
    throw new Error('redis client is required to create user cache');
  }

  const prefix = 'user:';

  return {
    async getUser(id) {
      const cached = await redis.get(`${prefix}${id}`);
      if (!cached) return null;
      try {
        return JSON.parse(cached);
      } catch {
        return null;
      }
    },

    async setUser(user) {
      const key = `${prefix}${user.id}`;
      await redis.setex(key, ttlSeconds, JSON.stringify(user));
    },

    async invalidateUser(id) {
      await redis.del(`${prefix}${id}`);
    },
  };
}

module.exports = { createUserCache };

