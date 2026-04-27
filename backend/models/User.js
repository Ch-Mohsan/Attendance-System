const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  contact: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Owner', 'Student'], required: true },
  isLeader: { type: Boolean, default: false },
  leaderApprovalStatus: { type: String, enum: ['Pending', 'Approved', 'Not Requested', 'Rejected'], default: 'Not Requested' },
  leaderApprovedAt: { type: Date },
  requestedTeam: {
    teamName: { type: String },
    skill: { type: String }
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema); 