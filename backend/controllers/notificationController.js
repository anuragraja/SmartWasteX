const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id }).sort('-createdAt');
    res.status(200).json({ success: true, data: notifications });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification || notification.user.toString() !== req.user.id) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }
    notification.isRead = true;
    await notification.save();
    res.status(200).json({ success: true, data: notification });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.sendNotification = async (req, res) => {
  try {
    const { userId, title, message, type } = req.body;
    const notification = await Notification.create({
      user: userId,
      title,
      message,
      type: type || 'Alert'
    });
    
    // Emit real-time notification
    const io = req.app.get('io');
    if (io) {
      io.to(userId.toString()).emit('newNotification', notification);
    }
    
    res.status(201).json({ success: true, data: notification });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
