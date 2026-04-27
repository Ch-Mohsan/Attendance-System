// add middlewarwe of .env
require('dotenv').config();
const express = require('express');

const cors = require('cors');
const connectDB = require('./utilities/db');
const userRoutes = require('./routes/userRoutes');
const teamRoutes = require('./routes/teamRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

// TODO: Add routes for users, teams, attendance
app.use('/api/users', userRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/attendance', attendanceRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 