const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const Gym = require('../models/Gym');

const signToken = (user, gym) => {
  return jwt.sign(
    { id: user._id, name: user.name, email: user.email, role: user.role, gym: gym ? { _id: gym._id, name: gym.name } : null },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password, gymName } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const gym = await Gym.create({ name: gymName || `${name}'s Gym` });
    const user = await User.create({ name, email, password, role: 'admin', gym: gym._id });

    const token = signToken(user, gym);
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      gym: { id: gym._id, name: gym.name },
    });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    const user = await User.findOne({ email }).populate('gym');
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    if (user.role !== 'super_admin' && user.gym && !user.gym.active) {
      return res.status(403).json({ message: 'Your gym account is deactivated. Contact super admin.' });
    }

    const token = signToken(user, user.gym);
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      gym: user.gym ? { id: user.gym._id, name: user.gym.name } : null,
    });
  } catch (err) { next(err); }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('gym');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ ...user.toJSON(), gym: user.gym });
  } catch (err) { next(err); }
};
