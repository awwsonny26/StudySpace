const express = require('express');

const {
  getProfile,
  updateProfile,
  changePassword
} = require('../controllers/profile.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { handleValidation } = require('../middleware/validate.middleware');
const {
  updateProfileValidation,
  changePasswordValidation
} = require('../validators/profile.validator');

const router = express.Router();

router.get('/', authenticate, getProfile);
router.patch('/', authenticate, updateProfileValidation, handleValidation, updateProfile);
router.patch(
  '/change-password',
  authenticate,
  changePasswordValidation,
  handleValidation,
  changePassword
);

module.exports = router;
