const express = require('express');
const { register, login, getMe, loginFace, registerFace, updateStatus } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/login-face', loginFace);
router.post('/register-face', protect, registerFace);
router.get('/me', protect, getMe);
router.put('/status', protect, updateStatus);

module.exports = router;
