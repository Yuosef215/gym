const mongoose = require('mongoose');

const gymSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String },
  phone: { type: String },
  email: { type: String },
  logo: { type: String },
  subscription: { type: String, enum: ['free', 'basic', 'premium'], default: 'free' },
  active: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Gym', gymSchema);
