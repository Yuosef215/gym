const router = require('express').Router();
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const {
  getAll, getById, create, remove,
  getDailyReport, getMonthlyReport, getYearlyReport,
  getOverdue, getNonRenewals, getSummary,
} = require('../controllers/paymentController');

router.use(auth);

router.get('/', getAll);
router.get('/daily', getDailyReport);
router.get('/monthly', getMonthlyReport);
router.get('/yearly', getYearlyReport);
router.get('/overdue', getOverdue);
router.get('/non-renewals', getNonRenewals);
router.get('/summary', getSummary);
router.get('/:id', getById);

router.post('/', [
  body('member').notEmpty().withMessage('Member is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be positive'),
], create);

router.delete('/:id', remove);

module.exports = router;