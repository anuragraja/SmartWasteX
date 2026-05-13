const PendingRequest = require('../models/PendingRequest');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @route GET /api/admin/requests
exports.getPendingRequests = async (req, res) => {
  try {
    const requests = await PendingRequest.find({}).sort('-createdAt');
    res.status(200).json({ success: true, data: requests });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @route POST /api/admin/requests/:id
exports.handleRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'approve' or 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ success: false, error: 'Action must be approve or reject' });
    }

    const request = await PendingRequest.findById(id);
    if (!request) {
      return res.status(404).json({ success: false, error: 'Request not found' });
    }
    if (request.status !== 'Pending') {
      return res.status(400).json({ success: false, error: 'Request already processed' });
    }

    if (action === 'approve') {
      // Check if user already exists (edge case)
      const exists = await User.findOne({ email: request.email });
      if (exists) {
        request.status = 'Approved';
        await request.save();
        return res.status(200).json({ success: true, data: request });
      }

      // Create user with the PRE-HASHED password (bypass bcrypt hook by using $save trick)
      // We bypass the pre-save hook by using Model.collection.insertOne directly
      const user = await User.create({
        name: request.name,
        email: request.email,
        password: 'PLACEHOLDER', // will be replaced below
        role: request.role,
        area: request.area,
        isApproved: true
      });

      // Directly update the hashed password bypassing the pre-save hook
      await User.findByIdAndUpdate(user._id, { password: request.password });

      request.status = 'Approved';
      await request.save();

      // Create notification
      await Notification.create({
        user: user._id,
        title: 'Account Approved ✅',
        message: `Your ${request.role.replace('_', ' ')} account has been approved by the Admin. You can now log in.`,
        type: 'Approval'
      });

      // Realtime notification via Socket.io
      const io = req.app.get('io');
      if (io) {
        io.emit('accountApproved', { userId: user._id, name: user.name });
      }

    } else {
      request.status = 'Rejected';
      await request.save();
    }

    res.status(200).json({ success: true, data: request });
  } catch (err) {
    console.error('handleRequest error:', err);
    res.status(400).json({ success: false, error: err.message });
  }
};

// @route GET /api/admin/users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).sort('-createdAt');
    res.status(200).json({ success: true, data: users });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
