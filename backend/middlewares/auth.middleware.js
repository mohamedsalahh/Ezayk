const jwt = require('jsonwebtoken');
const boom = require('@hapi/boom');
const { body } = require('express-validator');

const redisClient = require('../config/redis');
const { env, constants } = require('../config/constants');

exports.verifyAccessToken = async (req, res, next) => {
  const authHeader = req.get('Authorization');

  const accessToken = authHeader && authHeader.split(' ')[1];

  const decodedAccessToken = accessToken && jwt.verify(accessToken, env.ACCESS_TOKEN_SECRET);
  if (!decodedAccessToken) {
    return next(boom.unauthorized());
  }

  const savedBlockedAccessToken = await redisClient.get(`${decodedAccessToken.userId}_BL-token`);

  if (savedBlockedAccessToken === accessToken) {
    return next(boom.unauthorized());
  }

  req.userId = decodedAccessToken.userId;
  req.accessToken = accessToken;
  next();
};

exports.verifyRefreshToken = async (req, res, next) => {
  const refreshToken = req.cookies?.refreshToken;

  const decodedRefreshToken = refreshToken && jwt.verify(refreshToken, env.REFRESH_TOKEN_SECRET);
  if (!decodedRefreshToken) {
    return next(boom.unauthorized());
  }

  const savedRefreshToken = await redisClient.get(`${decodedRefreshToken.userId}_refresh-token`);
  if (savedRefreshToken !== refreshToken) {
    return next(boom.unauthorized());
  }

  req.userId = decodedRefreshToken.userId;
  next();
};

exports.normalizeUserCredentials = async (req, res, next) => {
  const email = req.body.email;

  const isEmail = email.match(constants.EMAIL_REGEX) ? true : false;
  if (isEmail) {
    await body('email').normalizeEmail().run(req);
  }

  next();
};
