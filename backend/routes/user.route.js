const express = require('express');
const { query } = require('express-validator');

const userController = require('../controllers/user.controller');
const asyncErrorHandler = require('../middlewares/asyncErrorHandler.middleware');
const validate = require('../middlewares/validation.middleware');
const groupMiddleware = require('../middlewares/group.middleware');
const userValidator = require('../validators/user.validator');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

router.get(
  '/',
  [query('skip').toInt(), query('limit').toInt()],
  validate(userValidator.getUsers),
  asyncErrorHandler(userController.getUsers)
);

router.put(
  '/username',
  validate(userValidator.updateUsername),
  asyncErrorHandler(userController.updateUsername)
);

router.put(
  '/groups-privacy',
  validate(userValidator.changeGroupsPrivacy),
  asyncErrorHandler(userController.changeGroupsPrivacy)
);

router.put('/profile-image', userController.updateProfileImage.single('file'), (req, res) =>
  res.sendStatus(204)
);

router
  .route('/groups')
  .put(
    validate(userValidator.joinGroup),
    asyncErrorHandler(groupMiddleware.getGroup),
    asyncErrorHandler(userController.joinGroup)
  )
  .delete(
    validate(userValidator.leaveGroup),
    asyncErrorHandler(groupMiddleware.getGroup),
    asyncErrorHandler(userController.leaveGroup)
  );

router.put(
  '/groups/link',
  validate(userValidator.joinGroupViaLink),
  asyncErrorHandler(userController.joinGroupViaLink)
);

router
  .route('/:id')
  .get(validate(userValidator.getUser), asyncErrorHandler(userController.getUser))
  .delete(
    authMiddleware.isAdmin,
    validate(userValidator.deleteUser),
    asyncErrorHandler(userController.deleteUser)
  );

module.exports = router;
