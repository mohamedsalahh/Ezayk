const express = require('express');
const { body } = require('express-validator');

const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const authValidator = require('../validators/auth.validator');
const validate = require('../middlewares/validation.middleware');
const asyncErrorHandler = require('../middlewares/asyncErrorHandler.middleware');

const router = express.Router();

router.put(
  '/signup',
  [body('username').trim(), body('email').normalizeEmail(), body('password').trim()],
  validate(authValidator.signup),
  asyncErrorHandler(authController.signup)
);

router.post(
  '/login',
  [body('email').trim().toLowerCase(), body('password').trim()],
  asyncErrorHandler(authMiddleware.normalizeUserCredentials),
  asyncErrorHandler(authController.login)
);

router.post(
  '/logout',
  asyncErrorHandler(authMiddleware.verifyAccessToken),
  asyncErrorHandler(authController.logout)
);

router.get('/confirmation/:token', asyncErrorHandler(authController.confirmUserEmail));

router.get(
  '/token',
  asyncErrorHandler(authMiddleware.verifyRefreshToken),
  asyncErrorHandler(authController.getAccessToken)
);

module.exports = router;
