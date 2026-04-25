const express = require('express');
const router = express.Router();
const { requestSwap, acceptSwap, rejectSwap, completeSwap, cancelSwap, getMySwaps, getSwapById } = require('../controllers/swapController');
const { protect } = require('../middleware/auth');

router.post('/request', protect, requestSwap);
router.get('/my', protect, getMySwaps);
router.get('/:id', protect, getSwapById);
router.put('/:id/accept', protect, acceptSwap);
router.put('/:id/reject', protect, rejectSwap);
router.put('/:id/complete', protect, completeSwap);
router.put('/:id/cancel', protect, cancelSwap);

module.exports = router;
