const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  reported: { type: Boolean, default: false },
});

module.exports = mongoose.model('Community', communitySchema);
