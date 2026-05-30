const Attendance = require('../models/Attendance');
const Member = require('../models/Member');

exports.getAll = async (req, res, next) => {
  try {
    const { date, memberId } = req.query;
    const filter = { gym: req.user.gym._id };
    if (date) filter.date = date;
    if (memberId) filter.member = memberId;

    const records = await Attendance.find(filter)
      .populate('member', 'name phone')
      .sort({ checkIn: -1 });
    res.json(records);
  } catch (err) { next(err); }
};

exports.checkIn = async (req, res, next) => {
  try {
    const { memberId } = req.body;
    if (!memberId) return res.status(400).json({ message: 'memberId is required' });

    const member = await Member.findOne({ _id: memberId, gym: req.user.gym._id });
    if (!member) return res.status(404).json({ message: 'Member not found' });

    const today = new Date().toISOString().split('T')[0];
    const existing = await Attendance.findOne({ member: memberId, date: today, checkOut: null, gym: req.user.gym._id });
    if (existing) return res.status(400).json({ message: 'Member already checked in today' });

    const record = await Attendance.create({ member: memberId, gym: req.user.gym._id });
    const result = await Attendance.findById(record._id).populate('member', 'name phone');
    res.status(201).json(result);
  } catch (err) { next(err); }
};

exports.checkOut = async (req, res, next) => {
  try {
    const { id } = req.params;
    const record = await Attendance.findOne({ _id: id, gym: req.user.gym._id });
    if (!record) return res.status(404).json({ message: 'Attendance record not found' });
    if (record.checkOut) return res.status(400).json({ message: 'Already checked out' });

    record.checkOut = new Date();
    await record.save();
    const result = await Attendance.findById(record._id).populate('member', 'name phone');
    res.json(result);
  } catch (err) { next(err); }
};

exports.today = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const records = await Attendance.find({ date: today, gym: req.user.gym._id })
      .populate('member', 'name phone')
      .sort({ checkIn: -1 });
    res.json(records);
  } catch (err) { next(err); }
};
