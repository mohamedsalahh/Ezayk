const express = require('express');
const { body } = require('express-validator');

const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const authValidator = require('../validators/auth.validator');
const validate = require('../middlewares/validation.middleware');
const asyncErrorHandler = require('../middlewares/asyncErrorHandler.middleware');
const bruteforce = require('../config/bruteforce');

const router = express.Router();

router.post(
  '/signup',
  [body('username').trim(), body('email').normalizeEmail(), body('password').trim()],
  validate(authValidator.signup),
  asyncErrorHandler(authController.signup)
);

router.post(
  '/login',
  bruteforce.prevent,
  [body('email').trim(), body('password').trim()],
  validate(authValidator.login),
  asyncErrorHandler(authMiddleware.normalizeUserCredentials),
  asyncErrorHandler(authController.login)
);

router.post(
  '/logout',
  asyncErrorHandler(authMiddleware.verifyAccessToken),
  asyncErrorHandler(authController.logout)
);

router.post(
  '/confirm-email/:confirmationToken',
  asyncErrorHandler(authController.confirmUserEmail)
);

router.post(
  '/forgot-password',
  validate(authValidator.forgotPassword),
  asyncErrorHandler(authController.forgotPassword)
);

router.post(
  '/reset-password/:resetPasswordToken',
  validate(authValidator.resetPassword),
  asyncErrorHandler(authController.resetPassword)
);

router.get(
  '/token',
  asyncErrorHandler(authMiddleware.verifyRefreshToken),
  asyncErrorHandler(authController.getAccessToken)
);

module.exports = router;
