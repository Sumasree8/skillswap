const express = require('express');
const router = express.Router();
const { getFeed, swipe, getMatches, resetFeed } = require('../controllers/swipeController');
const { protect } = require('../middleware/auth');

router.get('/feed', protect, getFeed);
router.get('/matches', protect, getMatches);
router.post('/reset', protect, resetFeed);
router.post('/', protect, swipe);

module.exports = router;
