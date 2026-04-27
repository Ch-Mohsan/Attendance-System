const express = require('express');
const router = express.Router();
const { markAttendance, getAttendance, getTodayTeamSummary, getMonthlyPresentSummary, getTodayMyTeamSummary, getMonthlyMyTeamSummary, getTodayAttendanceForTeam } = require('../controllers/attendanceController');
const auth = require('../middleware/auth');

// Mark attendance
router.post('/mark', auth, markAttendance);

// Get all attendance records
router.get('/', getAttendance);

// Admin: Get today's present count per team
router.get('/summary/today', getTodayTeamSummary);

// Admin: Get monthly present count per student per team
router.get('/summary/monthly', getMonthlyPresentSummary);

// Leader: Get today's present students for their own team
router.get('/summary/today/my', auth, getTodayMyTeamSummary);

// Leader: Get monthly summary for their own team
router.get('/summary/monthly/my', auth, getMonthlyMyTeamSummary);

// Leader: Get today's attendance records for their own team
router.get('/today/my', auth, getTodayAttendanceForTeam);

module.exports = router; 