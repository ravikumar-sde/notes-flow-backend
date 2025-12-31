module.exports = function makeMe({ db, redisClient, natsClient, config, signToken }) {
  return async function me(req, res) {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      const redis = redisClient.getRedisClient();
      const cacheKey = `user:${userId}`;
      const cached = await redis.get(cacheKey);
      if (cached) {
        return res.json({ user: JSON.parse(cached), source: 'cache' });
      }

      const result = await db.query(
        'SELECT id, email, name, created_at FROM users WHERE id = $1',
        [userId]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      const user = result.rows[0];
      await redis.setex(
        cacheKey,
        config.userCacheTtlSeconds,
        JSON.stringify(user)
      );

      return res.json({ user, source: 'db' });
    } catch (err) {
      console.error('Error in me handler', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
};

