const boom = require('@hapi/boom');

const { rateLimiter } = require('../config/rateLimiter');
const { constants } = require('../config/constants');

const rateLimiterMiddleware = (req, res, next) => {
  rateLimiter
    .consume(req.ip)
    .then((rateLimiterRes) => {
      res.set({
        'X-RateLimit-Limit': constants.RATE_LIMITER_POINTS,
        'X-RateLimit-Remaining': rateLimiterRes.remainingPoints,
        'Retry-After': rateLimiterRes.msBeforeNext / 1000,
        'X-RateLimit-Reset': new Date(Date.now() + rateLimiterRes.msBeforeNext),
      });
      next();
    })
    .catch((rateLimiterRes) => {
      res.set({
        'X-RateLimit-Limit': constants.RATE_LIMITER_POINTS,
        'X-RateLimit-Remaining': rateLimiterRes.remainingPoints,
        'Retry-After': rateLimiterRes.msBeforeNext / 1000,
        'X-RateLimit-Reset': new Date(Date.now() + rateLimiterRes.msBeforeNext),
      });
      next(boom.tooManyRequests());
    });
};

module.exports = rateLimiterMiddleware;
