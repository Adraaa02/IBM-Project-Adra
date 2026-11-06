const express = require('express');
const Match = require('../models/Match');
const User = require('../models/User');
const Progress = require('../models/Progress');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/matches
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'new_member') query.newMember = req.user.id;
    if (req.user.role === 'buddy') query.buddy = req.user.id;

    const matches = await Match.find(query)
      .populate('newMember', '-password -__v')
      .populate('buddy', '-password -__v');
    res.json(matches);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/matches — admin only
router.post('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const { newMemberId, buddyId, notes, matchedBy } = req.body;
    const existing = await Match.findOne({ newMember: newMemberId, status: 'active' });
    if (existing) return res.status(400).json({ message: 'New member already has an active buddy' });

    const match = await Match.create({
      newMember: newMemberId,
      buddy: buddyId,
      notes,
      matchedBy: matchedBy || 'manual',
    });

    // Create default progress tracker
    await Progress.create({
      match: match._id,
      newMember: newMemberId,
      buddy: buddyId,
      milestones: [
        { title: 'First meeting with buddy' },
        { title: 'Campus orientation tour' },
        { title: 'Introduction to organization culture' },
        { title: 'Attend first organization event' },
        { title: 'Complete onboarding checklist' },
      ],
    });

    const populated = await match.populate([
      { path: 'newMember', select: '-password -__v' },
      { path: 'buddy', select: '-password -__v' },
    ]);
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/matches/auto — auto match
router.post('/auto', auth, requireRole('admin'), async (req, res) => {
  try {
    const unmatchedMembers = await User.find({ role: 'new_member' });
    const activeMatchIds = (await Match.find({ status: 'active' })).map((m) => m.newMember.toString());
    const unmatched = unmatchedMembers.filter((m) => !activeMatchIds.includes(m._id.toString()));

    const buddies = await User.find({ role: 'buddy' });
    if (!buddies.length) return res.status(400).json({ message: 'No buddies available' });

    const created = [];
    for (let i = 0; i < unmatched.length; i++) {
      const buddy = buddies[i % buddies.length];
      const match = await Match.create({
        newMember: unmatched[i]._id,
        buddy: buddy._id,
        matchedBy: 'auto',
      });
      await Progress.create({
        match: match._id,
        newMember: unmatched[i]._id,
        buddy: buddy._id,
        milestones: [
          { title: 'First meeting with buddy' },
          { title: 'Campus orientation tour' },
          { title: 'Introduction to organization culture' },
          { title: 'Attend first organization event' },
          { title: 'Complete onboarding checklist' },
        ],
      });
      created.push(match);
    }
    res.json({ matched: created.length, matches: created });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/matches/:id — update status
router.put('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const match = await Match.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('newMember', '-password -__v')
      .populate('buddy', '-password -__v');
    res.json(match);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/matches/:id
router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    await Match.findByIdAndDelete(req.params.id);
    res.json({ message: 'Match deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
