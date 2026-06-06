const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  member:  { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  plan:    { type: mongoose.Schema.Types.ObjectId, ref: 'MembershipPlan' },
  gym:     { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },

  amount:     { type: Number, required: true },
  discount:   { type: Number, default: 0 },
  total:      { type: Number, required: true },

  type:       { type: String, enum: ['new', 'renewal', 'upgrade', 'refund'], default: 'new' },
  method:     { type: String, enum: ['cash', 'card', 'transfer', 'wallet'], default: 'cash' },
  status:     { type: String, enum: ['paid', 'pending', 'overdue', 'refunded'], default: 'paid' },

  dueDate:    { type: Date },
  paidDate:   { type: Date, default: Date.now },
  periodStart: { type: Date },
  periodEnd:  { type: Date },

  notes:    { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

paymentSchema.index({ gym: 1, paidDate: -1 });
paymentSchema.index({ gym: 1, status: 1 });
paymentSchema.index({ gym: 1, type: 1, paidDate: -1 });
paymentSchema.index({ member: 1 });

module.exports = mongoose.model('Payment', paymentSchema);