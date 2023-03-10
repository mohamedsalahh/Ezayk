const boom = require('@hapi/boom');

const { validationResult, matchedData } = require('express-validator');

module.exports = (validations) => async (req, res, next) => {
  await Promise.all(validations.map((validation) => validation.run(req)));

  const errors = validationResult(req);

  req.body = matchedData(req);

  if (!errors.isEmpty()) {
    return next(boom.badData(errors.array()[0].msg));
  }
  next();
};
