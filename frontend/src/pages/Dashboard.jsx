import React, { useEffect, useMemo, useState } from "react";
import { useUserContext } from "../context/UserContext.jsx";
import api from "../utils/api";

const getId = (value) => (value && typeof value === "object" ? value._id : value);

const percent = (present, absent) => {
  const total = present + absent;
  if (!total) return 0;
  return Math.round((present / total) * 100);
};

export default function Dashboard() {
  const { user } = useUserContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cards, setCards] = useState({
    totalStudents: 0,
    totalTeams: 0,
    pendingMembers: 0,
    pendingLeaderRequests: 0,
    todayPresent: 0,
    monthlyPresent: 0,
    monthlyAbsent: 0,
    monthlyAttendanceRate: 0,
  });
  const [teamRows, setTeamRows] = useState([]);
  const [studentRows, setStudentRows] = useState([]);

  useEffect(() => {
    if (!user) return;

    const fetchDashboardAnalytics = async () => {
      try {
        setLoading(true);
        setError("");

        const month = new Date().toISOString().slice(0, 7);

        const [usersRes, teamsRes, todayRes, monthRes, leaderReqRes] = await Promise.all([
          api.get("/users"),
          api.get("/teams"),
          api.get("/attendance/summary/today"),
          api.get(`/attendance/summary/monthly?month=${month}`),
          api.get("/users/leader-requests"),
        ]);

        const allUsers = usersRes.data || [];
        const teams = teamsRes.data || [];
        const todaySummary = todayRes.data || [];
        const monthlySummary = monthRes.data || [];
        const pendingLeaderRequests = (leaderReqRes.data || []).length;

        const students = allUsers.filter((u) => u.role === "Student");
        const pendingMembers = teams.reduce(
          (count, team) =>
            count + (team.members || []).filter((member) => member.status === "Pending").length,
          0
        );
        const todayPresent = todaySummary.reduce(
          (sum, item) => sum + (item.presentCount || 0),
          0
        );
        const monthlyPresent = monthlySummary.reduce(
          (sum, item) => sum + (item.presentCount || 0),
          0
        );
        const monthlyAbsent = monthlySummary.reduce(
          (sum, item) => sum + (item.absentCount || 0),
          0
        );

        const teamPerformance = teams
          .map((team) => {
            const teamMonthly = monthlySummary.filter(
              (row) => String(getId(row.team)) === String(team._id)
            );
            const present = teamMonthly.reduce((sum, row) => sum + (row.presentCount || 0), 0);
            const absent = teamMonthly.reduce((sum, row) => sum + (row.absentCount || 0), 0);
            return {
              teamId: team._id,
              teamName: team.teamName,
              skill: team.skill,
              present,
              absent,
              attendanceRate: percent(present, absent),
            };
          })
          .sort((a, b) => b.present - a.present);

        const studentsWithAttendance = students
          .map((student) => {
            const studentMonthly = monthlySummary.filter(
              (row) => String(getId(row.user)) === String(student._id)
            );
            const present = studentMonthly.reduce((sum, row) => sum + (row.presentCount || 0), 0);
            const absent = studentMonthly.reduce((sum, row) => sum + (row.absentCount || 0), 0);
            const teamNames = teams
              .filter((team) =>
                (team.members || []).some(
                  (member) => String(getId(member.user)) === String(student._id)
                )
              )
              .map((team) => team.teamName);

            return {
              id: student._id,
              username: student.username,
              email: student.email,
              teams: teamNames.length ? teamNames.join(", ") : "No Team",
              present,
              absent,
              attendanceRate: percent(present, absent),
            };
          })
          .sort((a, b) => b.attendanceRate - a.attendanceRate);

        setCards({
          totalStudents: students.length,
          totalTeams: teams.length,
          pendingMembers,
          pendingLeaderRequests,
          todayPresent,
          monthlyPresent,
          monthlyAbsent,
          monthlyAttendanceRate: percent(monthlyPresent, monthlyAbsent),
        });
        setTeamRows(teamPerformance);
        setStudentRows(studentsWithAttendance);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardAnalytics();
  }, [user]);

  const monthLabel = useMemo(() => {
    return new Date().toLocaleString("en-PK", { month: "long", year: "numeric" });
  }, []);

  if (loading) {
    return <div className="text-center text-orange-500">Loading dashboard analytics...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-orange-500 via-orange-400 to-amber-400 text-black rounded-2xl p-6 shadow-lg">
        <h1 className="text-2xl md:text-3xl font-extrabold">Dashboard Analytics</h1>
        <p className="mt-2 text-sm md:text-base font-medium">
          Live student and attendance insights for {monthLabel}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border shadow-sm">
          <p className="text-gray-500 text-sm">Total Students</p>
          <p className="text-3xl font-bold text-black mt-1">{cards.totalStudents}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border shadow-sm">
          <p className="text-gray-500 text-sm">Total Teams</p>
          <p className="text-3xl font-bold text-black mt-1">{cards.totalTeams}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border shadow-sm">
          <p className="text-gray-500 text-sm">Today Present</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{cards.todayPresent}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border shadow-sm">
          <p className="text-gray-500 text-sm">Monthly Attendance Rate</p>
          <p className="text-3xl font-bold text-orange-500 mt-1">{cards.monthlyAttendanceRate}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border shadow-sm">
          <p className="text-sm text-gray-500">Pending Team Members</p>
          <p className="text-2xl font-bold text-yellow-600">{cards.pendingMembers}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border shadow-sm">
          <p className="text-sm text-gray-500">Pending Leader Requests</p>
          <p className="text-2xl font-bold text-purple-700">{cards.pendingLeaderRequests}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border shadow-sm">
          <p className="text-sm text-gray-500">Monthly Present / Absent</p>
          <p className="text-2xl font-bold text-black">
            {cards.monthlyPresent} / {cards.monthlyAbsent}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 border shadow-sm">
        <h2 className="text-xl font-bold text-black mb-4">Team Attendance Analytics</h2>
        <div className="overflow-x-auto">
          <table className="w-full border rounded">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 text-left">Team</th>
                <th className="py-2 px-4 text-left">Skill</th>
                <th className="py-2 px-4 text-left">Present</th>
                <th className="py-2 px-4 text-left">Absent</th>
                <th className="py-2 px-4 text-left">Rate</th>
              </tr>
            </thead>
            <tbody>
              {teamRows.map((team) => (
                <tr key={team.teamId} className="border-t">
                  <td className="py-2 px-4 font-semibold">{team.teamName}</td>
                  <td className="py-2 px-4">{team.skill}</td>
                  <td className="py-2 px-4">{team.present}</td>
                  <td className="py-2 px-4">{team.absent}</td>
                  <td className="py-2 px-4">
                    <span className="font-semibold text-orange-600">{team.attendanceRate}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 border shadow-sm">
        <h2 className="text-xl font-bold text-black mb-4">Student Attendance Analytics</h2>
        <div className="overflow-x-auto">
          <table className="w-full border rounded">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 text-left">Student</th>
                <th className="py-2 px-4 text-left">Email</th>
                <th className="py-2 px-4 text-left">Teams</th>
                <th className="py-2 px-4 text-left">Present</th>
                <th className="py-2 px-4 text-left">Absent</th>
                <th className="py-2 px-4 text-left">Rate</th>
              </tr>
            </thead>
            <tbody>
              {studentRows.map((student) => (
                <tr key={student.id} className="border-t">
                  <td className="py-2 px-4 font-semibold">{student.username}</td>
                  <td className="py-2 px-4">{student.email}</td>
                  <td className="py-2 px-4">{student.teams}</td>
                  <td className="py-2 px-4">{student.present}</td>
                  <td className="py-2 px-4">{student.absent}</td>
                  <td className="py-2 px-4">
                    <span className="font-semibold text-green-600">{student.attendanceRate}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 