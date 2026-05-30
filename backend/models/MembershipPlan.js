const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  durationDays: { type: Number, required: true },
  price: { type: Number, required: true },
  gym: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
}, { timestamps: true });

module.exports = mongoose.model('MembershipPlan', planSchema);
