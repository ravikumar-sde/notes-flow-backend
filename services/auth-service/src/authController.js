const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('./config');
const db = require('./db');
const { getRedisClient } = require('./redisClient');
const { publish } = require('./natsClient');

function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
}

async function register(req, res) {
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

    const redis = getRedisClient();
    const cacheKey = `user:${user.id}`;
    await redis.setex(
      cacheKey,
      config.userCacheTtlSeconds,
      JSON.stringify(user)
    );

    await publish('user.registered', { id: user.id, email: user.email, name });

    return res.status(201).json({ token, user });
  } catch (err) {
    console.error('Error in register', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function login(req, res) {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

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

    const redis = getRedisClient();
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
}

async function me(req, res) {
  const userId = req.userId;
  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const redis = getRedisClient();
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
}

module.exports = {
  register,
  login,
  me,
};

