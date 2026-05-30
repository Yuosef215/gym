const { validationResult } = require('express-validator');
const Member = require('../models/Member');

exports.getAll = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const filter = { gym: req.user.gym._id };
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }
    const members = await Member.find(filter).populate('membershipPlan').sort({ createdAt: -1 });
    res.json(members);
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const member = await Member.findOne({ _id: req.params.id, gym: req.user.gym._id }).populate('membershipPlan');
    if (!member) return res.status(404).json({ message: 'Member not found' });
    res.json(member);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const member = await Member.create({ ...req.body, gym: req.user.gym._id });
    const result = await Member.findById(member._id).populate('membershipPlan');
    res.status(201).json(result);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const member = await Member.findOneAndUpdate(
      { _id: req.params.id, gym: req.user.gym._id },
      req.body,
      { new: true }
    ).populate('membershipPlan');
    if (!member) return res.status(404).json({ message: 'Member not found' });
    res.json(member);
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const member = await Member.findOneAndDelete({ _id: req.params.id, gym: req.user.gym._id });
    if (!member) return res.status(404).json({ message: 'Member not found' });
    res.json({ message: 'Member deleted' });
  } catch (err) { next(err); }
};

exports.useInvitation = async (req, res, next) => {
  try {
    const member = await Member.findOne({ _id: req.params.id, gym: req.user.gym._id }).populate('membershipPlan');
    if (!member) return res.status(404).json({ message: 'Member not found' });
    if (!member.membershipPlan) return res.status(400).json({ message: 'Member has no plan' });

    const plan = member.membershipPlan;
    const remaining = plan.invitations - member.usedInvitations;
    if (remaining <= 0) return res.status(400).json({ message: 'No invitations remaining' });

    member.usedInvitations += 1;
    await member.save();
    res.json({ message: 'Invitation used', remaining: remaining - 1 });
  } catch (err) { next(err); }
};
