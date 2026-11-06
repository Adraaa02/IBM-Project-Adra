const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['admin', 'buddy', 'new_member'],
      default: 'new_member',
    },
    avatar: { type: String, default: '' },
    phone: { type: String, default: '' },
    department: { type: String, default: '' },
    bio: { type: String, default: '' },
    interests: [{ type: String }],
    isActive: { type: Boolean, default: true },
    joinedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
