const boom = require('@hapi/boom');

const Group = require('../models/group.model');

exports.getGroup = async (req, res, next) => {
  const groupId = req.body.id;

  const group = groupId && (await Group.findById(groupId));
  if (!group) {
    return next(boom.notFound("The group doesn't exist"));
  }

  req.group = group;

  next();
};
