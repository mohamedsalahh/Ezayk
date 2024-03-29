require('dotenv').config();

module.exports.env = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT || 8080,
  MONGO_URI: process.env.MONGO_URI,
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: process.env.REDIS_PORT,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
  FRONTEND_URL: process.env.FRONTEND_URL,
  BACKEND_URL: process.env.BACKEND_URL,
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM,
  EMAIL_USERNAME: process.env.EMAIL_USERNAME,
  CONFIRMATION_EMAIL_TOKEN_SECRET: process.env.CONFIRMATION_EMAIL_TOKEN_SECRET,
  GROUP_JOIN_LINK_TOKEN_SECRET: process.env.GROUP_JOIN_LINK_TOKEN_SECRET,
  RESET_PASSWORD_TOKEN_SECRET: process.env.RESET_PASSWORD_TOKEN_SECRET,
};

module.exports.constants = {
  MAX_PROFILE_IMAGE_FILE_SIZE: 1024 * 1024 * 2,
  MAX_GROUP_IMAGE_FILE_SIZE: 1024 * 1024 * 2,
  ACCESS_TOKEN_TIME: '30s',
  REFRESH_TOKEN_TIME: '14d',
  CONFIRMATION_EMAIL_TOKEN_TIME: '1d',
  RESET_PASSWORD_TOKEN_TIME: '15m',
  BRUTE_FORCE_RETRIES: 10,
  BRUTE_FORCE_WAITING_TIME: 10000,
  BRUTE_FORCE_PREFIX: 'BF_',
  RATE_LIMITER_POINTS: 5,
  RATE_LIMITER_DURATION: 1,
  RATE_LIMITER_BLOCK_DURATION: 60 * 5,
  RATE_LIMITER_PERFIX: 'RL_',
  REFRESH_TOKEN_COOKIE_MAX_AGE: 1000 * 60 * 60 * 24 * 14,
  GROUP_MAX_MEMBERS_NUMBER: 100,
  EMAIL_REGEX: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
  NAME_REGEX: /^[a-zA-Z]+(?: [a-zA-Z]+)*$/,
  USERNAME_REGEX: /^[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*$/,
  DEFAULT_USER_IMAGE: 'default-profile-img.png',
  DEFAULT_GROUP_IMAGE: 'default.png',
};
