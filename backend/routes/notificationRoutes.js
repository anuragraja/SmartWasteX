const express = require('express');
const { getNotifications, markAsRead, sendNotification } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getNotifications);
router.post('/', protect, sendNotification);
router.put('/:id/read', protect, markAsRead);

module.exports = router;
