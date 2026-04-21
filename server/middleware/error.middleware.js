const { logError } = require('../utils/logger');

const notFoundHandler = (req, res) => {
  res.status(404).json({ message: 'Route not found.' });
};

const errorHandler = (error, req, res, next) => {
  const statusCode = error.statusCode || 500;

  if (statusCode >= 500) {
    logError(error, {
      method: req.method,
      path: req.originalUrl
    });
  }

  res.status(statusCode).json({
    message: error.message || 'Internal server error.',
    ...(error.details ? { details: error.details } : {})
  });
};

module.exports = {
  notFoundHandler,
  errorHandler
};
