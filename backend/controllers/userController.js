const { validationResult } = require('express-validator');
const User = require('../models/User');

exports.getAll = async (req, res, next) => {
  try {
    const users = await User.find({ gym: req.user.gym._id }).sort({ createdAt: -1 });
    res.json(users);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already in use' });

    const user = await User.create({ name, email, password, role, gym: req.user.gym._id });
    res.status(201).json(user);
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const user = await User.findOneAndDelete({ _id: req.params.id, gym: req.user.gym._id });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) { next(err); }
};
