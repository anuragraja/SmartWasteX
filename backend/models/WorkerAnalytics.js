const mongoose = require('mongoose');

const WorkerAnalyticsSchema = new mongoose.Schema({
  worker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  totalTasks: {
    type: Number,
    default: 0
  },
  completedTasks: {
    type: Number,
    default: 0
  },
  pendingTasks: {
    type: Number,
    default: 0
  },
  missedTasks: {
    type: Number,
    default: 0
  },
  workHours: {
    type: Number,
    default: 0 // In hours
  },
  performanceScore: {
    type: Number,
    default: 100 // Out of 100
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('WorkerAnalytics', WorkerAnalyticsSchema);
