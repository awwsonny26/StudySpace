const Category = require('./category.model');
const Course = require('./course.model');
const User = require('./user.model');

Category.hasMany(Course, {
  foreignKey: 'categoryId',
  as: 'courses'
});

Course.belongsTo(Category, {
  foreignKey: 'categoryId',
  as: 'category'
});

module.exports = {
  Category,
  Course,
  User
};
