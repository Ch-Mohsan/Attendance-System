const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['Present', 'Absent'], required: true },
  approved: { type: Boolean, default: false },
  markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

const monthlyAttendanceSummarySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  month: { type: String, required: true }, // e.g., '2025-06'
  presentCount: { type: Number, default: 0 },
  absentCount: { type: Number, default: 0 },
});

module.exports = mongoose.model('Attendance', attendanceSchema);
module.exports.MonthlyAttendanceSummary = mongoose.model('MonthlyAttendanceSummary', monthlyAttendanceSummarySchema); 