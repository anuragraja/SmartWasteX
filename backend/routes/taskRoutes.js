const express = require('express');
const { getTasks, updateTaskStatus } = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getTasks);
router.put('/:id/status', protect, authorize('worker', 'admin'), updateTaskStatus);

module.exports = router;
