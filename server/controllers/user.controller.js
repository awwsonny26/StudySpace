const { User } = require('../models');
const AppError = require('../utils/app-error');
const asyncHandler = require('../utils/async-handler');

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);

  if (!user) {
    throw new AppError(404, 'User not found.');
  }

  await user.destroy();

  res.json({ message: 'User deleted successfully.' });
});

module.exports = {
  deleteUser
};
