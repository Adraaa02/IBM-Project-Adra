const express = require('express');
const Evaluation = require('../models/Evaluation');
const { auth } = require('../middleware/auth');

const router = express.Router();

// GET /api/evaluations
router.get('/', auth, async (req, res) => {
  try {
    const query =
      req.user.role === 'admin'
        ? {}
        : { $or: [{ evaluator: req.user.id }, { evaluatee: req.user.id }] };

    const evaluations = await Evaluation.find(query)
      .populate('evaluator', 'name avatar role')
      .populate('evaluatee', 'name avatar role')
      .populate('match');
    res.json(evaluations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/evaluations
router.post('/', auth, async (req, res) => {
  try {
    const { matchId, evaluateeId, type, ratings, feedback } = req.body;

    const existing = await Evaluation.findOne({
      match: matchId,
      evaluator: req.user.id,
      type,
    });
    if (existing) return res.status(400).json({ message: 'Evaluation already submitted' });

    const evaluation = await Evaluation.create({
      match: matchId,
      evaluator: req.user.id,
      evaluatee: evaluateeId,
      type,
      ratings,
      feedback,
    });
    const populated = await evaluation.populate([
      { path: 'evaluator', select: 'name avatar role' },
      { path: 'evaluatee', select: 'name avatar role' },
    ]);
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
