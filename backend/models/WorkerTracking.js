const mongoose = require('mongoose');

const WorkerTrackingSchema = new mongoose.Schema({
  worker: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  areasCovered: {
    type: [String],
    default: []
  },
  uploadsCount: {
    type: Number,
    default: 0
  },
  performance: {
    type: Number,
    default: 100 // Out of 100
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('WorkerTracking', WorkerTrackingSchema);
