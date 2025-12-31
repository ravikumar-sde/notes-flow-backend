const bcrypt = require('bcryptjs');

module.exports = function makeRegister({ db, redisClient, natsClient, config, signToken }) {
  return async function register(req, res) {
    const { email, password, name } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
      const existing = await db.query('SELECT id FROM users WHERE email = $1', [
        email.toLowerCase(),
      ]);
      if (existing.rowCount > 0) {
        return res.status(409).json({ message: 'User already exists' });
      }

      const passwordHash = await bcrypt.hash(password, config.bcryptSaltRounds);

      const insertRes = await db.query(
        'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name, created_at',
        [email.toLowerCase(), passwordHash, name || null]
      );

      const user = insertRes.rows[0];
      const token = signToken(user);

      const redis = redisClient.getRedisClient();
      const cacheKey = `user:${user.id}`;
      await redis.setex(
        cacheKey,
        config.userCacheTtlSeconds,
        JSON.stringify(user)
      );

      await natsClient.publish('user.registered', { id: user.id, email: user.email, name });

      return res.status(201).json({ token, user });
    } catch (err) {
      console.error('Error in register', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
};

