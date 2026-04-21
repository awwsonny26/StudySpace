const { Category, Course } = require('../models');

const getCourses = async (req, res) => {
  try {
    const courses = await Course.findAll({
      include: [
        {
          model: Category,
          as: 'category'
        }
      ],
      order: [['id', 'ASC']]
    });

    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get courses.', error: error.message });
  }
};

const createCourse = async (req, res) => {
  try {
    const { title, description, author, duration, categoryId } = req.body;

    if (!title || !description || !author || !duration || !categoryId) {
      return res.status(400).json({
        message: 'title, description, author, duration and categoryId are required.'
      });
    }

    const category = await Category.findByPk(categoryId);

    if (!category) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    const course = await Course.create({
      title,
      description,
      author,
      duration,
      categoryId
    });

    const createdCourse = await Course.findByPk(course.id, {
      include: [
        {
          model: Category,
          as: 'category'
        }
      ]
    });

    return res.status(201).json(createdCourse);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create course.', error: error.message });
  }
};

const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, author, duration, categoryId } = req.body;

    const course = await Course.findByPk(id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    if (categoryId) {
      const category = await Category.findByPk(categoryId);

      if (!category) {
        return res.status(404).json({ message: 'Category not found.' });
      }
    }

    await course.update({
      title: title ?? course.title,
      description: description ?? course.description,
      author: author ?? course.author,
      duration: duration ?? course.duration,
      categoryId: categoryId ?? course.categoryId
    });

    const updatedCourse = await Course.findByPk(course.id, {
      include: [
        {
          model: Category,
          as: 'category'
        }
      ]
    });

    return res.json(updatedCourse);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update course.', error: error.message });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findByPk(id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    await course.destroy();
    return res.json({ message: 'Course deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete course.', error: error.message });
  }
};

module.exports = {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse
};
