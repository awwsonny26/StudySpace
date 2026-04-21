const bcrypt = require('bcryptjs');

const { User } = require('../models');
const AppError = require('../utils/app-error');
const asyncHandler = require('../utils/async-handler');
const { createRandomToken, buildConfirmEmailUrl } = require('../utils/tokens');

const sanitizeUser = (user) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role,
  isEmailConfirmed: user.isEmailConfirmed,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
});

const getProfile = asyncHandler(async (req, res) => {
  res.json({
    user: sanitizeUser(req.user)
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { name, email } = req.body;
  let confirmationUrl = null;

  if (email && email !== req.user.email) {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser && existingUser.id !== req.user.id) {
      throw new AppError(409, 'User with this email already exists.');
    }

    req.user.email = email;
    req.user.isEmailConfirmed = false;
    req.user.emailConfirmationToken = createRandomToken();
    confirmationUrl = buildConfirmEmailUrl(req.user.emailConfirmationToken);
    console.log(`Email confirmation link for ${req.user.email}: ${confirmationUrl}`);
  }

  if (name) {
    req.user.name = name;
  }

  await req.user.save();

  res.json({
    message: 'Profile updated successfully.',
    user: sanitizeUser(req.user),
    ...(confirmationUrl
      ? {
          emailConfirmation: {
            message: 'New email confirmation link was generated and logged to the console.',
            confirmationUrl
          }
        }
      : {})
  });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const isPasswordValid = await bcrypt.compare(currentPassword, req.user.passwordHash);
  if (!isPasswordValid) {
    throw new AppError(400, 'Current password is incorrect.');
  }

  req.user.passwordHash = await bcrypt.hash(newPassword, 10);
  req.user.refreshToken = null;
  await req.user.save();

  res.clearCookie('studyspace_refresh_token');
  res.json({ message: 'Password changed successfully. Please log in again.' });
});

module.exports = {
  getProfile,
  updateProfile,
  changePassword
};
