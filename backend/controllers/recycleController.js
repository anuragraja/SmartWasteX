const RecycleRequest = require('../models/RecycleRequest');
const RecyclerProfile = require('../models/RecyclerProfile');
const User = require('../models/User');
const Notification = require('../models/Notification');

exports.getRecyclers = async (req, res) => {
  try {
    const recyclers = await RecyclerProfile.find().populate('user', 'name email phone');
    res.status(200).json({ success: true, data: recyclers });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.updatePrices = async (req, res) => {
  try {
    const { prices, companyName, address } = req.body;
    let profile = await RecyclerProfile.findOne({ user: req.user.id });
    
    if (!profile) {
      profile = await RecyclerProfile.create({
        user: req.user.id,
        companyName: companyName || req.user.name,
        address: address || 'Default Address',
        prices: prices || {}
      });
    } else {
      if (prices) profile.prices = { ...profile.prices, ...prices };
      if (companyName) profile.companyName = companyName;
      if (address) profile.address = address;
      await profile.save();
    }
    
    res.status(200).json({ success: true, data: profile });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.createRequest = async (req, res) => {
  try {
    const { recyclerId, wasteType, quantity, pickupAddress, lat, lng, estimatedPrice, notes } = req.body;
    
    let imageUrl = "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=500&auto=format&fit=crop&q=60";
    if (req.file) {
      imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    const request = await RecycleRequest.create({
      user: req.user.id,
      recycler: recyclerId,
      wasteType,
      quantity,
      image: imageUrl,
      pickupAddress,
      location: { lat, lng },
      estimatedPrice,
      notes
    });

    // Notify Recycler
    const io = req.app.get('io');
    const notification = await Notification.create({
      user: recyclerId,
      title: 'New Recycle Request',
      message: `${quantity}kg of ${wasteType} ready for pickup at ${pickupAddress}.`,
      type: 'Alert'
    });
    if (io) io.to(recyclerId.toString()).emit('newNotification', notification);

    res.status(201).json({ success: true, data: request });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.getRequests = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'recycler') {
      query.recycler = req.user.id;
    } else {
      query.user = req.user.id;
    }

    const requests = await RecycleRequest.find(query)
      .populate('user', 'name email phone')
      .populate('recycler', 'name email phone')
      .sort('-createdAt');
      
    res.status(200).json({ success: true, data: requests });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.updateRequestStatus = async (req, res) => {
  try {
    const { status, scheduledDate, scheduledTime } = req.body;
    const request = await RecycleRequest.findById(req.params.id);

    if (!request) return res.status(404).json({ success: false, error: 'Request not found' });
    
    // Only recycler or admin should update, or maybe user can cancel
    if (req.user.role !== 'recycler' && req.user.role !== 'admin') {
       // if not recycler, deny
       return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    request.status = status;
    if (scheduledDate) request.scheduledDate = scheduledDate;
    if (scheduledTime) request.scheduledTime = scheduledTime;

    if (status === 'Completed') {
       request.ecoPointsEarned = Math.floor(request.quantity * 10); // Example: 10 points per kg
       
       // Add points to User
       const userRecord = await User.findById(request.user);
       if (userRecord) {
         userRecord.ecoPoints = (userRecord.ecoPoints || 0) + request.ecoPointsEarned;
         await userRecord.save();
       }
    }

    await request.save();

    // Notify User
    const io = req.app.get('io');
    let message = `Your recycling request status is now ${status}.`;
    if (status === 'Scheduled') {
      message = `Pickup scheduled for ${new Date(scheduledDate).toLocaleDateString()} at ${scheduledTime}.`;
    } else if (status === 'Completed') {
      message = `Recycling completed! You earned ${request.ecoPointsEarned} EcoPoints.`;
    }

    const notification = await Notification.create({
      user: request.user,
      title: 'Recycle Request Update',
      message,
      type: status === 'Completed' ? 'Success' : 'Info'
    });
    
    if (io) io.to(request.user.toString()).emit('newNotification', notification);

    res.status(200).json({ success: true, data: request });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.getEcoStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const requests = await RecycleRequest.find({ user: req.user.id, status: 'Completed' });
    
    const totalRecycled = requests.reduce((acc, req) => acc + req.quantity, 0);
    const totalEarnings = requests.reduce((acc, req) => acc + req.estimatedPrice, 0);

    res.status(200).json({
      success: true,
      data: {
        ecoPoints: user.ecoPoints || 0,
        totalRecycled,
        totalEarnings
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
