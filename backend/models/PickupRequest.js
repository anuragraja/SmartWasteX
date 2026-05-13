const mongoose = require('mongoose');

const PickupRequestSchema = new mongoose.Schema({
  area: {
    type: String,
    required: [true, 'Please specify an area']
  },
  requestedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  assignedWorker: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['Pending', 'Assigned', 'Completed'],
    default: 'Pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PickupRequest', PickupRequestSchema);
