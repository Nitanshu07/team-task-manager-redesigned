const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true // Prevents duplicate registrations
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['Admin', 'User', 'admin', 'user'], // Allows flexibility but enforces specific tiers
    default: 'User'
  },
  date: {
    type: Date,
    default: Date.now
  },
  
  // --- NEW: Real-time Presence Tracking ---
  lastActive: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);