const bcrypt = require('bcryptjs');

const sequelize = require('./database');
const { Category, Course, User } = require('../models');

const initializeDatabase = async () => {
  await sequelize.authenticate();
  await sequelize.sync();

  const categoryCount = await Category.count();

  if (categoryCount === 0) {
    const categories = await Category.bulkCreate([
      {
        name: 'Frontend',
        description: 'HTML, CSS, JavaScript and responsive web layout.'
      },
      {
        name: 'Backend',
        description: 'Node.js, Express, APIs and server-side development.'
      },
      {
        name: 'Data Basics',
        description: 'SQL fundamentals and practical data work.'
      }
    ]);

    await Course.bulkCreate([
      {
        title: 'HTML and CSS Basics',
        description: 'Introduction to semantic markup and modern styling.',
        author: 'Anna Koval',
        duration: '4 weeks',
        categoryId: categories[0].id
      },
      {
        title: 'Node.js and Express Starter',
        description: 'Simple backend development with routes and controllers.',
        author: 'Ihor Marchenko',
        duration: '5 weeks',
        categoryId: categories[1].id
      },
      {
        title: 'SQL for Study Projects',
        description: 'Basic queries, joins and table design for labs.',
        author: 'Olena Rudenko',
        duration: '4 weeks',
        categoryId: categories[2].id
      }
    ]);
  }

  const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@studyspace.local';
  const adminExists = await User.findOne({ where: { email: adminEmail } });

  if (!adminExists) {
    await User.create({
      email: adminEmail,
      name: process.env.DEFAULT_ADMIN_NAME || 'StudySpace Admin',
      passwordHash: await bcrypt.hash(process.env.DEFAULT_ADMIN_PASSWORD || 'admin123', 10),
      role: 'admin',
      isEmailConfirmed: true
    });
  }
};

module.exports = { initializeDatabase };
