const Attendance = require('../models/Attendance');
const { MonthlyAttendanceSummary } = require('../models/Attendance');
const Team = require('../models/Team');
const User = require('../models/User');

// Mark attendance
exports.markAttendance = async (req, res) => {
  try {
    const { teamId, memberId, status, date } = req.body;
    const markerId = req.user.id; // Person marking the attendance

    // Check if the attendance is being marked for a leader
    const user = await User.findById(memberId);
    const team = await Team.findById(teamId);

    if (!user || !team) {
      return res.status(404).json({ message: 'User or team not found' });
    }

    // Auto-approve if the member is a leader and marking their own attendance
    const isAutoApproved = user.isLeader && user.leaderApprovalStatus === 'Approved' && 
                         memberId === markerId;

    const attendance = new Attendance({
      team: teamId,
      member: memberId,
      date: new Date(date),
      status,
      approved: isAutoApproved, // Auto-approved for leaders
      markedBy: markerId
    });

    await attendance.save();

    // Update MonthlyAttendanceSummary for both Present and Absent
    const month = date.slice(0, 7); // 'YYYY-MM'
    if (status === 'Present') {
      await MonthlyAttendanceSummary.findOneAndUpdate(
        { user: memberId, team: teamId, month },
        { $inc: { presentCount: 1 } },
        { upsert: true, new: true }
      );
    } else if (status === 'Absent') {
      await MonthlyAttendanceSummary.findOneAndUpdate(
        { user: memberId, team: teamId, month },
        { $inc: { absentCount: 1 } },
        { upsert: true, new: true }
      );
    }

    res.status(201).json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all attendance records
exports.getAttendance = async (req, res) => {
  try {
    const records = await Attendance.find()
      .populate('team')
      .populate({
        path: 'member',
        select: 'username name email',
      })
      .populate('markedBy', 'username');
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: Get today's present count per team
exports.getTodayTeamSummary = async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const records = await Attendance.find({ date: { $gte: today, $lt: today + 'T23:59:59.999Z' }, status: 'Present' })
      .populate('team', 'teamName')
      .populate('member', 'username name email');
    // Group by team
    const summary = {};
    records.forEach(r => {
      const teamId = r.team?._id;
      if (!teamId) return;
      if (!summary[teamId]) summary[teamId] = { teamName: r.team.teamName, presentCount: 0 };
      summary[teamId].presentCount++;
    });
    res.json(Object.values(summary));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: Get monthly present count per student per team
exports.getMonthlyPresentSummary = async (req, res) => {
  try {
    const { month } = req.query; // e.g., '2025-06'
    const filter = month ? { month } : {};
    const summaries = await MonthlyAttendanceSummary.find(filter)
      .populate('user', 'username name email')
      .populate('team', 'teamName');
    res.json(summaries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get today's present students for the current leader's team
exports.getTodayMyTeamSummary = async (req, res) => {
  try {
    const team = await Team.findOne({ leader: req.user.id });
    if (!team) return res.status(404).json({ message: "No team found for this leader." });
    const today = new Date().toISOString().slice(0, 10);
    const records = await Attendance.find({
      team: team._id,
      date: { $gte: today, $lt: today + 'T23:59:59.999Z' },
      status: 'Present'
    }).populate('member', 'username name email');
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get monthly summary for the current leader's team
exports.getMonthlyMyTeamSummary = async (req, res) => {
  try {
    const { month } = req.query;
    const team = await Team.findOne({ leader: req.user.id });
    if (!team) return res.status(404).json({ message: "No team found for this leader." });
    const filter = { team: team._id };
    if (month) filter.month = month;
    const summaries = await MonthlyAttendanceSummary.find(filter)
      .populate('user', 'username name email');
    res.json(summaries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get today's attendance records for the current leader's team
exports.getTodayAttendanceForTeam = async (req, res) => {
  try {
    const team = await Team.findOne({ leader: req.user.id });
    if (!team) return res.status(404).json({ message: "No team found for this leader." });
    const today = new Date().toISOString().slice(0, 10);
    const records = await Attendance.find({
      team: team._id,
      date: { $gte: today, $lt: today + 'T23:59:59.999Z' }
    });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 