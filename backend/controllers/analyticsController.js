const Complaint = require('../models/Complaint');
const WorkerTask = require('../models/WorkerTask');
const SocietyRanking = require('../models/SocietyRanking');

exports.getDashboardStats = async (req, res) => {
  try {
    const totalComplaints = await Complaint.countDocuments();
    const resolvedComplaints = await Complaint.countDocuments({ status: 'Resolved' });
    const pendingTasks = await WorkerTask.countDocuments({ status: { $in: ['Pending', 'Accepted', 'In Progress'] } });
    const emergencies = await Complaint.countDocuments({ 'aiAnalysis.priority': 'Emergency' });

    res.status(200).json({
      success: true,
      data: {
        totalComplaints,
        resolvedComplaints,
        pendingTasks,
        emergencies
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.getHeatmapData = async (req, res) => {
  try {
    const complaints = await Complaint.find().select('location aiAnalysis.wasteLevel area title');
    // Map to heatmap format
    const mapData = complaints.map(c => ({
      _id: c._id,
      area: c.area,
      title: c.title,
      location: c.location,
      status: c.aiAnalysis.wasteLevel
    }));
    res.status(200).json({ success: true, data: mapData });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.getSocietyRankings = async (req, res) => {
  try {
    const rankings = await SocietyRanking.find().sort('-score');
    res.status(200).json({ success: true, data: rankings });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.getTopUsers = async (req, res) => {
  try {
    const User = require('../models/User');
    const topUsers = await User.find({ role: 'public' })
      .sort('-ecoPoints')
      .limit(3)
      .select('name ecoPoints area');
    res.status(200).json({ success: true, data: topUsers });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
