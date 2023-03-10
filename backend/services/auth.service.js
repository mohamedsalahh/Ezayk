const boom = require('@hapi/boom');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const redisClient = require('../config/redis');
const User = require('../models/user.model');
const userService = require('./user.service');
const { sendEmail } = require('./mail.service');
const { templates } = require('../config/sendgrid');
const { formatLink } = require('../utils/files-paths');
const { env } = require('../config/constants');
const {
  createAccessToken,
  createRefreshToken,
  createConfirmationEmailToken,
} = require('../utils/create-tokens');

exports.signup = async (user) => {
  const { username, email, password } = user;

  encryptedPassword = await bcrypt.hash(password, 10);

  const createdUser = new User({
    username,
    email,
    password: encryptedPassword,
  });

  await createdUser.save();

  await this.sendConfirmationEmail(createdUser);

  return userService.getUserPublicData(createdUser.id, createdUser);
};

exports.sendConfirmationEmail = async (user) => {
  const emailToken = createConfirmationEmailToken(user.id);
  const confirmationEmailUrl = formatLink(env.BACKEND_URL, 'auth', 'confirmation', emailToken);

  await sendEmail(user.email, templates.CONFIRMATION_EMAIL, {
    username: user.username,
    confirmationEmailUrl,
  });
};

exports.login = async (user) => {
  const savedUser = await this.isUserCredentialsValid(user);
  if (savedUser instanceof Error) {
    return savedUser;
  }

  const tokens = await this.createTokens(savedUser.id);

  return { user: savedUser, tokens };
};

exports.isUserCredentialsValid = async (user) => {
  const { email, password } = user;
  if (!email || !password) {
    return boom.badRequest('Wrong email or password');
  }

  const savedUser = await User.findOne({ $or: [{ email: email }, { username: email }] });
  if (!savedUser) {
    return boom.unauthorized('Wrong email or password');
  }

  if (!savedUser.isEmailConfirmed) {
    await this.sendConfirmationEmail(savedUser);
    return boom.unauthorized('Confirm your email to login');
  }

  const isPasswordCorrect = await bcrypt.compare(password, savedUser.password);
  if (!isPasswordCorrect) {
    return boom.unauthorized('Wrong email or password');
  }

  return userService.getUserPublicData(savedUser.id, savedUser);
};

exports.createTokens = async (userId) => {
  const accessToken = createAccessToken(userId);
  const refreshToken = createRefreshToken(userId);

  await redisClient.set(`${userId}_refresh-token`, refreshToken);

  return { accessToken, refreshToken };
};

exports.confirmUserEmail = async (token) => {
  const decodedToken = token && jwt.verify(token, env.EMAIL_TOKEN_SECRET);
  if (!decodedToken) {
    return boom.unauthorized();
  }

  const savedUser = await User.findById(decodedToken.userId);
  if (!savedUser) {
    return boom.unauthorized();
  }

  savedUser.isEmailConfirmed = true;

  await savedUser.save();

  return userService.getUserPublicData(savedUser.id, savedUser);
};
