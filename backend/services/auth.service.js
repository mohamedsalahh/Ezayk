const boom = require('@hapi/boom');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const redisClient = require('../config/redis');
const User = require('../models/user.model');
const userService = require('./user.service');
const mailService = require('./mail.service');
const { templates } = require('../config/sendgrid');
const { formatLink } = require('../utils/files-paths');
const { env } = require('../config/constants');
const {
  createAccessToken,
  createRefreshToken,
  createConfirmationEmailToken,
  createResetPasswordToken,
} = require('../utils/create-tokens');

exports.signup = async (user) => {
  const { username, email, password } = user;

  const createdUser = await User.create({ name: username, username, email, password });

  return userService.getUserProfile(createdUser);
};

exports.login = async (user) => {
  const savedUser = await this.isUserCredentialsValid(user);

  if (savedUser instanceof Error) {
    return savedUser;
  }

  const tokens = await this.createTokens(savedUser.id);

  return { user: userService.getUserProfile(savedUser), tokens };
};

exports.isUserCredentialsValid = async (user) => {
  const { email, username, password } = user;

  if (!email && !username) {
    return boom.badRequest('Username/E-mail is required');
  }

  if (!password) {
    return boom.badRequest('Password is required');
  }

  const savedUser = await User.findOne({ $or: [{ email: email }, { username: username }] }).select(
    '+password'
  );

  if (!savedUser) {
    return boom.notFound('User not found');
  }

  if (!savedUser.isEmailConfirmed) {
    await this.sendConfirmationEmail(savedUser);
  }

  const isPasswordCorrect = await bcrypt.compare(password, savedUser.password);

  if (!isPasswordCorrect) {
    return boom.unauthorized('Incorrect username or password');
  }

  return savedUser;
};

exports.createTokens = async (userId) => {
  const accessToken = createAccessToken(userId);
  const refreshToken = createRefreshToken(userId);

  await redisClient.set(`refresh-token_${userId}`, refreshToken);

  return { accessToken, refreshToken };
};

exports.sendConfirmationEmail = async (user) => {
  const emailToken = createConfirmationEmailToken(user.id);
  const confirmationEmailUrl = formatLink(env.FRONTEND_URL, 'auth', 'confirm-email', emailToken);

  await mailService.sendEmail(user.email, templates.CONFIRMATION_EMAIL, {
    name: user.name,
    confirmationEmailUrl,
  });
};

exports.confirmUserEmail = async (token) => {
  try {
    const decodedToken = token && jwt.verify(token, env.CONFIRMATION_EMAIL_TOKEN_SECRET);

    if (!decodedToken) {
      return boom.badRequest('Invalid confirmation link');
    }

    const updatedUser = await User.findByIdAndUpdate(
      decodedToken.userId,
      { isEmailConfirmed: true },
      { new: true }
    )
      .select('-groups')
      .lean({ virtuals: true });

    if (!updatedUser) {
      return boom.badRequest('Invalid confirmation link');
    }

    return userService.getUserProfile(updatedUser);
  } catch (err) {
    return boom.badImplementation();
  }
};

exports.forgetPassword = async (email) => {
  const user = await User.findOne({ email: email }).select('+resetPasswordToken');

  if (!user) {
    return boom.notFound('E-mail not found');
  }

  const resetPasswordToken = createResetPasswordToken(user.id);

  user.resetPasswordToken = resetPasswordToken;

  await user.save();

  const resetPasswordUrl = formatLink(
    env.FRONTEND_URL,
    'auth',
    'reset-password',
    resetPasswordToken
  );

  await mailService.sendEmail(user.email, templates.RESET_PASSWORD_EMAIL, {
    name: user.name,
    resetPasswordUrl,
  });
};

exports.resetPassword = async (token, newPassword) => {
  try {
    const decodedToken = token && jwt.verify(token, env.RESET_PASSWORD_TOKEN_SECRET);

    if (!decodedToken) {
      return boom.badRequest('Invalid reset password token');
    }

    const user = await User.findById(decodedToken.userId)
      .select('+password +resetPasswordToken')
      .lean();

    if (!user || user.resetPasswordToken !== token) {
      return boom.badRequest('Invalid reset password token');
    }

    user.password = newPassword;
    user.resetPasswordToken = null;

    await user.save();
    await redisClient.del(`refresh-token_${user.id}`);
  } catch (err) {
    return boom.badImplementation();
  }
};
