const mongoose = require('mongoose');

const PendingRequestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  // Store pre-hashed password so we can copy to User upon approval
  password: {
    type: String,
    required: true
    // NOTE: NO select: false here — we need it in adminController
  },
  role: {
    type: String,
    enum: ['society_head', 'worker', 'recycler'],
    required: true
  },
  area: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PendingRequest', PendingRequestSchema);
