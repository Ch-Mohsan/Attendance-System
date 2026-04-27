const Team = require('../models/Team');
const User = require('../models/User');

// Add a new team
exports.addTeam = async (req, res) => {
    try {
        const { teamName, skill, timetable } = req.body;
        const leaderId = req.user.id; // Assuming you have authentication middleware

        // Check if user is approved as leader
        const leader = await User.findById(leaderId);
        if (!leader || !leader.isLeader || leader.leaderApprovalStatus !== 'Approved') {
            return res.status(403).json({ 
                message: 'You must be an approved leader to create a team. Please request leader status first.' 
            });
        }

        const team = new Team({
            teamName,
            skill,
            leader: leaderId,
            timetable,
            members: [{
                user: leaderId,
                name: leader.username,
                email: leader.email,
                skill: skill,
                status: 'Approved' // Leader is automatically approved in their team
            }]
        });

        await team.save();
        res.status(201).json(team);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all teams
exports.getTeams = async (req, res) => {
    try {
        const teams = await Team.find();
        res.json(teams);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get teams for current student
exports.getStudentTeams = async (req, res) => {
    try {
        const userId = req.user.id; // Get the current user's ID from auth middleware

        // Find all teams where the user is a member
        const teams = await Team.find({
            'members.user': userId
        });

        // Format the response to include membership status
        const formattedTeams = teams.map(team => {
            const memberDetails = team.members.find(member => member.user.toString() === userId);
            return {
                _id: team._id,
                teamName: team.teamName,
                skill: team.skill,
                leader: team.leader,
                status: memberDetails ? memberDetails.status : 'Unknown',
                createdAt: team.createdAt
            };
        });

        res.json(formattedTeams);
    } catch (error) {
        console.error('Error in getStudentTeams:', error);
        res.status(500).json({ message: error.message });
    }
};

// Add a member to a team
exports.addMember = async (req, res) => {
    try {
        const { teamId } = req.params;
        const { userId, name, email, skill } = req.body;

        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        team.members.push({
            user: userId,
            name,
            email,
            skill,
            status: 'Pending'
        });

        await team.save();
        res.status(201).json(team);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Approve a member
exports.approveMember = async (req, res) => {
    try {
        const { teamId, memberId } = req.params;
        
        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        const member = team.members.id(memberId);
        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }

        member.status = 'Approved';
        await team.save();
        
        res.json(team);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getMyTeam = async (req, res) => {
  try {
    const team = await Team.findOne({ leader: req.user.id });
    if (!team) return res.status(404).json({ message: "No team found for this leader." });
    res.json(team);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyMembershipStatus = async (req, res) => {
  try {
    // Get user ID safely, considering both _id and id fields
    const userId = req.user._id || req.user.id;
    
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated properly" });
    }

    const teams = await Team.find({ "members.user": userId });
    
    if (teams.length === 0) {
      return res.json({ status: "Not Found" });
    }

    // Find the team where the user is a member
    const team = teams[0];
    const member = team.members.find(m => {
      if (!m.user) return false;
      const memberId = m.user._id || m.user;
      return memberId && memberId.toString() === userId.toString();
    });
    
    if (!member) {
      return res.json({ status: "Not Found" });
    }

    return res.json({ status: member.status });
  } catch (error) {
    console.error("Error checking membership status:", error);
    res.status(500).json({ message: "Error checking membership status" });
  }
}; 