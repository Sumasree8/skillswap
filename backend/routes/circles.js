const express = require('express');
const router = express.Router();
const { createCircle, joinCircle, completeCircle, getCircles, getMyCircles } = require('../controllers/circleController');
const { protect } = require('../middleware/auth');

router.post('/create', protect, createCircle);
router.get('/', protect, getCircles);
router.get('/my', protect, getMyCircles);
router.post('/:id/join', protect, joinCircle);
router.put('/:id/complete', protect, completeCircle);

module.exports = router;
