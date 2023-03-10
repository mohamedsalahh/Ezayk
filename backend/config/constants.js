require('dotenv').config();

module.exports.env = {
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
  EMAIL_TOKEN_SECRET: process.env.EMAIL_TOKEN_SECRET,
  GROUP_JOIN_LINK_TOKEN_SECRET: process.env.GROUP_JOIN_LINK_TOKEN_SECRET,
};

module.exports.constants = {
  MAX_PROFILE_IMAGE_FILE_SIZE: 1024 * 1024 * 2,
  ACCESS_TOKEN_TIME: '1d', // toso: change this to 30s
  REFRESH_TOKEN_TIME: '14d',
  EMAIL_TOKEN_TIME: '1d',
  REFRESH_TOKEN_COOKIE_MAX_AGE: 1000 * 60 * 60 * 24 * 14,
  EMAIL_REGEX: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
  GROUP_MAX_USER_NUMBER: 100,
  DEFAULT_USER_IMAGE: 'default-profile-img.jpg',
  DEFAULT_GROUP_IMAGE: 'default-group-img.jpg',
};
