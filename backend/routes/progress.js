const express = require('express');
const Progress = require('../models/Progress');
const { auth } = require('../middleware/auth');

const router = express.Router();

// GET /api/progress — get progress for current user's match
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'new_member') query.newMember = req.user.id;
    if (req.user.role === 'buddy') query.buddy = req.user.id;

    const progress = await Progress.find(query)
      .populate('newMember', 'name email department avatar')
      .populate('buddy', 'name email department avatar')
      .populate('match');
    res.json(progress);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/progress/:matchId
router.get('/:matchId', auth, async (req, res) => {
  try {
    const progress = await Progress.findOne({ match: req.params.matchId })
      .populate('newMember', 'name email department avatar')
      .populate('buddy', 'name email department avatar');
    if (!progress) return res.status(404).json({ message: 'Progress not found' });
    res.json(progress);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/progress/:matchId — update milestones or buddy report
router.put('/:matchId', auth, async (req, res) => {
  try {
    const { milestones, buddyReport, overallProgress } = req.body;
    const updates = { lastUpdated: Date.now() };
    if (milestones !== undefined) updates.milestones = milestones;
    if (buddyReport !== undefined) updates.buddyReport = buddyReport;
    if (overallProgress !== undefined) updates.overallProgress = overallProgress;

    const progress = await Progress.findOneAndUpdate(
      { match: req.params.matchId },
      updates,
      { new: true }
    )
      .populate('newMember', 'name email department avatar')
      .populate('buddy', 'name email department avatar');
    res.json(progress);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
