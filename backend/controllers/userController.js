const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Team = require('../models/Team');

const JWT_SECRET = 'your-secret-key'; // In production, this should be in environment variables

// Register a new user
exports.registerUser = async (req, res) => {
  try {
    const { username, contact, email, password, role } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Check if user already exists
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const user = new User({
      username,
      contact,
      email: normalizedEmail,
      password: hashedPassword,
      role
    });
    
    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isLeader: user.isLeader,
        leaderApprovalStatus: user.leaderApprovalStatus
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login user
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Find user by email
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isLeader: user.isLeader,
        leaderApprovalStatus: user.leaderApprovalStatus
      },
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Request to become a leader
exports.requestLeaderStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.leaderApprovalStatus !== 'Not Requested') {
      return res.status(400).json({ message: 'Leader status has already been requested' });
    }

    user.leaderApprovalStatus = 'Pending';
    await user.save();

    res.status(200).json({ message: 'Leader status requested successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Approve leader status (admin only)
exports.approveLeaderStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.leaderApprovalStatus !== 'Pending') {
      return res.status(400).json({ message: 'User has not requested leader status or is already approved' });
    }
    if (!user.requestedTeam || !user.requestedTeam.teamName || !user.requestedTeam.skill) {
      return res.status(400).json({ message: 'Requested team information is missing. Cannot create team.' });
    }
    user.leaderApprovalStatus = 'Approved';
    user.isLeader = true;
    user.leaderApprovedAt = new Date();
    await user.save();

    // Create a new team for the leader
    const team = new Team({
      teamName: user.requestedTeam.teamName,
      skill: user.requestedTeam.skill,
      leader: user._id,
      members: [{
        user: user._id,
        name: user.username,
        email: user.email,
        skill: user.requestedTeam.skill,
        status: 'Approved'
      }]
    });
    await team.save();

    res.status(200).json({ message: 'Leader status approved and team created successfully', team });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all leader requests
exports.getLeaderRequests = async (req, res) => {
  try {
    const requests = await User.find({ leaderApprovalStatus: 'Pending' })
      .select('username email contact createdAt requestedTeam');
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Student requests to become a leader
exports.requestLeader = async (req, res) => {
  try {
    const userId = req.user.id;
    const { teamName, skill } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.leaderApprovalStatus === 'Pending') {
      return res.status(400).json({ message: 'You already have a pending leader request.' });
    }
    if (user.leaderApprovalStatus === 'Approved') {
      return res.status(400).json({ message: 'You are already an approved leader.' });
    }

    user.leaderApprovalStatus = 'Pending';
    user.requestedTeam = { teamName, skill };
    await user.save();

    res.json({ message: 'Leader request submitted successfully.', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.validateUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Find user by email
exports.findUserByEmail = async (req, res) => {
  try {
    const { email } = req.query;
    const normalizedEmail = String(email || '').trim().toLowerCase();
    if (!normalizedEmail) return res.status(400).json({ message: 'Email is required' });
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 