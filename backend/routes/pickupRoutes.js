const express = require('express');
const { createRequest, getRequests, updateRequest } = require('../controllers/pickupController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, authorize('area_head', 'admin'), createRequest);
router.get('/', protect, getRequests);
router.put('/:id', protect, authorize('admin', 'worker'), updateRequest);

module.exports = router;
