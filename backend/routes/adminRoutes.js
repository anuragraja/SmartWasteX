const express = require('express');
const { getPendingRequests, handleRequest } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/requests', protect, authorize('admin'), getPendingRequests);
router.post('/requests/:id', protect, authorize('admin'), handleRequest);

module.exports = router;
