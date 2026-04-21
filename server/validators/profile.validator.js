const { body, param } = require('express-validator');

const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must contain from 2 to 100 characters.'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Email must be valid.'),
  body('role')
    .optional()
    .isIn(['admin', 'user'])
    .withMessage('Role must be admin or user.')
];

const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required.'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must contain at least 6 characters.'),
  body('confirmNewPassword')
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage('New password confirmation does not match.')
];

const deleteUserValidation = [
  param('id').isInt({ min: 1 }).withMessage('User id must be a positive integer.')
];

module.exports = {
  updateProfileValidation,
  changePasswordValidation,
  deleteUserValidation
};
