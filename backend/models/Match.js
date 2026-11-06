const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema(
  {
    newMember: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    buddy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['pending', 'active', 'completed'],
      default: 'active',
    },
    matchedBy: { type: String, enum: ['auto', 'manual'], default: 'manual' },
    notes: { type: String, default: '' },
    matchedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Match', matchSchema);
