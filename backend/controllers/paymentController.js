const { validationResult } = require('express-validator');
const Payment = require('../models/Payment');

exports.getAll = async (req, res, next) => {
  try {
    const { memberId, startDate, endDate } = req.query;
    const filter = { gym: req.user.gym._id };
    if (memberId) filter.member = memberId;
    if (startDate && endDate) {
      filter.paymentDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const payments = await Payment.find(filter)
      .populate('member', 'name phone')
      .populate('plan', 'name')
      .sort({ paymentDate: -1 });
    res.json(payments);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const payment = await Payment.create({ ...req.body, gym: req.user.gym._id });
    const result = await Payment.findById(payment._id)
      .populate('member', 'name phone')
      .populate('plan', 'name');
    res.status(201).json(result);
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const payment = await Payment.findOneAndDelete({ _id: req.params.id, gym: req.user.gym._id });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json({ message: 'Payment deleted' });
  } catch (err) { next(err); }
};

exports.getStats = async (req, res, next) => {
  try {
    const allPayments = await Payment.find({ gym: req.user.gym._id });
    const totalRevenue = allPayments.reduce((sum, p) => sum + p.amount, 0);

    const today = new Date().toISOString().split('T')[0];
    const todayPayments = allPayments.filter(p => new Date(p.paymentDate).toISOString().split('T')[0] === today);
    const todayRevenue = todayPayments.reduce((sum, p) => sum + p.amount, 0);

    res.json({ totalRevenue, todayRevenue });
  } catch (err) { next(err); }
};
