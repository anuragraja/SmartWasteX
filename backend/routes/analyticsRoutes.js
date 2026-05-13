const express = require('express');
const { getDashboardStats, getHeatmapData, getSocietyRankings } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/stats', protect, getDashboardStats);
router.get('/heatmap', protect, getHeatmapData);
router.get('/rankings', protect, getSocietyRankings);
router.get('/top-users', protect, require('../controllers/analyticsController').getTopUsers);

module.exports = router;
