const boom = require('@hapi/boom');

const rateLimiter = require('../config/rateLimiter');

const rateLimiterMiddleware = (req, res, next) => {
  rateLimiter
    .consume(req.ip)
    .then((rateLimiterRes) => {
      res.set({
        'X-RateLimit-Limit': 5,
        'X-RateLimit-Remaining': rateLimiterRes.remainingPoints,
        'Retry-After': Math.round(rateLimiterRes.msBeforeNext / 1000) || 1,
        'X-RateLimit-Reset': new Date(Date.now() + rateLimiterRes.msBeforeNext),
      });
      next();
    })
    .catch((rateLimiterRes) => {
      res.set({
        'X-RateLimit-Limit': 5,
        'X-RateLimit-Remaining': rateLimiterRes.remainingPoints,
        'Retry-After': Math.round(rateLimiterRes.msBeforeNext / 1000) || 1,
        'X-RateLimit-Reset': new Date(Date.now() + rateLimiterRes.msBeforeNext),
      });
      next(boom.tooManyRequests());
    });
};

module.exports = rateLimiterMiddleware;
