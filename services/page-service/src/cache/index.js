const Redis = require('ioredis');
const config = require('../config');

let redisClient = null;

function getRedisClient() {
  if (!redisClient) {
    redisClient = new Redis(config.redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    redisClient.on('connect', () => {
      console.log('Redis connected (page-service)');
    });

    redisClient.on('error', (err) => {
      console.error('Redis error (page-service)', err);
    });
  }
  return redisClient;
}

module.exports = {
  getRedisClient,
};

