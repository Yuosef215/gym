const router = require('express').Router();
const auth = require('../middleware/auth');
const { getAll, checkIn, checkOut, today, scanQR } = require('../controllers/attendanceController');

router.use(auth);

router.get('/', getAll);
router.get('/today', today);
router.post('/checkin', checkIn);
router.post('/scan-qr', scanQR);
router.put('/checkout/:id', checkOut);

module.exports = router;
