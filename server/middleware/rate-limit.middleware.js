const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: Number(process.env.LOGIN_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.LOGIN_MAX_ATTEMPTS) || 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many authentication attempts. Please try again later.'
  }
});

module.exports = {
  authLimiter
};
