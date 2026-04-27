const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUsers, requestLeaderStatus, approveLeaderStatus, getLeaderRequests, requestLeader, validateUser, findUserByEmail } = require('../controllers/userController');
const auth = require('../middleware/auth');

// Register a new user
router.post('/register', registerUser);

// Login user
router.post('/login', loginUser);

// Get all users
router.get('/', auth, getUsers);

router.put('/approve-leader/:userId', auth, approveLeaderStatus);
router.get('/leader-requests', auth, getLeaderRequests);

// Student requests to become a leader
router.post('/request-leader', auth, requestLeader);

// Validate user token and return user info
router.get('/validate', auth, validateUser);

// Approve leader status (admin only)
router.patch('/approve-leader/:userId', auth, approveLeaderStatus);

// Find user by email
router.get('/find-by-email', auth, findUserByEmail);

module.exports = router; 