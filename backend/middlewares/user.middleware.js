const boom = require('@hapi/boom');

const User = require('../models/user.model');

exports.getUser = async (req, res, next) => {
  const userId = req.userId;

  const user = userId && (await User.findById(userId, '-password'));
  if (!user) {
    return next(boom.notFound("Couldn't find the user"));
  }

  req.user = user;

  next();
};
