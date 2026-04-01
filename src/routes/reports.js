const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.get('/overview', reportController.overview);
router.get('/daily', reportController.daily);
router.get('/monthly', reportController.monthly);
router.get('/yearly', reportController.yearly);
router.get('/by-category', reportController.byCategory);

module.exports = router;
