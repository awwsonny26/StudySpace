const { body, query } = require('express-validator');

const registerValidation = [
  body('email').trim().isEmail().withMessage('A valid email is required.'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must contain from 2 to 100 characters.'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must contain at least 6 characters.'),
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Password confirmation does not match.'),
  body('role')
    .optional()
    .isIn(['admin', 'user'])
    .withMessage('Role must be admin or user.'),
  body('adminRegistrationKey')
    .optional()
    .isString()
    .withMessage('Admin registration key must be a string.')
];

const loginValidation = [
  body('email').trim().isEmail().withMessage('A valid email is required.'),
  body('password').notEmpty().withMessage('Password is required.')
];

const refreshValidation = [
  body('refreshToken').optional().isString().withMessage('Refresh token must be a string.')
];

const forgotPasswordValidation = [
  body('email').trim().isEmail().withMessage('A valid email is required.')
];

const resetPasswordValidation = [
  body('token').notEmpty().withMessage('Reset token is required.'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must contain at least 6 characters.'),
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Password confirmation does not match.')
];

const confirmEmailValidation = [
  query('token').notEmpty().withMessage('Confirmation token is required.')
];

module.exports = {
  registerValidation,
  loginValidation,
  refreshValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  confirmEmailValidation
};
