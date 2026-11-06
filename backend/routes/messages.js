const express = require('express');
const Message = require('../models/Message');
const Match = require('../models/Match');
const { auth } = require('../middleware/auth');

const router = express.Router();

// GET /api/messages/:matchId
router.get('/:matchId', auth, async (req, res) => {
  try {
    const messages = await Message.find({ match: req.params.matchId })
      .populate('sender', 'name avatar role')
      .sort({ createdAt: 1 });

    // Mark as read
    await Message.updateMany(
      { match: req.params.matchId, sender: { $ne: req.user.id }, read: false },
      { read: true }
    );

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/messages/:matchId
router.post('/:matchId', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const message = await Message.create({
      match: req.params.matchId,
      sender: req.user.id,
      content,
    });
    const populated = await message.populate('sender', 'name avatar role');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
