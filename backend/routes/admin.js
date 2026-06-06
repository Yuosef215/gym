const router = require('express').Router();
const auth = require('../middleware/auth');
const Gym = require('../models/Gym');
const User = require('../models/User');
const Member = require('../models/Member');
const MembershipPlan = require('../models/MembershipPlan');
const Attendance = require('../models/Attendance');
const Payment = require('../models/Payment');

router.use(auth);

router.get('/gyms', async (req, res, next) => {
  try {
    if (req.user.role !== 'super_admin') return res.status(403).json({ message: 'Forbidden' });
    const gyms = await Gym.find().sort({ createdAt: -1 });
    const result = await Promise.all(gyms.map(async (gym) => {
      const [members, plans, payments, users] = await Promise.all([
        Member.countDocuments({ gym: gym._id }),
        MembershipPlan.countDocuments({ gym: gym._id }),
        Payment.countDocuments({ gym: gym._id }),
        User.countDocuments({ gym: gym._id }),
      ]);
      return { ...gym.toJSON(), stats: { members, plans, payments, users } };
    }));
    res.json(result);
  } catch (err) { next(err); }
});

router.get('/gyms/:id', async (req, res, next) => {
  try {
    if (req.user.role !== 'super_admin') return res.status(403).json({ message: 'Forbidden' });
    const gym = await Gym.findById(req.params.id);
    if (!gym) return res.status(404).json({ message: 'Gym not found' });
    const users = await User.find({ gym: gym._id }).select('-password');
    res.json({ gym, users });
  } catch (err) { next(err); }
});

router.put('/gyms/:id', async (req, res, next) => {
  try {
    if (req.user.role !== 'super_admin') return res.status(403).json({ message: 'Forbidden' });
    const gym = await Gym.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!gym) return res.status(404).json({ message: 'Gym not found' });
    res.json(gym);
  } catch (err) { next(err); }
});

router.delete('/gyms/:id', async (req, res, next) => {
  try {
    if (req.user.role !== 'super_admin') return res.status(403).json({ message: 'Forbidden' });
    const gym = await Gym.findByIdAndDelete(req.params.id);
    if (!gym) return res.status(404).json({ message: 'Gym not found' });
    await Promise.all([
      User.deleteMany({ gym: req.params.id }),
      Member.deleteMany({ gym: req.params.id }),
      MembershipPlan.deleteMany({ gym: req.params.id }),
      Attendance.deleteMany({ gym: req.params.id }),
      Payment.deleteMany({ gym: req.params.id }),
    ]);
    res.json({ message: 'Gym and all related data deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
