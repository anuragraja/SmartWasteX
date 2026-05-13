const mongoose = require('mongoose');

const WasteUploadSchema = new mongoose.Schema({
  image: {
    type: String,
    required: [true, 'Please add an image']
  },
  area: {
    type: String,
    required: [true, 'Please add an area']
  },
  status: {
    type: String,
    enum: ['Empty', 'Medium', 'Full', 'Overflow'],
    default: 'Medium'
  },
  quantity: {
    type: Number,
    default: 0
  },
  uploadedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('WasteUpload', WasteUploadSchema);
