const express = require('express');
const { getWorkers, getMyTasks, acceptTask, updateTaskStatus } = require('../controllers/workerController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, authorize('admin', 'society_head'), getWorkers);
router.get('/history/:workerId', protect, authorize('admin', 'society_head'), require('../controllers/workerController').getWorkerHistory);
router.get('/tasks', protect, authorize('worker'), getMyTasks);
router.put('/tasks/:id/accept', protect, authorize('worker'), acceptTask);
router.put('/tasks/:id/status', protect, authorize('worker'), updateTaskStatus);

module.exports = router;
