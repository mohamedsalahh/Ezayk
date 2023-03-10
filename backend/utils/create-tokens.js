const jwt = require('jsonwebtoken');

const { env, constants } = require('../config/constants');

exports.createAccessToken = (userId) => {
  const accessToken = jwt.sign(
    {
      userId,
    },
    env.ACCESS_TOKEN_SECRET,
    { expiresIn: constants.ACCESS_TOKEN_TIME }
  );

  return accessToken;
};

exports.createRefreshToken = (userId) => {
  const refreshToken = jwt.sign(
    {
      userId,
    },
    env.REFRESH_TOKEN_SECRET,
    { expiresIn: constants.REFRESH_TOKEN_TIME }
  );

  return refreshToken;
};

exports.createJoinLinkToken = (groupId) => {
  const joinLinkToken = jwt.sign(
    {
      groupId,
    },
    env.GROUP_JOIN_LINK_TOKEN_SECRET
  );

  return joinLinkToken;
};

exports.createConfirmationEmailToken = (userId) => {
  const confirmationEmailToken = jwt.sign(
    {
      userId,
    },
    env.EMAIL_TOKEN_SECRET,
    { expiresIn: constants.EMAIL_TOKEN_TIME }
  );

  return confirmationEmailToken;
};
