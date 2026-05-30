require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const memberRoutes = require('./routes/members');
const planRoutes = require('./routes/plans');
const attendanceRoutes = require('./routes/attendance');

const userRoutes = require('./routes/users');

const app = express();

const isProduction = process.env.NODE_ENV === 'production';
const clientURL = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(cors({ origin: isProduction ? clientURL : '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/attendance', attendanceRoutes);

app.use('/api/users', userRoutes);

if (isProduction) {
  const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const init = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`Server running on port ${PORT} [${isProduction ? 'PRODUCTION' : 'DEV'}]`));
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

init();
