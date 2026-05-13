const express = require('express');
const { getRecyclers, updatePrices, createRequest, getRequests, updateRequestStatus, getEcoStats } = require('../controllers/recycleController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

const router = express.Router();

const storage = multer.diskStorage({
  destination(req, file, cb) { cb(null, 'uploads/'); },
  filename(req, file, cb) { cb(null, `${Date.now()}-${file.originalname}`); }
});
const upload = multer({ storage });

router.get('/recyclers', protect, getRecyclers);
router.post('/profile', protect, updatePrices);
router.post('/request', protect, upload.single('image'), createRequest);
router.get('/requests', protect, getRequests);
router.put('/request/:id', protect, updateRequestStatus);
router.get('/stats', protect, getEcoStats);

module.exports = router;
