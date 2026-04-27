const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const auth = require('../middleware/auth');

// Get teams for current student
router.get('/student', auth, teamController.getStudentTeams);

// Add a new team
router.post('/', auth, teamController.addTeam);

// Get all teams
router.get('/', auth, teamController.getTeams);

// Add a member to a team
router.post('/:teamId/members', auth, teamController.addMember);

// Approve a member
router.patch('/:teamId/members/:memberId/approve', auth, teamController.approveMember);

// Get my team
router.get('/my', auth, teamController.getMyTeam);

// Get user's membership status
router.get('/my-membership-status', auth, teamController.getMyMembershipStatus);

module.exports = router; 