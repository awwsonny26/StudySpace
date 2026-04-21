const { validationResult } = require('express-validator');
const AppError = require('../utils/app-error');

const handleValidation = (req, res, next) => {
  const result = validationResult(req);

  if (result.isEmpty()) {
    return next();
  }

  return next(
    new AppError(
      400,
      'Validation failed.',
      result.array().map((item) => ({
        field: item.path,
        message: item.msg
      }))
    )
  );
};

module.exports = {
  handleValidation
};
