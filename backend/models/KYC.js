const mongoose = require('mongoose');

const KYCSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  fullName: {
    type: String,
    required: true
  },
  aadhaarNumber: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  mobile: {
    type: String,
    required: true
  },
  area: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['worker', 'society_head'],
    required: true
  },
  profilePhotoUrl: {
    type: String,
    required: true
  },
  documentUrl: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  verifiedAt: {
    type: Date
  }
});

module.exports = mongoose.model('KYC', KYCSchema);
