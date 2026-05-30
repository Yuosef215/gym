const { validationResult } = require('express-validator');
const MembershipPlan = require('../models/MembershipPlan');
const Member = require('../models/Member');

exports.getAll = async (req, res, next) => {
  try {
    const plans = await MembershipPlan.find({ gym: req.user.gym._id }).sort({ price: 1 });
    res.json(plans);
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const plan = await MembershipPlan.findOne({ _id: req.params.id, gym: req.user.gym._id });
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    res.json(plan);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const plan = await MembershipPlan.create({ ...req.body, gym: req.user.gym._id });
    res.status(201).json(plan);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const plan = await MembershipPlan.findOneAndUpdate(
      { _id: req.params.id, gym: req.user.gym._id },
      req.body,
      { new: true }
    );
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    res.json(plan);
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const plan = await MembershipPlan.findOne({ _id: req.params.id, gym: req.user.gym._id });
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    const memberCount = await Member.countDocuments({ membershipPlan: req.params.id, gym: req.user.gym._id });
    if (memberCount > 0) return res.status(400).json({ message: 'Cannot delete plan with active members' });
    await MembershipPlan.findOneAndDelete({ _id: req.params.id, gym: req.user.gym._id });
    res.json({ message: 'Plan deleted' });
  } catch (err) { next(err); }
};
