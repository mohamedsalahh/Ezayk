const express = require('express');
const { query, body } = require('express-validator');

const userController = require('../controllers/user.controller');
const authController = require('../controllers/auth.controller');
const asyncErrorHandler = require('../middlewares/asyncErrorHandler.middleware');
const authMiddleware = require('../middlewares/auth.middleware');
const userValidator = require('../validators/user.validator');
const validate = require('../middlewares/validation.middleware');

const router = express.Router();

router
  .route('/')
  .get(
    [
      query('q').optional().trim(),
      query('skip').optional().toInt(),
      query('limit').optional().toInt(),
    ],
    validate(userValidator.getUsers),
    asyncErrorHandler(userController.getUsers)
  )
  .patch(
    [
      body('username').optional().trim(),
      body('name').optional().trim(),
      body('bio').optional().trim(),
      body('isGroupsPrivate').optional().toBoolean(),
    ],
    asyncErrorHandler(authMiddleware.isAuth),
    authMiddleware.isEmailConfirmed,
    validate(userValidator.updateUser),
    asyncErrorHandler(userController.updateUser)
  )
  .delete(
    asyncErrorHandler(authMiddleware.isAuth),
    asyncErrorHandler(userController.deleteUser),
    asyncErrorHandler(authController.logout)
  );

router
  .route('/profile-image')
  .put(
    asyncErrorHandler(authMiddleware.isAuth),
    authMiddleware.isEmailConfirmed,
    validate(userValidator.updateUserProfileImage),
    userController.updateUserProfileImage.single('file'),
    (req, res) => {
      res.sendStatus(204);
    }
  );

router
  .route('/:username/groups')
  .get(
    [
      query('q').optional().trim(),
      query('name').optional().trim(),
      query('skip').optional().toInt(),
      query('limit').optional().toInt(),
    ],
    asyncErrorHandler(authMiddleware.tryAuth),
    validate(userValidator.getUserGroups),
    asyncErrorHandler(userController.getUserGroups)
  )
  .put(
    asyncErrorHandler(authMiddleware.isAuth),
    authMiddleware.isEmailConfirmed,
    validate(userValidator.joinGroupViaLink),
    asyncErrorHandler(userController.joinGroupViaLink)
  );

router
  .route('/:username/groups/:groupId')
  .delete(
    asyncErrorHandler(authMiddleware.isAuth),
    authMiddleware.isEmailConfirmed,
    validate(userValidator.leaveGroup),
    asyncErrorHandler(userController.leaveGroup)
  );

router
  .route('/:username')
  .get(
    asyncErrorHandler(authMiddleware.tryAuth),
    validate(userValidator.getUser),
    asyncErrorHandler(userController.getUser)
  );

module.exports = router;
