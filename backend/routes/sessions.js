const express = require('express');
const router = express.Router();
const { createSession, joinSession, completeSession, getOpenSessions, getMySessions, getSessionById } = require('../controllers/sessionController');
const { protect } = require('../middleware/auth');

router.post('/create', protect, createSession);
router.post('/join', protect, joinSession);
router.get('/open', protect, getOpenSessions);
router.get('/my', protect, getMySessions);
router.get('/:id', protect, getSessionById);
router.put('/:id/complete', protect, completeSession);

module.exports = router;
