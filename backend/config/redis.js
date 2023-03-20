const Redis = require('ioredis');

const logger = require('./logger');
const { env } = require('./constants');

const redisClient = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
});

redisClient.on('connect', () => {
  logger.info('connected to Redis');
});

redisClient.on('error', (err) => {
  logger.error(err);
});

module.exports = redisClient;
