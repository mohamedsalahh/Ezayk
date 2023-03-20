const jwt = require('jsonwebtoken');
const boom = require('@hapi/boom');
const { body } = require('express-validator');

const redisClient = require('../config/redis');
const { env } = require('../config/constants');

exports.verifyAccessToken = async (req, res, next) => {
  const authHeader = req.get('Authorization');

  const accessToken = authHeader && authHeader.split(' ')[1];

  let decodedAccessToken;
  try {
    decodedAccessToken = accessToken && jwt.verify(accessToken, env.ACCESS_TOKEN_SECRET);
  } catch (err) {
    return next(boom.unauthorized());
  }

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

  let decodedRefreshToken;
  try {
    decodedRefreshToken = refreshToken && jwt.verify(refreshToken, env.REFRESH_TOKEN_SECRET);
  } catch (err) {
    return next(boom.unauthorized());
  }

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

exports.isAdmin = (req, res, next) => {
  if (!user.isAdmin) {
    return next(boom.forbidden("You don't have the access for this"));
  }
  next();
};

exports.normalizeUserCredentials = async (req, res, next) => {
  const isEmail = req.isEmail;
  if (isEmail) {
    await body('email').normalizeEmail().run(req);
  }

  next();
};
