const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const connectDB = require('../utilities/db');
const User = require('../models/User');
const Team = require('../models/Team');
const Attendance = require('../models/Attendance');
const { MonthlyAttendanceSummary } = require('../models/Attendance');

const resetData = process.argv.includes('--reset');

const users = [
  {
    username: 'Usman Javed',
    contact: '03001234567',
    email: 'student@gmail.com',
    password: 'student123',
    role: 'Student',
    leaderApprovalStatus: 'Not Requested',
    createdAt: new Date('2026-04-01T09:00:00.000Z'),
  },
  {
    username: 'Areeba Khan',
    contact: '03007654321',
    email: 'areeba.khan@thinkcode.pk',
    password: 'Ayesha@123',
    role: 'Student',
    leaderApprovalStatus: 'Pending',
    requestedTeam: {
      teamName: 'Islamabad AI Team',
      skill: 'Python ML'
    },
    createdAt: new Date('2026-04-02T09:00:00.000Z'),
  },
  {
    username: 'Hassan Raza',
    contact: '03005556677',
    email: 'hassan.raza@thinkcode.pk',
    password: 'Ali@12345',
    role: 'Student',
    isLeader: true,
    leaderApprovalStatus: 'Approved',
    leaderApprovedAt: new Date('2026-04-03T10:00:00.000Z'),
    requestedTeam: {
      teamName: 'Karachi Mobile Team',
      skill: 'React Native'
    },
    createdAt: new Date('2026-04-03T09:00:00.000Z'),
  },
  {
    username: 'Sana Fatima',
    contact: '03009998877',
    email: 'sana.fatima@thinkcode.pk',
    password: 'Sara@12345',
    role: 'Student',
    leaderApprovalStatus: 'Not Requested',
    createdAt: new Date('2026-04-04T09:00:00.000Z'),
  },
  {
    username: 'ThinkCode Admin',
    contact: '03001112222',
    email: 'admin@thinkcode.pk',
    password: 'admin123',
    role: 'Owner',
    isLeader: true,
    leaderApprovalStatus: 'Approved',
    leaderApprovedAt: new Date('2026-04-01T09:00:00.000Z'),
    createdAt: new Date('2026-04-01T09:00:00.000Z'),
  },
  {
    username: 'Nida Noor',
    contact: '03008887766',
    email: 'nida.noor@thinkcode.pk',
    password: 'Nida@12345',
    role: 'Owner',
    isLeader: true,
    leaderApprovalStatus: 'Approved',
    leaderApprovedAt: new Date('2026-04-02T09:00:00.000Z'),
    createdAt: new Date('2026-04-02T09:00:00.000Z'),
  },
];

const attendancePlan = [
  { teamName: 'Lahore Web Team', email: 'student@gmail.com', date: '2026-04-21', status: 'Present' },
  { teamName: 'Lahore Web Team', email: 'areeba.khan@thinkcode.pk', date: '2026-04-21', status: 'Absent' },
  { teamName: 'Lahore Web Team', email: 'student@gmail.com', date: '2026-04-23', status: 'Present' },
  { teamName: 'Karachi Mobile Team', email: 'hassan.raza@thinkcode.pk', date: '2026-04-22', status: 'Present' },
  { teamName: 'Karachi Mobile Team', email: 'sana.fatima@thinkcode.pk', date: '2026-04-22', status: 'Present' },
  { teamName: 'Karachi Mobile Team', email: 'sana.fatima@thinkcode.pk', date: '2026-04-24', status: 'Absent' },
  { teamName: 'Islamabad AI Team', email: 'areeba.khan@thinkcode.pk', date: '2026-04-25', status: 'Present' },
  { teamName: 'Islamabad AI Team', email: 'student@gmail.com', date: '2026-04-25', status: 'Present' },
];

async function upsertUser(userData) {
  const existing = await User.findOne({ email: userData.email });
  const hashedPassword = await bcrypt.hash(userData.password, 10);

  if (existing) {
    Object.assign(existing, {
      username: userData.username,
      contact: userData.contact,
      password: hashedPassword,
      role: userData.role,
      isLeader: Boolean(userData.isLeader),
      leaderApprovalStatus: userData.leaderApprovalStatus || 'Not Requested',
      leaderApprovedAt: userData.leaderApprovedAt || null,
      requestedTeam: userData.requestedTeam || {},
      createdAt: userData.createdAt,
    });
    await existing.save();
    return existing;
  }

  return User.create({
    ...userData,
    password: hashedPassword,
  });
}

async function rebuildMonthlySummary() {
  await MonthlyAttendanceSummary.deleteMany({});

  const records = await Attendance.find({});
  const summaryMap = new Map();

  for (const record of records) {
    const month = record.date.toISOString().slice(0, 7);
    const key = `${record.member.toString()}_${record.team.toString()}_${month}`;
    if (!summaryMap.has(key)) {
      summaryMap.set(key, {
        user: record.member,
        team: record.team,
        month,
        presentCount: 0,
        absentCount: 0,
      });
    }

    const summary = summaryMap.get(key);
    if (record.status === 'Present') summary.presentCount += 1;
    if (record.status === 'Absent') summary.absentCount += 1;
  }

  if (summaryMap.size > 0) {
    await MonthlyAttendanceSummary.insertMany([...summaryMap.values()]);
  }
}

async function seed() {
  await connectDB();

  if (resetData) {
    await Promise.all([
      Attendance.deleteMany({}),
      MonthlyAttendanceSummary.deleteMany({}),
      Team.deleteMany({}),
      User.deleteMany({}),
    ]);
  }

  // Step 1: Seed users with role and approval states.
  const savedUsers = new Map();
  for (const user of users) {
    const saved = await upsertUser(user);
    savedUsers.set(saved.email, saved);
  }

  const admin = savedUsers.get('admin@thinkcode.pk');
  const nida = savedUsers.get('nida.noor@thinkcode.pk');
  const usman = savedUsers.get('student@gmail.com');
  const areeba = savedUsers.get('areeba.khan@thinkcode.pk');
  const hassan = savedUsers.get('hassan.raza@thinkcode.pk');
  const sana = savedUsers.get('sana.fatima@thinkcode.pk');

  // Step 2: Seed teams and members with references to users.
  const teams = [
    {
      teamName: 'Lahore Web Team',
      skill: 'MERN Stack',
      leader: admin._id,
      createdAt: new Date('2026-04-05T10:00:00.000Z'),
      timetable: [
        { day: 'Monday', startTime: '09:30', endTime: '11:30', venue: 'Lahore Campus Lab 1' },
        { day: 'Wednesday', startTime: '09:30', endTime: '11:30', venue: 'Lahore Campus Lab 1' },
        { day: 'Friday', startTime: '09:30', endTime: '11:30', venue: 'Lahore Campus Lab 1' },
      ],
      members: [
        { user: admin._id, name: admin.username, email: admin.email, skill: 'MERN Stack', status: 'Approved' },
        { user: usman._id, name: usman.username, email: usman.email, skill: 'MERN Stack', status: 'Approved' },
        { user: areeba._id, name: areeba.username, email: areeba.email, skill: 'MERN Stack', status: 'Pending' },
      ],
    },
    {
      teamName: 'Karachi Mobile Team',
      skill: 'React Native',
      leader: hassan._id,
      createdAt: new Date('2026-04-06T10:00:00.000Z'),
      timetable: [
        { day: 'Tuesday', startTime: '11:00', endTime: '13:00', venue: 'Karachi Tech Hub' },
        { day: 'Thursday', startTime: '11:00', endTime: '13:00', venue: 'Karachi Tech Hub' },
      ],
      members: [
        { user: hassan._id, name: hassan.username, email: hassan.email, skill: 'React Native', status: 'Approved' },
        { user: sana._id, name: sana.username, email: sana.email, skill: 'React Native', status: 'Approved' },
      ],
    },
    {
      teamName: 'Islamabad AI Team',
      skill: 'Python ML',
      leader: nida._id,
      createdAt: new Date('2026-04-07T10:00:00.000Z'),
      timetable: [
        { day: 'Monday', startTime: '14:00', endTime: '16:00', venue: 'Islamabad Innovation Center' },
        { day: 'Thursday', startTime: '14:00', endTime: '16:00', venue: 'Islamabad Innovation Center' },
      ],
      members: [
        { user: nida._id, name: nida.username, email: nida.email, skill: 'Python ML', status: 'Approved' },
        { user: areeba._id, name: areeba.username, email: areeba.email, skill: 'Python ML', status: 'Approved' },
        { user: usman._id, name: usman.username, email: usman.email, skill: 'Python ML', status: 'Approved' },
      ],
    },
  ];

  const teamMap = new Map();
  for (const teamData of teams) {
    const existingTeam = await Team.findOne({ teamName: teamData.teamName });
    if (existingTeam) {
      await Team.updateOne({ _id: existingTeam._id }, { $set: teamData });
      teamMap.set(teamData.teamName, await Team.findById(existingTeam._id));
      continue;
    }
    const created = await Team.create(teamData);
    teamMap.set(teamData.teamName, created);
  }

  // Step 3: Seed attendance using existing team/member references.
  const attendanceRecords = attendancePlan.map((item) => {
    const team = teamMap.get(item.teamName);
    const user = savedUsers.get(item.email);
    const marker = team.leader.toString() === user._id.toString() ? user : admin;
    return {
      team: team._id,
      member: user._id,
      date: new Date(`${item.date}T00:00:00.000Z`),
      status: item.status,
      approved: marker._id.toString() === user._id.toString() ? true : item.status === 'Present',
      markedBy: marker._id,
    };
  });

  if (resetData) {
    await Attendance.deleteMany({});
    await Attendance.insertMany(attendanceRecords);
  } else {
    for (const record of attendanceRecords) {
      const existingRecord = await Attendance.findOne({
        team: record.team,
        member: record.member,
        date: record.date,
      });
      if (existingRecord) {
        await Attendance.updateOne({ _id: existingRecord._id }, { $set: record });
      } else {
        await Attendance.create(record);
      }
    }
  }

  // Step 4: Build monthly summary records from attendance data.
  await rebuildMonthlySummary();

  const counts = {
    users: await User.countDocuments(),
    teams: await Team.countDocuments(),
    attendance: await Attendance.countDocuments(),
    monthlySummary: await MonthlyAttendanceSummary.countDocuments(),
  };

  console.log('Demo seed completed successfully with proper model flow.');
  console.log(counts);
  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error('Seed failed:', error);
  await mongoose.disconnect();
  process.exit(1);
});