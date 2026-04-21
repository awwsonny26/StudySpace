const { Category, Course } = require('../models');

const getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      include: [
        {
          model: Course,
          as: 'courses'
        }
      ],
      order: [['id', 'ASC']]
    });

    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get categories.', error: error.message });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({ message: 'name and description are required.' });
    }

    const category = await Category.create({ name, description });
    return res.status(201).json(category);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create category.', error: error.message });
  }
};

module.exports = {
  getCategories,
  createCategory
};
