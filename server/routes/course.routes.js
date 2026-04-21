const express = require('express');
const {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse
} = require('../controllers/course.controller');

const router = express.Router();

router.get('/', getCourses);
router.post('/', createCourse);
router.put('/:id', updateCourse);
router.delete('/:id', deleteCourse);

module.exports = router;
