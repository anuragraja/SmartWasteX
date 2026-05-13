const mongoose = require('mongoose');

const RecyclerProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  companyName: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  location: {
    lat: { type: Number, default: 28.6139 },
    lng: { type: Number, default: 77.2090 }
  },
  rating: {
    type: Number,
    default: 4.5
  },
  prices: {
    Plastic: { type: Number, default: 15 }, // per kg
    Iron: { type: Number, default: 25 },
    Copper: { type: Number, default: 450 },
    Paper: { type: Number, default: 10 },
    'E-waste': { type: Number, default: 50 }
  }
}, { timestamps: true });

module.exports = mongoose.model('RecyclerProfile', RecyclerProfileSchema);
