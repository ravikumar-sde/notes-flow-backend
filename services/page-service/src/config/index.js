require('dotenv').config();

const config = {
  port: process.env.PORT || 4003,
  databaseUrl:
    process.env.DATABASE_URL ||
    'postgres://notesflow:notesflow@localhost:5432/notesflow',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379/0',
  natsUrl: process.env.NATS_URL || 'nats://localhost:4222',
  pageCacheTtlSeconds: Number(
    process.env.PAGE_CACHE_TTL_SECONDS || 600
  ),
  corsOrigin: process.env.CORS_ORIGIN || '*',
};

module.exports = config;

