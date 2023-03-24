const mongoose = require('mongoose');

const logger = require('./logger');
const { env } = require('./constants');

exports.connectToMongoDB = async () => {
  try {
    await mongoose.connect(env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    logger.info('Connected to MongoDB');
  } catch (err) {
    logger.error(err);
  }
};
