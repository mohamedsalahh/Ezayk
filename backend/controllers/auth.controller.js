const { env, constants } = require('../config/constants');
const redisClient = require('../config/redis');
const authService = require('../services/auth.service');

exports.signup = async (req, res, next) => {
  const user = await authService.signup(req.body);

  res.status(201).json({ message: 'Signed-up successfully', data: { user } });
};

exports.login = async (req, res, next) => {
  const userTokens = await authService.login(req.body);

  if (userTokens instanceof Error) {
    return next(userTokens);
  }

  const {
    user,
    tokens: { accessToken, refreshToken },
  } = userTokens;

  res.cookie('refreshToken', refreshToken, {
    maxAge: constants.REFRESH_TOKEN_COOKIE_MAX_AGE,
    httpOnly: true,
    sameSite: 'strict',
    path: '/',
  });

  res.status(200).json({
    message: 'Logged-in successfully',
    data: {
      user,
      accessToken,
    },
  });
};

exports.logout = async (req, res, next) => {
  await redisClient.del(`${req.userId}_refresh-token`);
  await redisClient.set(`${req.userId}_BL-token`, req.accessToken);

  res.status(200).json({ message: 'Logged-out successfully', data: { userId: req.userId } });
};

exports.getAccessToken = async (req, res, next) => {
  const { accessToken, refreshToken } = await authService.createTokens(req.userId);

  res.cookie('refreshToken', refreshToken, {
    maxAge: constants.REFRESH_TOKEN_COOKIE_MAX_AGE,
    httpOnly: true,
    sameSite: 'strict',
    path: '/',
  });

  res.status(200).json({
    message: 'Access token generated successfully',
    data: { accessToken, userId: req.userId },
  });
};

exports.confirmUserEmail = async (req, res, next) => {
  const token = req.params.token;

  const user = await authService.confirmUserEmail(token);
  if (user instanceof Error) {
    return next(user);
  }

  res.redirect(env.FRONTEND_URL);
};
