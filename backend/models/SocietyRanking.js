const mongoose = require('mongoose');

const SocietyRankingSchema = new mongoose.Schema({
  area: {
    type: String,
    required: true,
    unique: true
  },
  score: {
    type: Number,
    default: 100
  },
  totalComplaints: {
    type: Number,
    default: 0
  },
  overflows: {
    type: Number,
    default: 0
  },
  cleanlinessReports: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SocietyRanking', SocietyRankingSchema);
