const Swap = require('../models/Swap');
const User = require('../models/User');
const { earnCredits } = require('../services/creditService');

/**
 * POST /api/swaps/request
 */
const requestSwap = async (req, res) => {
  try {
    const { receiverId, requesterSkill, receiverSkill, message } = req.body;
    if (!receiverId || !requesterSkill || !receiverSkill) {
      return res.status(400).json({ success: false, message: 'receiverId, requesterSkill, receiverSkill required' });
    }
    if (receiverId === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot swap with yourself' });
    }

    const existing = await Swap.findOne({
      requester: req.user._id,
      receiver: receiverId,
      status: { $in: ['pending', 'accepted', 'in_progress'] },
    });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Active swap already exists with this user' });
    }

    const swap = await Swap.create({
      requester: req.user._id,
      receiver: receiverId,
      requesterSkill,
      receiverSkill,
      message: message || '',
    });

    await swap.populate(['requester', 'receiver']);

    // Notify receiver
    req.io.to(`user_${receiverId}`).emit('swap:new_request', { swap });

    res.status(201).json({ success: true, swap });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PUT /api/swaps/:id/accept
 */
const acceptSwap = async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id).populate(['requester', 'receiver']);
    if (!swap) return res.status(404).json({ success: false, message: 'Swap not found' });
    if (swap.receiver._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (swap.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Swap is not pending' });
    }

    swap.status = 'accepted';
    await swap.save();

    req.io.to(`user_${swap.requester._id}`).emit('swap:accepted', { swap });

    res.json({ success: true, swap });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PUT /api/swaps/:id/reject
 */
const rejectSwap = async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id);
    if (!swap) return res.status(404).json({ success: false, message: 'Swap not found' });
    if (swap.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    swap.status = 'rejected';
    await swap.save();
    await swap.populate(['requester', 'receiver']);

    req.io.to(`user_${swap.requester._id}`).emit('swap:rejected', { swap });

    res.json({ success: true, swap });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PUT /api/swaps/:id/complete
 */
const completeSwap = async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id).populate(['requester', 'receiver']);
    if (!swap) return res.status(404).json({ success: false, message: 'Swap not found' });

    const isParticipant =
      swap.requester._id.toString() === req.user._id.toString() ||
      swap.receiver._id.toString() === req.user._id.toString();
    if (!isParticipant) return res.status(403).json({ success: false, message: 'Not authorized' });
    if (!['accepted', 'in_progress'].includes(swap.status)) {
      return res.status(400).json({ success: false, message: 'Swap cannot be completed in current status' });
    }

    swap.status = 'completed';
    swap.completedAt = new Date();
    await swap.save();

    // Earn credits for both
    await earnCredits(swap.requester._id, 30, `Swap completed: ${swap.receiverSkill}`, swap._id, 'Swap');
    await earnCredits(swap.receiver._id, 30, `Swap completed: ${swap.requesterSkill}`, swap._id, 'Swap');

    // Update stats
    await User.findByIdAndUpdate(swap.requester._id, { $inc: { swapsCompleted: 1 } });
    await User.findByIdAndUpdate(swap.receiver._id, { $inc: { swapsCompleted: 1 } });

    req.io.to(`user_${swap.requester._id}`).emit('swap:completed', { swap });
    req.io.to(`user_${swap.receiver._id}`).emit('swap:completed', { swap });

    res.json({ success: true, swap });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PUT /api/swaps/:id/cancel
 */
const cancelSwap = async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id);
    if (!swap) return res.status(404).json({ success: false, message: 'Swap not found' });
    const isParticipant =
      swap.requester.toString() === req.user._id.toString() ||
      swap.receiver.toString() === req.user._id.toString();
    if (!isParticipant) return res.status(403).json({ success: false, message: 'Not authorized' });

    swap.status = 'cancelled';
    await swap.save();
    res.json({ success: true, swap });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/swaps/my
 */
const getMySwaps = async (req, res) => {
  try {
    const swaps = await Swap.find({
      $or: [{ requester: req.user._id }, { receiver: req.user._id }],
    })
      .populate('requester', 'name avatar rating ratingCount')
      .populate('receiver', 'name avatar rating ratingCount')
      .sort({ updatedAt: -1 });

    res.json({ success: true, swaps });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/swaps/:id
 */
const getSwapById = async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id)
      .populate('requester', 'name avatar bio skillsOffered rating ratingCount')
      .populate('receiver', 'name avatar bio skillsOffered rating ratingCount');
    if (!swap) return res.status(404).json({ success: false, message: 'Swap not found' });
    res.json({ success: true, swap });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { requestSwap, acceptSwap, rejectSwap, completeSwap, cancelSwap, getMySwaps, getSwapById };
