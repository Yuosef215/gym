require('dotenv').config();
const connectDB = require('./config/database');
const Gym = require('./models/Gym');
const User = require('./models/User');
const MembershipPlan = require('./models/MembershipPlan');
const Member = require('./models/Member');
const Attendance = require('./models/Attendance');

const seed = async () => {
  try {
    await connectDB();

    await Promise.all([
      User.deleteMany({}),
      Gym.deleteMany({}),
      MembershipPlan.deleteMany({}),
      Member.deleteMany({}),
      Attendance.deleteMany({}),
    ]);

    await User.create({ name: 'Super Admin', email: 'super@gym.com', password: '123456', role: 'super_admin' });

    const gym1 = await Gym.create({ name: 'Fitness Zone', address: 'Cairo, Egypt', phone: '01000000001', active: true });
    const gym2 = await Gym.create({ name: 'Power House Gym', address: 'Alexandria, Egypt', phone: '01000000002', active: false });

    await User.create({ name: 'Admin Fitness', email: 'admin@gym.com', password: '123456', role: 'admin', gym: gym1._id });
    await User.create({ name: 'Receptionist Fitness', email: 'receptionist@gym.com', password: '123456', role: 'receptionist', gym: gym1._id });
    await User.create({ name: 'Admin Power', email: 'admin@power.com', password: '123456', role: 'admin', gym: gym2._id });

    const monthly1 = await MembershipPlan.create({ name: 'Monthly', description: '1 month full access', durationDays: 30, price: 500, invitations: 2, gym: gym1._id });
    const quarterly1 = await MembershipPlan.create({ name: 'Quarterly', description: '3 months full access', durationDays: 90, price: 1200, invitations: 6, gym: gym1._id });
    const yearly1 = await MembershipPlan.create({ name: 'Yearly', description: '12 months full access', durationDays: 365, price: 4000, invitations: 20, gym: gym1._id });

    const monthly2 = await MembershipPlan.create({ name: 'Monthly', description: '1 month full access', durationDays: 30, price: 600, invitations: 2, gym: gym2._id });
    const yearly2 = await MembershipPlan.create({ name: 'Yearly', description: '12 months full access', durationDays: 365, price: 5000, invitations: 15, gym: gym2._id });

    const m1 = await Member.create({ name: 'Ahmed Ali', phone: '01001111111', email: 'ahmed@test.com', gender: 'male', membershipPlan: monthly1._id, gym: gym1._id });
    const m2 = await Member.create({ name: 'Sara Mohamed', phone: '01002222222', email: 'sara@test.com', gender: 'female', membershipPlan: quarterly1._id, gym: gym1._id });
    const m3 = await Member.create({ name: 'Omar Hassan', phone: '01003333333', email: 'omar@test.com', gender: 'male', membershipPlan: yearly1._id, gym: gym1._id });
    const m4 = await Member.create({ name: 'Nora Khaled', phone: '01004444444', email: 'nora@test.com', gender: 'female', membershipPlan: monthly1._id, status: 'inactive', gym: gym1._id });

    const m5 = await Member.create({ name: 'Khaled Youssef', phone: '01005555555', email: 'khaled@test.com', gender: 'male', membershipPlan: monthly2._id, gym: gym2._id });

    await Attendance.create({ member: m1._id, gym: gym1._id });
    await Attendance.create({ member: m2._id, gym: gym1._id });
    await Attendance.create({ member: m5._id, gym: gym2._id });

    console.log('Seed completed successfully!');
    console.log('---');
    console.log('Super Admin: super@gym.com / 123456 (access all gyms)');
    console.log('Admin Gym 1 (Fitness Zone): admin@gym.com / 123456');
    console.log('Receptionist Gym 1: receptionist@gym.com / 123456');
    console.log('Admin Gym 2 (Power House - INACTIVE): admin@power.com / 123456');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
};

seed();
