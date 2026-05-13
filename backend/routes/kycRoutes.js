const express = require('express');
const { submitKYC, getKYCStatus, getAllKYC, verifyKYC } = require('../controllers/kycController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.post('/upload', protect, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No file uploaded' });
  }
  const url = `http://localhost:5000/uploads/${req.file.filename}`;
  res.status(200).json({ success: true, url });
});

router.post('/submit', protect, authorize('worker', 'society_head'), submitKYC);
router.get('/status', protect, getKYCStatus);
router.get('/all', protect, authorize('admin'), getAllKYC);
router.put('/:id/verify', protect, authorize('admin'), verifyKYC);

module.exports = router;
