const express = require('express');
const { createComplaint, getComplaints } = require('../controllers/complaintController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.post('/', protect, upload.single('image'), createComplaint);
router.get('/', protect, getComplaints);

module.exports = router;
