const jwt = require('jsonwebtoken');
const boom = require('@hapi/boom');

const User = require('../models/user.model');
const redisClient = require('../config/redis');
const { env } = require('../config/constants');

exports.isAuth = async (req, res, next) => {
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

  const savedBlockedAccessToken = await redisClient.get(`BL-token_${decodedAccessToken.userId}`);

  if (savedBlockedAccessToken === accessToken) {
    return next(boom.unauthorized());
  }

  req.accessToken = accessToken;

  const userId = decodedAccessToken.userId;

  const user = userId && (await User.findById(userId));
  if (!user) {
    return next(boom.notFound('User not found'));
  }

  req.user = user;

  next();
};

exports.tryAuth = async (req, res, next) => {
  const authHeader = req.get('Authorization');

  const accessToken = authHeader && authHeader.split(' ')[1];

  let decodedAccessToken;
  try {
    decodedAccessToken = accessToken && jwt.verify(accessToken, env.ACCESS_TOKEN_SECRET);
  } catch (err) {
    return next();
  }

  if (!decodedAccessToken) {
    return next();
  }

  const savedBlockedAccessToken = await redisClient.get(`BL-token_${decodedAccessToken.userId}`);

  if (savedBlockedAccessToken === accessToken) {
    return next();
  }

  const userId = decodedAccessToken.userId;
  const user = userId && (await User.findById(userId));

  req.user = user;

  next();
};

exports.isEmailConfirmed = (req, res, next) => {
  const user = req.user;

  if (!user?.isEmailConfirmed) {
    return next(boom.forbidden('Confirm your e-mail first'));
  }

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

  const savedRefreshToken = await redisClient.get(`refresh-token_${decodedRefreshToken.userId}`);
  if (savedRefreshToken !== refreshToken) {
    return next(boom.unauthorized());
  }

  req.userId = decodedRefreshToken.userId;
  next();
};
