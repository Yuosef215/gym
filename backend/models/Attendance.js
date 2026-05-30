const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  checkIn: { type: Date, default: Date.now },
  checkOut: { type: Date },
  date: { type: String, default: () => new Date().toISOString().split('T')[0] },
  gym: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
