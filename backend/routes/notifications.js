const router = require('express').Router();
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const { getAll, sendTest, sendReminder, sendBulkReminders } = require('../controllers/notificationController');

router.use(auth);

router.get('/', getAll);

router.post('/test', [
  body('phone').notEmpty().withMessage('Phone is required'),
  body('message').notEmpty().withMessage('Message is required'),
], sendTest);

router.post('/reminder', [
  body('memberId').notEmpty().withMessage('memberId is required'),
], sendReminder);

router.post('/bulk-reminders', sendBulkReminders);

module.exports = router;