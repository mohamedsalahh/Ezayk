const winston = require('winston');

const { env } = require('./constants');

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),
  ],
});

if (env.NODE_ENV === 'production') {
  logger.clear();
  // todo: add prod logger
}

module.exports = logger;
