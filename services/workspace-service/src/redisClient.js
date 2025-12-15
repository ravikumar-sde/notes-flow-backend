const Redis = require('ioredis');
const config = require('./config');

let client;

function getRedisClient() {
  if (!client) {
    client = new Redis(config.redisUrl);

    client.on('error', (err) => {
      console.error('Workspace Redis error', err);
    });

    client.on('connect', () => {
      console.log('Workspace service connected to Redis');
    });
  }

  return client;
}

module.exports = {
  getRedisClient,
};

