const bcrypt = require('bcryptjs');

module.exports = function makeLogin({ db, redisClient, natsClient, config, signToken }) {
  return async function login(req, res) {
    const Joi = require('joi');

    const schema = Joi.object({
      body: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
      })
    });

    const { error, value } = schema.validate({ body: req.body }, { abortEarly: false });

    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        details: error.details.map(d => ({ field: d.path.join('.'), message: d.message }))
      });
    }

    const { email, password } = value.body;

    try {
      const result = await db.query(
        'SELECT id, email, password_hash, name, created_at FROM users WHERE email = $1',
        [email.toLowerCase()]
      );

      if (result.rowCount === 0) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const user = result.rows[0];
      const valid = await bcrypt.compare(password, user.password_hash);

      if (!valid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      delete user.password_hash;
      const token = signToken(user);

      const redis = redisClient.getRedisClient();
      const cacheKey = `user:${user.id}`;
      await redis.setex(
        cacheKey,
        config.userCacheTtlSeconds,
        JSON.stringify(user)
      );

      return res.json({ token, user });
    } catch (err) {
      console.error('Error in login', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
};

