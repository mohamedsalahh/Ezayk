const { RateLimiterRedis } = require('rate-limiter-flexible');

const { constants } = require('../config/constants');
const redisClient = require('../config/redis');

const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: constants.RATE_LIMITER_PERFIX,
  points: constants.RATE_LIMITER_POINTS,
  duration: constants.RATE_LIMITER_DURATION,
  blockDuration: constants.RATE_LIMITER_BLOCK_DURATION,
});

module.exports = rateLimiter;
