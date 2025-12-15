const Redis = require('ioredis');
const config = require('./config');

let client;

function getRedisClient() {
  if (!client) {
    client = new Redis(config.redisUrl);

    client.on('error', (err) => {
      console.error('Redis error', err);
    });

    client.on('connect', () => {
      console.log('Connected to Redis');
    });
  }

  return client;
}

module.exports = {
  getRedisClient,
};

