const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema(
  {
    match: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', required: true },
    newMember: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    buddy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    milestones: [
      {
        title: { type: String, required: true },
        description: { type: String, default: '' },
        completed: { type: Boolean, default: false },
        completedAt: { type: Date },
      },
    ],
    overallProgress: { type: Number, default: 0, min: 0, max: 100 },
    buddyReport: { type: String, default: '' },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Progress', progressSchema);
