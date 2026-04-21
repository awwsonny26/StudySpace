const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const accessTokenSecret = process.env.JWT_ACCESS_SECRET || 'studyspace_access_secret';
const refreshTokenSecret = process.env.JWT_REFRESH_SECRET || 'studyspace_refresh_secret';
const frontendUrl = process.env.FRONTEND_URL || `http://localhost:${process.env.PORT || 3000}`;

const getJwtConfig = () => ({
  accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
});

const createAccessToken = (user) =>
  jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role
    },
    accessTokenSecret,
    { expiresIn: getJwtConfig().accessExpiresIn }
  );

const createRefreshToken = (user) =>
  jwt.sign(
    {
      sub: user.id
    },
    refreshTokenSecret,
    { expiresIn: getJwtConfig().refreshExpiresIn }
  );

const verifyAccessToken = (token) => jwt.verify(token, accessTokenSecret);
const verifyRefreshToken = (token) => jwt.verify(token, refreshTokenSecret);

const createRandomToken = () => crypto.randomBytes(32).toString('hex');

const buildConfirmEmailUrl = (token) =>
  `${frontendUrl}/api/auth/confirm-email?token=${encodeURIComponent(token)}`;

const buildResetPasswordUrl = (token) =>
  `${frontendUrl}/reset-password?token=${encodeURIComponent(token)}`;

module.exports = {
  createAccessToken,
  createRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  createRandomToken,
  buildConfirmEmailUrl,
  buildResetPasswordUrl
};
