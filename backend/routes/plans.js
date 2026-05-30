const router = require('express').Router();
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const { getAll, getById, create, update, remove } = require('../controllers/planController');

router.use(auth);

router.get('/', getAll);
router.get('/:id', getById);

router.post('/', [
  body('name').notEmpty().withMessage('Plan name is required'),
  body('durationDays').isInt({ min: 1 }).withMessage('Duration must be at least 1 day'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
], create);

router.put('/:id', update);
router.delete('/:id', remove);

module.exports = router;
