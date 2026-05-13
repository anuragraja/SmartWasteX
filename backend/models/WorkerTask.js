const mongoose = require('mongoose');

const WorkerTaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  complaint: {
    type: mongoose.Schema.ObjectId,
    ref: 'Complaint'
  },
  worker: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
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
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'In Progress', 'Completed', 'Failed'],
    default: 'Pending'
  },
  priority: {
    type: String,
    enum: ['Normal', 'High', 'Emergency'],
    default: 'Normal'
  },
  assignedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User' // Admin
  },
  estimatedTime: {
    type: Number // In minutes
  },
  estimatedArrival: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('WorkerTask', WorkerTaskSchema);
