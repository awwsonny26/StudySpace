const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

const { User } = require('../models');
const AppError = require('../utils/app-error');
const asyncHandler = require('../utils/async-handler');
const {
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
  createRandomToken,
  buildConfirmEmailUrl,
  buildResetPasswordUrl
} = require('../utils/tokens');

const refreshCookieName = 'studyspace_refresh_token';
const refreshCookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000
};

const sanitizeUser = (user) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role,
  isEmailConfirmed: user.isEmailConfirmed,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
});

const issueTokens = async (user, res) => {
  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshToken(user);

  user.refreshToken = refreshToken;
  await user.save();

  res.cookie(refreshCookieName, refreshToken, refreshCookieOptions);

  return { accessToken, refreshToken };
};

const register = asyncHandler(async (req, res) => {
  const { email, name, password, role, adminRegistrationKey } = req.body;

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new AppError(409, 'User with this email already exists.');
  }

  const requestedRole = role === 'admin' ? 'admin' : 'user';

  if (requestedRole === 'admin') {
    const expectedAdminKey = process.env.ADMIN_REGISTRATION_KEY || 'studyspace_admin_key';

    if (adminRegistrationKey !== expectedAdminKey) {
      throw new AppError(403, 'Admin registration key is invalid.');
    }
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const emailConfirmationToken = createRandomToken();

  const user = await User.create({
    email,
    name,
    passwordHash,
    role: requestedRole,
    emailConfirmationToken,
    isEmailConfirmed: requestedRole === 'admin'
  });

  const confirmationUrl = requestedRole === 'user'
    ? buildConfirmEmailUrl(emailConfirmationToken)
    : null;

  if (confirmationUrl) {
    console.log(`Email confirmation link for ${user.email}: ${confirmationUrl}`);
  }

  const tokens = await issueTokens(user, res);

  res.status(201).json({
    message: 'User registered successfully.',
    user: sanitizeUser(user),
    tokens,
    ...(confirmationUrl
      ? {
          emailConfirmation: {
            message: 'Email confirmation link was generated and logged to the console.',
            confirmationUrl
          }
        }
      : {})
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new AppError(401, 'Invalid email or password.');
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new AppError(401, 'Invalid email or password.');
  }

  const tokens = await issueTokens(user, res);

  res.json({
    message: 'Login successful.',
    user: sanitizeUser(user),
    tokens
  });
});

const refresh = asyncHandler(async (req, res) => {
  const tokenFromCookie = req.cookies[refreshCookieName];
  const tokenFromBody = req.body.refreshToken;
  const refreshToken = tokenFromBody || tokenFromCookie;

  if (!refreshToken) {
    throw new AppError(401, 'Refresh token is required.');
  }

  let payload;

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (error) {
    throw new AppError(401, 'Invalid or expired refresh token.');
  }

  const user = await User.findByPk(payload.sub);
  if (!user || user.refreshToken !== refreshToken) {
    throw new AppError(401, 'Refresh token is not recognized.');
  }

  const tokens = await issueTokens(user, res);

  res.json({
    message: 'Token refreshed successfully.',
    tokens
  });
});

const logout = asyncHandler(async (req, res) => {
  const tokenFromCookie = req.cookies[refreshCookieName];
  const tokenFromBody = req.body.refreshToken;
  const refreshToken = tokenFromBody || tokenFromCookie;

  if (refreshToken) {
    const user = await User.findOne({ where: { refreshToken } });
    if (user) {
      user.refreshToken = null;
      await user.save();
    }
  }

  res.clearCookie(refreshCookieName);
  res.json({ message: 'Logout successful.' });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ where: { email } });

  if (!user) {
    return res.json({
      message: 'If the email exists, a password reset link has been generated.'
    });
  }

  const token = createRandomToken();
  user.passwordResetToken = token;
  user.passwordResetExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
  await user.save();

  const resetUrl = buildResetPasswordUrl(token);
  console.log(`Password reset link for ${user.email}: ${resetUrl}`);

  return res.json({
    message: 'Password reset link has been generated and logged to the console.',
    resetUrl
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  const user = await User.findOne({
    where: {
      passwordResetToken: token,
      passwordResetExpiresAt: {
        [Op.gt]: new Date()
      }
    }
  });

  if (!user) {
    throw new AppError(400, 'Reset token is invalid or expired.');
  }

  user.passwordHash = await bcrypt.hash(password, 10);
  user.passwordResetToken = null;
  user.passwordResetExpiresAt = null;
  user.refreshToken = null;
  await user.save();

  res.clearCookie(refreshCookieName);
  res.json({ message: 'Password has been reset successfully.' });
});

const confirmEmail = asyncHandler(async (req, res) => {
  const { token } = req.query;
  const user = await User.findOne({ where: { emailConfirmationToken: token } });

  if (!user) {
    throw new AppError(400, 'Email confirmation token is invalid.');
  }

  user.isEmailConfirmed = true;
  user.emailConfirmationToken = null;
  await user.save();

  res.json({
    message: 'Email confirmed successfully.',
    user: sanitizeUser(user)
  });
});

const googleAuth = asyncHandler(async (req, res) => {
  const { GOOGLE_CLIENT_ID, GOOGLE_REDIRECT_URI } = process.env;

  if (!GOOGLE_CLIENT_ID || !GOOGLE_REDIRECT_URI) {
    throw new AppError(
      501,
      'Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_REDIRECT_URI in .env.'
    );
  }

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent'
  });

  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
});

const googleCallback = asyncHandler(async (req, res) => {
  const { code } = req.query;
  const {
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
  } = process.env;

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
    throw new AppError(
      501,
      'Google OAuth callback is not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and GOOGLE_REDIRECT_URI.'
    );
  }

  if (!code) {
    throw new AppError(400, 'Google authorization code is required.');
  }

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code'
    })
  });

  if (!tokenResponse.ok) {
    throw new AppError(400, 'Failed to exchange Google authorization code.');
  }

  const tokenData = await tokenResponse.json();
  const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`
    }
  });

  if (!userResponse.ok) {
    throw new AppError(400, 'Failed to load Google user profile.');
  }

  const googleUser = await userResponse.json();
  let user = await User.findOne({
    where: {
      [Op.or]: [{ email: googleUser.email }, { googleId: googleUser.id }]
    }
  });

  if (!user) {
    user = await User.create({
      email: googleUser.email,
      name: googleUser.name || googleUser.email.split('@')[0],
      passwordHash: await bcrypt.hash(createRandomToken(), 10),
      role: 'user',
      isEmailConfirmed: true,
      googleId: googleUser.id
    });
  } else if (!user.googleId) {
    user.googleId = googleUser.id;
    user.isEmailConfirmed = true;
    await user.save();
  }

  const tokens = await issueTokens(user, res);

  res.json({
    message: 'Google login successful.',
    user: sanitizeUser(user),
    tokens
  });
});

module.exports = {
  register,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  confirmEmail,
  googleAuth,
  googleCallback
};
