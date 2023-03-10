const { createClient } = require('redis');

const { env } = require('./constants');

const redisClient = createClient(env.REDIS_PORT, env.REDIS_HOST);

redisClient.connect();

redisClient.on('connect', () => {
  console.log('connected to Redis');
});

redisClient.on('error', (err) => {
  console.log(err);
});

module.exports = redisClient;
