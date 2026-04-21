const express = require('express');
const { runMysqlDemo } = require('../controllers/raw-query.controller');

const router = express.Router();

router.post('/demo', runMysqlDemo);

module.exports = router;
