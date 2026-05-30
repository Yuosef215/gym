const router = require('express').Router();
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const { getAll, getById, create, update, remove } = require('../controllers/memberController');

router.use(auth);

router.get('/', getAll);
router.get('/:id', getById);

router.post('/', [
  body('name').notEmpty().withMessage('Name is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
], create);

router.put('/:id', update);
router.delete('/:id', remove);

module.exports = router;
