const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  type: { type: String, enum: ['reminder', 'test', 'custom'], default: 'reminder' },
  recipient: { type: String },
  phone: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending' },
  error: { type: String },
  sentAt: { type: Date },
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' },
  gym: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);