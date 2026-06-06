const Notification = require('../models/Notification');
const Member = require('../models/Member');
const whatsappService = require('../services/whatsappService');

exports.getAll = async (req, res, next) => {
  try {
    const { status, type } = req.query;
    const filter = { gym: req.user.gym._id };
    if (status) filter.status = status;
    if (type) filter.type = type;
    const notifications = await Notification.find(filter)
      .populate('member', 'name phone')
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) { next(err); }
};

exports.sendTest = async (req, res, next) => {
  try {
    const { phone, message } = req.body;
    if (!phone || !message) return res.status(400).json({ message: 'Phone and message are required' });

    const result = await whatsappService.sendWhatsApp(phone, message);

    const notification = await Notification.create({
      type: 'test',
      phone,
      recipient: phone,
      message,
      status: 'sent',
      sentAt: new Date(),
      gym: req.user.gym._id,
    });

    res.status(201).json({ sid: result.sid, notification });
  } catch (err) {
    await Notification.create({
      type: 'test',
      phone: req.body.phone,
      recipient: req.body.phone,
      message: req.body.message,
      status: 'failed',
      error: err.message,
      gym: req.user.gym._id,
    });
    res.status(500).json({ message: err.message });
  }
};

exports.sendReminder = async (req, res, next) => {
  try {
    const { memberId, message } = req.body;
    if (!memberId) return res.status(400).json({ message: 'memberId is required' });

    const member = await Member.findOne({ _id: memberId, gym: req.user.gym._id }).populate('membershipPlan');
    if (!member) return res.status(404).json({ message: 'Member not found' });
    if (!member.phone) return res.status(400).json({ message: 'Member has no phone number' });

    const text = message || `Dear ${member.name}, your gym membership is expiring soon. Please renew to continue enjoying our services.`;

    const result = await whatsappService.sendWhatsApp(member.phone, text);

    const notification = await Notification.create({
      type: 'reminder',
      phone: member.phone,
      recipient: member.name,
      message: text,
      status: 'sent',
      sentAt: new Date(),
      member: member._id,
      gym: req.user.gym._id,
    });

    res.status(201).json({ sid: result.sid, notification });
  } catch (err) {
    const member = await Member.findOne({ _id: req.body.memberId, gym: req.user.gym._id });
    if (member) {
      await Notification.create({
        type: 'reminder',
        phone: member.phone,
        recipient: member.name,
        message: req.body.message || 'Reminder',
        status: 'failed',
        error: err.message,
        member: member._id,
        gym: req.user.gym._id,
      });
    }
    res.status(500).json({ message: err.message });
  }
};

exports.sendBulkReminders = async (req, res, next) => {
  try {
    const { days } = req.query;
    const expiryDays = parseInt(days) || 7;

    const now = new Date();
    const future = new Date(now.getTime() + expiryDays * 86400000);

    const members = await Member.find({
      gym: req.user.gym._id,
      status: 'active',
      membershipStartDate: { $ne: null },
    }).populate('membershipPlan');

    const expiring = members.filter((m) => {
      if (!m.membershipPlan?.durationDays) return false;
      const start = new Date(m.membershipStartDate);
      const end = new Date(start.getTime() + m.membershipPlan.durationDays * 86400000);
      return end <= future && end >= now;
    });

    if (expiring.length === 0) return res.json({ message: 'No expiring members found', sent: 0 });

    let sent = 0;
    const results = [];

    for (const member of expiring) {
      if (!member.phone) continue;
      const message = `Dear ${member.name}, your gym membership is expiring soon. Please renew to continue enjoying our services.`;
      try {
        const result = await whatsappService.sendWhatsApp(member.phone, message);
        await Notification.create({
          type: 'reminder',
          phone: member.phone,
          recipient: member.name,
          message,
          status: 'sent',
          sentAt: new Date(),
          member: member._id,
          gym: req.user.gym._id,
        });
        sent++;
        results.push({ member: member.name, status: 'sent', sid: result.sid });
      } catch (err) {
        await Notification.create({
          type: 'reminder',
          phone: member.phone,
          recipient: member.name,
          message,
          status: 'failed',
          error: err.message,
          member: member._id,
          gym: req.user.gym._id,
        });
        results.push({ member: member.name, status: 'failed', error: err.message });
      }
    }

    res.json({ sent, total: expiring.length, results });
  } catch (err) { next(err); }
};