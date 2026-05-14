const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  image: {
    type: String, // Cloudinary URL
    required: true
  },
  area: {
    type: String,
    required: true
  },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  reportedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  aiAnalysis: {
    wasteLevel: {
      type: String,
      default: 'Medium'
    },
    priority: {
      type: String,
      enum: ['Low', 'Normal', 'High', 'Emergency'],
      default: 'Normal'
    },
    overflow: { type: Boolean, default: false },
    pollutionScore: { type: Number, default: 50 },
    recyclable: { type: Boolean, default: false },
    estimatedSeverity: { type: String, default: 'Normal' }
  },
  status: {
    type: String,
    enum: ['Pending', 'Assigned', 'Resolved', 'Rejected'],
    default: 'Pending'
  },
  assignedTask: {
    type: mongoose.Schema.ObjectId,
    ref: 'WorkerTask'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Complaint', ComplaintSchema);
