const mongoose = require('mongoose');

const RecycleRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recycler: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  wasteType: {
    type: String,
    enum: ['Plastic', 'Iron', 'Copper', 'Paper', 'E-waste', 'Other'],
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  pickupAddress: {
    type: String,
    required: true
  },
  location: {
    lat: Number,
    lng: Number
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Scheduled', 'Collected', 'Completed', 'Rejected'],
    default: 'Pending'
  },
  estimatedPrice: {
    type: Number,
    required: true
  },
  scheduledDate: {
    type: Date
  },
  scheduledTime: {
    type: String
  },
  notes: {
    type: String
  },
  ecoPointsEarned: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('RecycleRequest', RecycleRequestSchema);
