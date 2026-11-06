const mongoose = require('mongoose');

const evaluationSchema = new mongoose.Schema(
  {
    match: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', required: true },
    evaluator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    evaluatee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['member_rates_buddy', 'buddy_rates_member'], required: true },
    ratings: {
      communication: { type: Number, min: 1, max: 5 },
      helpfulness: { type: Number, min: 1, max: 5 },
      availability: { type: Number, min: 1, max: 5 },
      overall: { type: Number, min: 1, max: 5 },
    },
    feedback: { type: String, default: '' },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Evaluation', evaluationSchema);
