const { User } = require('../models');
const AppError = require('../utils/app-error');
const { verifyAccessToken } = require('../utils/tokens');

const getBearerToken = (req) => {
  const authHeader = req.headers.authorization || '';

  if (!authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.slice(7);
};

const authenticate = async (req, res, next) => {
  try {
    const token = getBearerToken(req);

    if (!token) {
      throw new AppError(401, 'Access token is required.');
    }

    const payload = verifyAccessToken(token);
    const user = await User.findByPk(payload.sub);

    if (!user) {
      throw new AppError(401, 'User for this token was not found.');
    }

    req.user = user;
    req.auth = payload;
    next();
  } catch (error) {
    next(error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError'
      ? new AppError(401, 'Invalid or expired access token.')
      : error);
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new AppError(403, 'You do not have permission to perform this action.'));
  }

  return next();
};

module.exports = {
  authenticate,
  requireRole
};
