const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
  email: String,
  skill: String,
  status: { type: String, enum: ['Pending', 'Approved'], default: 'Pending' },
});

const teamSchema = new mongoose.Schema({
  teamName: { type: String, required: true },
  skill: { type: String, required: true },
  leader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  timetable: [{
    day: { type: String },
    startTime: { type: String },
    endTime: { type: String },
    venue: { type: String }
  }],
  members: [memberSchema],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Team', teamSchema); 