const mongoose = require('mongoose');

const { env } = require('./constants');

exports.connectToMongoDB = async () => {
  try {
    await mongoose.connect(env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};
