const express = require('express');
const { uploadWaste, getAllUploads, getAreaUploads, getWorkerUploads } = require('../controllers/wasteController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.post('/upload', protect, authorize('worker', 'admin'), upload.single('image'), uploadWaste);
router.get('/', protect, getAllUploads);
router.get('/area/:area', protect, getAreaUploads);
router.get('/worker/:workerId', protect, getWorkerUploads);

module.exports = router;
