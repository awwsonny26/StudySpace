const express = require('express');

const { deleteUser } = require('../controllers/user.controller');
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { handleValidation } = require('../middleware/validate.middleware');
const { deleteUserValidation } = require('../validators/profile.validator');

const router = express.Router();

router.delete('/:id', authenticate, requireRole('admin'), deleteUserValidation, handleValidation, deleteUser);

module.exports = router;
