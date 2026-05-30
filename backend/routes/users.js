const router = require('express').Router();
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const { getAll, create, remove } = require('../controllers/userController');

router.use(auth);

router.get('/', getAll);

router.post('/', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['admin', 'receptionist']).withMessage('Role must be admin or receptionist'),
], create);

router.delete('/:id', remove);

module.exports = router;
