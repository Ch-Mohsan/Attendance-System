import React, { useEffect, useMemo, useState } from "react";
import api from "../utils/api";

export default function ListAll() {
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [monthlySummary, setMonthlySummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRecords = async () => {
      try {
        setLoading(true);
        const [usersRes, teamsRes, monthlyRes] = await Promise.all([
          api.get("/users"),
          api.get("/teams"),
          api.get("/attendance/summary/monthly"),
        ]);
        setUsers(usersRes.data || []);
        setTeams(teamsRes.data || []);
        setMonthlySummary(monthlyRes.data || []);
        setError("");
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load student records");
      } finally {
        setLoading(false);
      }
    };

    loadRecords();
  }, []);

  const studentRows = useMemo(() => {
    return users
      .filter((user) => user.role === "Student")
      .map((user) => {
        const studentTeams = teams.filter((team) =>
          team.members?.some((member) => {
            const memberId = member.user?._id || member.user;
            return memberId && memberId.toString() === user._id.toString();
          })
        );

        const studentSummaries = monthlySummary.filter((summary) => {
          const summaryUserId = summary.user?._id || summary.user;
          return summaryUserId && summaryUserId.toString() === user._id.toString();
        });

        return {
          ...user,
          studentTeams,
          studentSummaries,
        };
      });
  }, [users, teams, monthlySummary]);

  return (
    <div className="max-w-6xl mx-auto mt-10 p-8 bg-white rounded-lg shadow animate-fade-in">
      <h2 className="text-2xl font-bold text-black mb-2 text-center">All Student Records</h2>
      <p className="text-center text-gray-600 mb-6">
        View student accounts, assigned teams, and attendance summaries from one place.
      </p>

      {loading && <div className="text-center text-orange-500">Loading...</div>}
      {error && <div className="text-center text-red-500 mb-4">{error}</div>}

      {!loading && studentRows.length === 0 ? (
        <div className="text-center text-gray-600">No student records found.</div>
      ) : (
        <div className="space-y-10">
          <div>
            <h3 className="text-xl font-semibold mb-3 text-orange-500">Student Overview</h3>
            <div className="overflow-x-auto">
              <table className="w-full border rounded">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 text-left">Username</th>
                    <th className="py-2 px-4 text-left">Email</th>
                    <th className="py-2 px-4 text-left">Contact</th>
                    <th className="py-2 px-4 text-left">Teams</th>
                    <th className="py-2 px-4 text-left">Leader Status</th>
                    <th className="py-2 px-4 text-left">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {studentRows.map((student) => (
                    <tr key={student._id} className="border-t hover:bg-gray-50">
                      <td className="py-2 px-4 font-semibold">{student.username}</td>
                      <td className="py-2 px-4">{student.email}</td>
                      <td className="py-2 px-4">{student.contact}</td>
                      <td className="py-2 px-4">
                        {student.studentTeams.length > 0
                          ? student.studentTeams.map((team) => team.teamName).join(", ")
                          : "No team"}
                      </td>
                      <td className="py-2 px-4">
                        <span className="px-2 py-1 rounded bg-gray-100 text-gray-700 text-sm">
                          {student.leaderApprovalStatus}
                        </span>
                      </td>
                      <td className="py-2 px-4">
                        {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3 text-orange-500">Attendance Records</h3>
            <div className="overflow-x-auto">
              <table className="w-full border rounded">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 text-left">Student</th>
                    <th className="py-2 px-4 text-left">Email</th>
                    <th className="py-2 px-4 text-left">Team</th>
                    <th className="py-2 px-4 text-left">Month</th>
                    <th className="py-2 px-4 text-left">Present</th>
                    <th className="py-2 px-4 text-left">Absent</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlySummary.map((record) => (
                    <tr key={record._id} className="border-t hover:bg-gray-50">
                      <td className="py-2 px-4">{record.user?.name || record.user?.username}</td>
                      <td className="py-2 px-4">{record.user?.email}</td>
                      <td className="py-2 px-4">{record.team?.teamName}</td>
                      <td className="py-2 px-4">{record.month}</td>
                      <td className="py-2 px-4">{record.presentCount}</td>
                      <td className="py-2 px-4">{record.absentCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}