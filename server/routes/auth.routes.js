const express = require('express');

const {
  register,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  confirmEmail,
  googleAuth,
  googleCallback
} = require('../controllers/auth.controller');
const { authLimiter } = require('../middleware/rate-limit.middleware');
const { handleValidation } = require('../middleware/validate.middleware');
const {
  registerValidation,
  loginValidation,
  refreshValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  confirmEmailValidation
} = require('../validators/auth.validator');

const router = express.Router();

router.post('/register', registerValidation, handleValidation, register);
router.post('/login', authLimiter, loginValidation, handleValidation, login);
router.post('/refresh', refreshValidation, handleValidation, refresh);
router.post('/logout', logout);
router.post('/forgot-password', forgotPasswordValidation, handleValidation, forgotPassword);
router.post('/reset-password', resetPasswordValidation, handleValidation, resetPassword);
router.get('/confirm-email', confirmEmailValidation, handleValidation, confirmEmail);
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

module.exports = router;
