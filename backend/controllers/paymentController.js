const { validationResult } = require('express-validator');
const Payment = require('../models/Payment');
const Member = require('../models/Member');

const getGymId = (req) => req.user.gym?._id;

exports.getAll = async (req, res, next) => {
  try {
    const { member, status, from, to } = req.query;
    const filter = { gym: getGymId(req) };
    if (member) filter.member = member;
    if (status) filter.status = status;
    if (from || to) {
      filter.paidDate = {};
      if (from) filter.paidDate.$gte = new Date(from);
      if (to) filter.paidDate.$lte = new Date(to);
    }
    const payments = await Payment.find(filter)
      .populate('member', 'name phone')
      .populate('plan', 'name')
      .sort({ paidDate: -1 });
    res.json(payments);
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const payment = await Payment.findOne({ _id: req.params.id, gym: getGymId(req) })
      .populate('member', 'name phone')
      .populate('plan', 'name');
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json(payment);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const data = { ...req.body, total: req.body.amount - (req.body.discount || 0), gym: getGymId(req), createdBy: req.user.id };
    const payment = await Payment.create(data);
    const result = await Payment.findById(payment._id)
      .populate('member', 'name phone')
      .populate('plan', 'name');
    res.status(201).json(result);
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const payment = await Payment.findOneAndDelete({ _id: req.params.id, gym: getGymId(req) });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json({ message: 'Payment deleted' });
  } catch (err) { next(err); }
};

// ─── Reports ───

exports.getDailyReport = async (req, res, next) => {
  try {
    const gymId = getGymId(req);
    const date = req.query.date ? new Date(req.query.date) : new Date();
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayEnd = new Date(dayStart.getTime() + 86400000);

    const [revenueByMethod, newMembers, renewals, attendance, overdue] = await Promise.all([
      Payment.aggregate([
        { $match: { gym: gymId, status: 'paid', paidDate: { $gte: dayStart, $lt: dayEnd } } },
        { $group: { _id: '$method', total: { $sum: '$total' }, count: { $sum: 1 } } },
      ]),
      Member.countDocuments({ gym: gymId, createdAt: { $gte: dayStart, $lt: dayEnd } }),
      Payment.countDocuments({ gym: gymId, type: 'renewal', paidDate: { $gte: dayStart, $lt: dayEnd } }),
      require('../models/Attendance').countDocuments({ gym: gymId, checkIn: { $gte: dayStart, $lt: dayEnd } }),
      Payment.countDocuments({ gym: gymId, status: 'overdue' }),
    ]);

    res.json({ date: dayStart, revenueByMethod, totalRevenue: revenueByMethod.reduce((a, b) => a + b.total, 0), newMembers, renewals, attendance, overdue });
  } catch (err) { next(err); }
};

exports.getMonthlyReport = async (req, res, next) => {
  try {
    const gymId = getGymId(req);
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const month = parseInt(req.query.month);
    let matchFilter = { gym: gymId, status: 'paid' };

    if (month) {
      const monthStart = new Date(year, month - 1, 1);
      const monthEnd = new Date(year, month, 1);
      matchFilter.paidDate = { $gte: monthStart, $lt: monthEnd };
    } else {
      const yearStart = new Date(year, 0, 1);
      const yearEnd = new Date(year + 1, 0, 1);
      matchFilter.paidDate = { $gte: yearStart, $lt: yearEnd };
    }

    const [revenueByPlan, revenueByMethod, dailyRevenue, newMembers, renewals] = await Promise.all([
      Payment.aggregate([
        { $match: matchFilter },
        { $group: { _id: '$plan', total: { $sum: '$total' }, count: { $sum: 1 } } },
        { $lookup: { from: 'membershipplans', localField: '_id', foreignField: '_id', as: 'plan' } },
        { $unwind: { path: '$plan', preserveNullAndEmptyArrays: true } },
        { $project: { planName: '$plan.name', total: 1, count: 1 } },
      ]),
      Payment.aggregate([
        { $match: matchFilter },
        { $group: { _id: '$method', total: { $sum: '$total' }, count: { $sum: 1 } } },
      ]),
      Payment.aggregate([
        { $match: matchFilter },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$paidDate' } }, total: { $sum: '$total' } } },
        { $sort: { _id: 1 } },
      ]),
      month ? Member.countDocuments({
        gym: gymId,
        createdAt: { $gte: matchFilter.paidDate.$gte, $lt: matchFilter.paidDate.$lt },
      }) : 0,
      month ? Payment.countDocuments({
        gym: gymId, type: 'renewal',
        paidDate: { $gte: matchFilter.paidDate.$gte, $lt: matchFilter.paidDate.$lt },
      }) : 0,
    ]);

    res.json({ revenueByPlan, revenueByMethod, dailyRevenue, total: dailyRevenue.reduce((a, b) => a + b.total, 0), newMembers, renewals });
  } catch (err) { next(err); }
};

exports.getYearlyReport = async (req, res, next) => {
  try {
    const gymId = getGymId(req);
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const monthlyRevenue = await Payment.aggregate([
      { $match: { gym: gymId, status: 'paid', paidDate: { $gte: new Date(year, 0, 1), $lt: new Date(year + 1, 0, 1) } } },
      { $group: { _id: { $month: '$paidDate' }, total: { $sum: '$total' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.json({ year, monthlyRevenue });
  } catch (err) { next(err); }
};

exports.getOverdue = async (req, res, next) => {
  try {
    const gymId = getGymId(req);
    const members = await Member.find({ gym: gymId, status: 'active' }).populate('membershipPlan');

    const overdue = [];
    for (const m of members) {
      if (!m.membershipPlan) continue;
      const start = m.membershipStartDate || m.joinDate;
      if (!start) continue;
      const end = new Date(start.getTime() + m.membershipPlan.durationDays * 86400000);
      if (end < new Date()) {
        const lastPayment = await Payment.findOne({ member: m._id, gym: gymId, status: 'paid' }).sort({ paidDate: -1 });
        overdue.push({
          _id: m._id, name: m.name, phone: m.phone, plan: m.membershipPlan.name,
          expiredDays: Math.ceil((Date.now() - end) / 86400000),
          lastPaymentDate: lastPayment?.paidDate || null,
        });
      }
    }

    res.json(overdue.sort((a, b) => b.expiredDays - a.expiredDays));
  } catch (err) { next(err); }
};

exports.getNonRenewals = async (req, res, next) => {
  try {
    const gymId = getGymId(req);
    const days = parseInt(req.query.days) || 30;
    const cutoff = new Date(Date.now() - days * 86400000);

    const members = await Member.find({ gym: gymId, status: 'inactive' }).populate('membershipPlan');

    const nonRenewals = members.filter(m => {
      if (!m.membershipPlan) return false;
      const start = m.membershipStartDate || m.joinDate;
      if (!start) return false;
      const end = new Date(start.getTime() + m.membershipPlan.durationDays * 86400000);
      return end > cutoff;
    });

    res.json(nonRenewals.map(m => ({
      _id: m._id, name: m.name, phone: m.phone, plan: m.membershipPlan?.name,
      endDate: m.membershipEndDate,
    })));
  } catch (err) { next(err); }
};

exports.getSummary = async (req, res, next) => {
  try {
    const gymId = getGymId(req);
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [totalRevenue, monthRevenue, todayRevenue, activeMembers, totalMembers,
      todayAttendance, monthlyNew, monthlyRenewals, overdue] = await Promise.all([
      Payment.aggregate([{ $match: { gym: gymId, status: 'paid' } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Payment.aggregate([{ $match: { gym: gymId, status: 'paid', paidDate: { $gte: monthStart, $lt: monthEnd } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Payment.aggregate([{ $match: { gym: gymId, status: 'paid', paidDate: { $gte: todayStart } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Member.countDocuments({ gym: gymId, status: 'active' }),
      Member.countDocuments({ gym: gymId }),
      require('../models/Attendance').countDocuments({ gym: gymId, checkIn: { $gte: todayStart } }),
      Member.countDocuments({ gym: gymId, createdAt: { $gte: monthStart, $lt: monthEnd } }),
      Payment.countDocuments({ gym: gymId, type: 'renewal', paidDate: { $gte: monthStart, $lt: monthEnd } }),
      Payment.countDocuments({ gym: gymId, status: 'overdue' }),
    ]);

    res.json({
      revenue: { total: totalRevenue[0]?.total || 0, month: monthRevenue[0]?.total || 0, today: todayRevenue[0]?.total || 0 },
      members: { active: activeMembers, total: totalMembers, newThisMonth: monthlyNew, renewalsThisMonth: monthlyRenewals },
      attendance: { today: todayAttendance },
      overdue,
    });
  } catch (err) { next(err); }
};