const { validationResult } = require('express-validator');
const Member = require('../models/Member');
const Payment = require('../models/Payment');
const MembershipPlan = require('../models/MembershipPlan');
const qrService = require('../services/qrService');

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

    if (req.body.membershipPlan) {
      const plan = await MembershipPlan.findById(req.body.membershipPlan);
      if (plan) {
        const start = member.membershipStartDate || new Date();
        const end = new Date(start.getTime() + plan.durationDays * 86400000);
        const amount = req.body.paymentAmount || plan.price;
        const discount = req.body.paymentDiscount || 0;

        await Payment.create({
          member: member._id,
          plan: plan._id,
          gym: req.user.gym._id,
          amount,
          discount,
          total: amount - discount,
          type: 'new',
          method: req.body.paymentMethod || 'cash',
          status: 'paid',
          paidDate: new Date(),
          dueDate: end,
          periodStart: start,
          periodEnd: end,
          notes: req.body.paymentNotes || 'Initial payment on member creation',
          createdBy: req.user._id,
        });
      }
    }

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

exports.getExpiring = async (req, res, next) => {
  try {
    if (!req.user.gym) return res.json([]);
    const days = parseInt(req.query.days) || 7;
    const members = await Member.find({ gym: req.user.gym._id, status: 'active' })
      .populate('membershipPlan');

    const now = new Date();
    const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    const expiring = [];

    for (const m of members) {
      if (!m.membershipPlan) continue;
      const start = m.membershipStartDate || m.joinDate || now;
      if (!start) continue;
      const end = new Date(start.getTime() + m.membershipPlan.durationDays * 24 * 60 * 60 * 1000);
      if (end >= now && end <= future) {
        expiring.push({
          _id: m._id, name: m.name, phone: m.phone, email: m.email,
          gender: m.gender, dateOfBirth: m.dateOfBirth, status: m.status,
          usedInvitations: m.usedInvitations, membershipPlan: m.membershipPlan,
          membershipEndDate: end,
          daysRemaining: Math.ceil((end - now) / (1000 * 60 * 60 * 24)),
        });
      }
    }

    expiring.sort((a, b) => a.daysRemaining - b.daysRemaining);
    res.json(expiring);
  } catch (err) { next(err); }
};

exports.getBirthdays = async (req, res, next) => {
  try {
    if (!req.user.gym) return res.json([]);
    const members = await Member.find({
      gym: req.user.gym._id,
      dateOfBirth: { $exists: true, $ne: null },
    }).populate('membershipPlan');

    const now = new Date();
    const todayMonth = now.getMonth() + 1;
    const todayDay = now.getDate();

    const birthdays = [];
    for (const m of members) {
      if (!m.dateOfBirth) continue;
      const bd = new Date(m.dateOfBirth);
      if (bd.getMonth() + 1 === todayMonth && bd.getDate() === todayDay) {
        birthdays.push({ _id: m._id, name: m.name, phone: m.phone, membershipPlan: m.membershipPlan });
      }
    }

    res.json(birthdays);
  } catch (err) { next(err); }
};

exports.generateQR = async (req, res, next) => {
  try {
    const member = await Member.findOne({ _id: req.params.id, gym: req.user.gym._id });
    if (!member) return res.status(404).json({ message: 'Member not found' });

    const qrString = qrService.generateQRPayload(member._id.toString(), req.user.gym._id);
    const qrCode = await qrService.generateQRImage(qrString);

    member.qrData = qrString;
    member.qrCode = qrCode;
    await member.save();

    res.json({ qrCode, qrData: qrString });
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
