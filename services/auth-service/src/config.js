require('dotenv').config();

const config = {
  port: process.env.PORT || 4001,
  databaseUrl:
    process.env.DATABASE_URL ||
    'postgres://notesflow:notesflow@localhost:5432/notesflow',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379/0',
  natsUrl: process.env.NATS_URL || 'nats://localhost:4222',
  jwtSecret: process.env.JWT_SECRET || 'dev_jwt_secret_change_me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS || 10),
  userCacheTtlSeconds: Number(process.env.USER_CACHE_TTL_SECONDS || 3600),
};

module.exports = config;

