const router = require('express').Router();
const auth = require('../middleware/auth');
const { getAll, checkIn, checkOut, today } = require('../controllers/attendanceController');

router.use(auth);

router.get('/', getAll);
router.get('/today', today);
router.post('/checkin', checkIn);
router.put('/checkout/:id', checkOut);

module.exports = router;
