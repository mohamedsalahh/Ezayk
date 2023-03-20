const ExpressBrute = require('express-brute');
const RedisStore = require('express-brute-redis');

const { env, constants } = require('./constants');

const store = new RedisStore({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  prefix: constants.BRUTE_FORCE_PREFIX,
});

const bruteforce = new ExpressBrute(store, { minWait: 1000 });

module.exports = bruteforce;
