const express = require('express');
const router = express.Router();
const {getAdminStats} = require('../controllers/dashboardControllers');

router.get('/admin/stats', getAdminStats);

module.exports = router;