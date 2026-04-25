const express = require('express');
const router = express.Router();
const { getMatches, getUserById, updateProfile, verifySkill, searchUsers } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/match', protect, getMatches);
router.get('/search', protect, searchUsers);
router.put('/profile', protect, updateProfile);
router.post('/verify-skill', protect, verifySkill);
router.get('/:id', protect, getUserById);

module.exports = router;
