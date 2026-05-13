const Complaint = require('../models/Complaint');
const WorkerTask = require('../models/WorkerTask');
const User = require('../models/User');
const Notification = require('../models/Notification');
const SocietyRanking = require('../models/SocietyRanking');
const { analyzeWasteImage } = require('../services/aiAnalysisService');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.createComplaint = async (req, res) => {
  try {
    const { title, description, area, lat, lng } = req.body;
    
    // Real Upload logic via Multer
    let imageUrl = "https://images.unsplash.com/photo-1605600659873-d808a1d85715?w=500&auto=format&fit=crop&q=60";
    if (req.file) {
      try {
        if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== 'mock') {
          const result = await cloudinary.uploader.upload(req.file.path, { folder: 'smartwaste' });
          imageUrl = result.secure_url;
        } else {
          imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
        }
      } catch (err) {
        console.error('Cloudinary upload failed, using local URL', err);
        imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
      }
    }
    
    let aiAnalysis;
    if (req.file) {
      aiAnalysis = await analyzeWasteImage(req.file.path, req.file.mimetype, imageUrl);
    } else {
      aiAnalysis = {
        wasteLevel: "Normal",
        priority: "Normal",
        overflow: false,
        pollutionScore: 50,
        recyclable: false,
        estimatedSeverity: "Normal"
      };
    }

    const complaint = await Complaint.create({
      title,
      description,
      image: imageUrl,
      area,
      location: { lat, lng },
      reportedBy: req.user.id,
      aiAnalysis
    });

    // Update Society Ranking
    let ranking = await SocietyRanking.findOne({ area: { $regex: new RegExp(`^${area}$`, 'i') } });
    if (!ranking) ranking = await SocietyRanking.create({ area });
    
    ranking.totalComplaints += 1;
    if (aiAnalysis.overflow) ranking.overflows += 1;
    // Lower score is worse.
    ranking.score -= (aiAnalysis.pollutionScore / 10);
    await ranking.save();

    // AI DECISION ENGINE: Auto-assign tasks based on area
    // Find nearest worker or any worker in area
    const worker = await User.findOne({ role: 'worker', area: { $regex: new RegExp(`^${area}$`, 'i') } }) || await User.findOne({ role: 'worker' });
    
    if (worker) {
      const task = await WorkerTask.create({
        title: `Auto-Assigned: ${title}`,
        complaint: complaint._id,
        worker: worker._id,
        area,
        location: { lat, lng },
        priority: aiAnalysis.priority
      });

      complaint.assignedTask = task._id;
      complaint.status = 'Assigned';
      await complaint.save();

      // Socket.io Realtime Notification
      const io = req.app.get('io');
      
      const notification = await Notification.create({
        user: worker._id,
        title: 'New Task Assigned',
        message: `New ${aiAnalysis.priority} priority task in ${area}`,
        type: 'Task'
      });

      if (io) {
        io.to(worker._id.toString()).emit('newNotification', notification);
      }

      if (['Emergency', 'High'].includes(aiAnalysis.priority)) {
        const admins = await User.find({ role: 'admin' });
        await Promise.all(admins.map(async (admin) => {
          const adminNotification = await Notification.create({
            user: admin._id,
            title: `${aiAnalysis.priority} Priority Alert`,
            message: `${aiAnalysis.priority} priority complaint reported in ${area}`,
            type: 'Alert'
          });
          if (io) io.to(admin._id.toString()).emit('newNotification', adminNotification);
        }));
      }
    }

    res.status(201).json({ success: true, data: complaint });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.getComplaints = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'society_head') {
      if (req.user.area) {
        query.area = { $regex: new RegExp(`^${req.user.area}$`, 'i') };
      }
    } else if (req.user.role === 'public') {
      query.reportedBy = req.user.id;
    }

    const complaints = await Complaint.find(query)
      .populate('reportedBy', 'name email role')
      .populate({
        path: 'assignedTask',
        populate: { path: 'worker', select: 'name email phone' }
      })
      .sort('-createdAt');
    res.status(200).json({ success: true, data: complaints });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
