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
  createResetPasswordToken,
} = require('../utils/create-tokens');

/**
 * Creates a new user and saves it to the database.
 * @async
 * @param {Object} user - An object containing the user's information.
 * @param {string} user.username - The user's username.
 * @param {string} user.email - The user's email address.
 * @param {string} user.password - The user's password.
 * @returns {Promise<Object>} - The user's profile.
 */
exports.signup = async (user) => {
  const { username, email, password } = user;

  const createdUser = new User({
    username,
    email,
    password,
  });

  await createdUser.save();

  await this.sendConfirmationEmail(createdUser);

  return await userService.getProfile(createdUser);
};

/**
 * Sends a confirmation email to the user with a confirmation link.
 * @async
 * @param {Object} user - An object containing user details such as user id, email, and username.
 * @returns {Promise<void>} - A Promise that resolves when the email is sent.
 */
exports.sendConfirmationEmail = async (user) => {
  const emailToken = createConfirmationEmailToken(user.id);
  const confirmationEmailUrl = formatLink(env.FRONTEND_URL, 'auth', 'confirm-email', emailToken);

  await sendEmail(user.email, templates.CONFIRMATION_EMAIL, {
    username: user.username,
    confirmationEmailUrl,
  });
};

/**
 * Logs in a user and returns the user profile and tokens.
 * @async
 * @param {Object} user - An object containing user details such as email and password.
 * @returns {Promise<Object|Error>} - A Promise that resolves with an object containing the user profile and tokens, otherwise an Error object.
 */
exports.login = async (user) => {
  const savedUser = await this.isUserCredentialsValid(user);
  if (savedUser instanceof Error) {
    return savedUser;
  }

  const tokens = await this.createTokens(savedUser.id);

  return { user: await userService.getProfile(savedUser), tokens };
};

/**
 * Checks if the user credentials are valid and returns the user object if valid.
 * @async
 * @param {Object} user - An object containing user details such as email and password.
 * @returns {Promise<Object|Error>} - A Promise that resolves with an object containing the user details if the user credentials are valid, otherwise an Error object.
 */
exports.isUserCredentialsValid = async (user) => {
  const { email, password } = user;
  if (!email || !password) {
    return boom.badRequest('Wrong e-mail or password');
  }

  const savedUser = await User.findOne({ $or: [{ email: email }, { username: email }] }).select(
    '+password +isEmailConfirmed'
  );
  if (!savedUser) {
    return boom.unauthorized('Wrong e-mail or password');
  }

  if (!savedUser.isEmailConfirmed) {
    await this.sendConfirmationEmail(savedUser);
    return boom.unauthorized('Confirm your email first to login');
  }

  const isPasswordCorrect = await bcrypt.compare(password, savedUser.password);
  if (!isPasswordCorrect) {
    return boom.unauthorized('Wrong e-mail or password');
  }

  return savedUser;
};

/**
 * Creates an access token and a refresh token for the user.
 * @async
 * @param {string} userId - The user id.
 * @returns {Promise<Object>} - A Promise that resolves with an object containing the access token and refresh token.
 */
exports.createTokens = async (userId) => {
  const accessToken = createAccessToken(userId);
  const refreshToken = createRefreshToken(userId);

  await redisClient.set(`${userId}_refresh-token`, refreshToken);

  return { accessToken, refreshToken };
};

/**
 * Confirms the user's email and returns the user profile.
 * @async
 * @param {string} token - The email confirmation token.
 * @returns {Promise<void|Error>} - A Promise that resolves to undefined if the email confirmation is successful, otherwise an Error object.
 */
exports.confirmUserEmail = async (token) => {
  try {
    const decodedToken = token && jwt.verify(token, env.EMAIL_TOKEN_SECRET);

    if (!decodedToken) {
      return boom.unauthorized();
    }

    const savedUser = await User.findById(decodedToken.userId).select('+isEmailConfirmed');

    if (!savedUser) {
      return boom.unauthorized();
    }

    savedUser.isEmailConfirmed = true;

    await savedUser.save();
  } catch (err) {
    return boom.unauthorized();
  }
};

/**
 * Sends a reset password email to the user.
 * @async
 * @param {string} email - The email of the user.
 * @returns {Promise<void|Error>} - Returns a promise that resolves to undefined or an error if the email is not found or the user's email is not confirmed.
 */
exports.forgetPassword = async (email) => {
  const user = await User.findOne({ email: email }).select('+isEmailConfirmed +resetPasswordToken');
  if (!user) {
    return boom.notFound('E-mail not found');
  }

  if (!user.isEmailConfirmed) {
    await this.sendConfirmationEmail(user);
    return boom.unauthorized('Confirm your e-mail first');
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

  await sendEmail(user.email, templates.RESET_PASSWORD_EMAIL, {
    username: user.username,
    resetPasswordUrl,
  });
};

/**
 * Resets the password of the user.
 * @async
 * @param {string} token - The reset password token.
 * @param {string} newPassword - The new password.
 * @returns {Promise<void|Error>} - Returns a promise that resolves to undefined or an error if the token is invalid or the user is not found.
 */
exports.resetPassword = async (token, newPassword) => {
  try {
    const decodedToken = token && jwt.verify(token, env.RESET_PASSWORD_TOKEN_SECRET);

    if (!decodedToken) {
      return boom.badRequest('Invalid token');
    }

    const savedUser = await User.findById(decodedToken.userId).select(
      '+password +resetPasswordToken'
    );

    if (!savedUser || savedUser.resetPasswordToken !== token) {
      return boom.badRequest('Invalid token');
    }

    savedUser.password = newPassword;
    savedUser.resetPasswordToken = null;
    await savedUser.save();
  } catch (err) {
    return boom.badRequest('Invalid token');
  }
};
