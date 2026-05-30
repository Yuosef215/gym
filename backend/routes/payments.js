const router = require('express').Router();
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const { getAll, create, remove, getStats } = require('../controllers/paymentController');

router.use(auth);

router.get('/', getAll);
router.get('/stats', getStats);

router.post('/', [
  body('memberId').isInt().withMessage('Member is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be positive'),
  body('planId').isInt().withMessage('Plan is required'),
], create);

router.delete('/:id', remove);

module.exports = router;
