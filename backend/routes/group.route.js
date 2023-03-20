const express = require('express');

const groupController = require('../controllers/group.controller');
const asyncErrorHandler = require('../middlewares/asyncErrorHandler.middleware');
const validate = require('../middlewares/validation.middleware');
const groupMiddleware = require('../middlewares/group.middleware');
const groupValidator = require('../validators/group.validator');

const router = express.Router();

router
  .route('/')
  .get(validate(groupValidator.getGroups), asyncErrorHandler(groupController.getGroups))
  .post(validate(groupValidator.createGroup), asyncErrorHandler(groupController.createGroup));

router
  .route('/:id')
  .get(
    validate(groupValidator.getGroup),
    asyncErrorHandler(groupMiddleware.getGroup),
    asyncErrorHandler(groupController.getGroup)
  )
  .delete(
    validate(groupValidator.deleteGroup),
    asyncErrorHandler(groupMiddleware.getGroup),
    asyncErrorHandler(groupController.deleteGroup)
  );

router.put(
  '/:id/members',
  validate(groupValidator.addMembersToGroup),
  asyncErrorHandler(groupMiddleware.getGroup),
  asyncErrorHandler(groupController.addMembersToGroup)
);

router.put(
  '/:id/admins',
  validate(groupValidator.addAdminToGroup),
  asyncErrorHandler(groupMiddleware.getGroup),
  asyncErrorHandler(groupController.addAdminToGroup)
);

router.get(
  '/:id/join-link',
  validate(groupValidator.createGroupJoinLink),
  asyncErrorHandler(groupMiddleware.getGroup),
  asyncErrorHandler(groupController.createGroupJoinLink)
);

router.put(
  '/:id/image',
  validate(groupValidator.updateGroupImage),
  asyncErrorHandler(groupMiddleware.getGroup),
  groupController.updateGroupImage.single('file'),
  (req, res) => res.sendStatus(204)
);

module.exports = router;
