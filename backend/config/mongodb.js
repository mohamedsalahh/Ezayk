const mongoose = require('mongoose');

const logger = require('./logger');
const { env } = require('./constants');

exports.connectToMongoDB = () => {
  mongoose.connect(env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  logger.info('Connected to MongoDB');
};
