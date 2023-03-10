const express = require('express');

const userController = require('../controllers/user.controller');
const asyncErrorHandler = require('../middlewares/asyncErrorHandler.middleware');
const validate = require('../middlewares/validation.middleware');
const groupMiddleware = require('../middlewares/group.middleware');
const userValidator = require('../validators/user.validator');

const router = express.Router();

router.get('/:id', validate(userValidator.getUser), asyncErrorHandler(userController.getUser));

router.get('/profile', asyncErrorHandler(userController.getProfile));

router.patch(
  '/username',
  validate(userValidator.updateUsername),
  asyncErrorHandler(userController.updateUsername)
);

router.put('/profile-image');

router
  .route('/groups')
  .patch(
    validate(userValidator.joinGroup),
    asyncErrorHandler(groupMiddleware.getGroup),
    asyncErrorHandler(userController.joinGroup)
  )
  .patch(
    validate(userValidator.leaveGroup),
    asyncErrorHandler(groupMiddleware.getGroup),
    asyncErrorHandler(userController.leaveGroup)
  );

router.patch(
  '/groups/:token',
  validate(userValidator.joinGroupViaLink),
  asyncErrorHandler(userController.joinGroupViaLink)
);

module.exports = router;
