const { RateLimiterRedis } = require('rate-limiter-flexible');
const ExpressBruteFlexible = require('rate-limiter-flexible/lib/ExpressBruteFlexible');

const { constants } = require('../config/constants');
const redisClient = require('../config/redis');

const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: constants.RATE_LIMITER_PERFIX,
  points: constants.RATE_LIMITER_POINTS,
  duration: constants.RATE_LIMITER_DURATION,
  blockDuration: constants.RATE_LIMITER_BLOCK_DURATION,
});

const bruteforce = new ExpressBruteFlexible(ExpressBruteFlexible.LIMITER_TYPES.REDIS, {
  storeClient: redisClient,
  freeRetries: constants.BRUTE_FORCE_RETRIES,
  maxWait: constants.BRUTE_FORCE_WAITING_TIME,
  lifetime: 30,
  prefix: constants.BRUTE_FORCE_PREFIX,
});

module.exports = { rateLimiter, bruteforce };
