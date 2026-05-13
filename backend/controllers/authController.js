const User = require('../models/User');
const PendingRequest = require('../models/PendingRequest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      area: user.area,
      isApproved: user.isApproved
    }
  });
};

// @route POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role = 'public', area } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email and password are required' });
    }

    // Check existing user
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ success: false, error: 'An account with this email already exists' });
    }

    if (role === 'public' || role === 'admin') {
      // Create directly with auto-approval
      const user = await User.create({
        name,
        email: email.toLowerCase(),
        password,
        role,
        area: area || '',
        isApproved: true
      });
      return sendTokenResponse(user, 201, res);
    }

    // worker / society_head → pending queue
    const pendingExists = await PendingRequest.findOne({ email: email.toLowerCase() });
    if (pendingExists) {
      return res.status(400).json({ success: false, error: 'A registration request with this email is already pending' });
    }

    // Hash password before storing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const request = await PendingRequest.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      area: area || ''
    });

    return res.status(201).json({
      success: true,
      message: `Your ${role.replace('_', ' ')} account request has been submitted. The Admin will review and approve your account.`,
      data: { id: request._id, name: request.name, email: request.email, role: request.role }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(400).json({ success: false, error: err.message });
  }
};

// @route POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide email and password' });
    }

    // Find user (include password for comparison)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      // Check if they're in pending queue
      const pending = await PendingRequest.findOne({ email: email.toLowerCase() });
      if (pending && pending.status === 'Pending') {
        return res.status(401).json({
          success: false,
          error: 'Your account is pending Admin approval. You will be notified once approved.'
        });
      }
      if (pending && pending.status === 'Rejected') {
        return res.status(401).json({
          success: false,
          error: 'Your account request was rejected. Please contact Admin.'
        });
      }
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    if (!user.isApproved) {
      return res.status(401).json({
        success: false,
        error: 'Your account has not been approved yet. Please contact Admin.'
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error('Login error:', err);
    res.status(400).json({ success: false, error: err.message });
  }
};

// @route GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    user.isOnline = !user.isOnline;
    await user.save();
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Euclidean distance helper
const euclideanDistance = (desc1, desc2) => {
  if (desc1.length !== desc2.length) return Infinity;
  let sum = 0;
  for (let i = 0; i < desc1.length; i++) {
    sum += Math.pow(desc1[i] - desc2[i], 2);
  }
  return Math.sqrt(sum);
};

// @route POST /api/auth/register-face
// @desc Register face descriptor for a user
exports.registerFace = async (req, res) => {
  try {
    // Requires authentication (protect middleware)
    const { faceDescriptor } = req.body;
    if (!faceDescriptor || !Array.isArray(faceDescriptor)) {
      return res.status(400).json({ success: false, error: 'Valid face descriptor array is required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    user.faceDescriptor = faceDescriptor;
    await user.save();

    res.status(200).json({ success: true, message: 'Face data registered successfully' });
  } catch (err) {
    console.error('Register Face Error:', err);
    res.status(400).json({ success: false, error: err.message });
  }
};

// @route POST /api/auth/login-face
// @desc Login user using face descriptor
exports.loginFace = async (req, res) => {
  try {
    const { email, faceDescriptor } = req.body;

    if (!email || !faceDescriptor || !Array.isArray(faceDescriptor)) {
      return res.status(400).json({ success: false, error: 'Email and face descriptor are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or face descriptor' });
    }

    if (!user.isApproved) {
      return res.status(401).json({ success: false, error: 'Your account has not been approved yet. Please contact Admin.' });
    }

    if (!user.faceDescriptor || user.faceDescriptor.length === 0) {
      return res.status(400).json({ success: false, error: 'No face data registered for this account. Please login with password to register your face.' });
    }

    // Compare descriptors
    const distance = euclideanDistance(user.faceDescriptor, faceDescriptor);
    
    // face-api.js default threshold for euclidean distance is usually around 0.6. 
    // We use 0.5 for slightly stricter matching.
    const THRESHOLD = 0.5;

    if (distance > THRESHOLD) {
      return res.status(401).json({ success: false, error: 'Face not recognized. Please try again or use password.' });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error('Login Face Error:', err);
    res.status(400).json({ success: false, error: err.message });
  }
};
