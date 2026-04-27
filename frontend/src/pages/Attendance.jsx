import React, { useEffect, useState } from "react";
import { useUserContext } from "../context/UserContext.jsx";
import api from "../utils/api";

export default function Attendance() {
  const { user } = useUserContext();
  const [team, setTeam] = useState(null);
  const [approvedMembers, setApprovedMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [todaySummary, setTodaySummary] = useState([]);
  const [monthlySummary, setMonthlySummary] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [userMembershipStatus, setUserMembershipStatus] = useState(null);

  useEffect(() => {
    if (!user) return;
    checkUserMembershipStatus();
    if (user.role === "Owner") {
      fetchAdminSummaries();
    } else if (user.isLeader) {
      fetchTeam();
      fetchLeaderSummaries();
      fetchTodayAttendance();
    }
  }, [user]);

  const checkUserMembershipStatus = async () => {
    if (user.role === "Owner" || user.isLeader) {
      setUserMembershipStatus("Approved");
      return;
    }
    try {
      const response = await api.get("/teams/my-membership-status");
      setUserMembershipStatus(response.data.status);
    } catch (error) {
      console.error("Failed to fetch membership status:", error);
      setUserMembershipStatus("Not Found");
    }
  };

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const res = await api.get("/teams/my");
      setTeam(res.data);
      setApprovedMembers(res.data ? res.data.members.filter((m) => m.status === "Approved") : []);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  const fetchLeaderSummaries = async () => {
    try {
      const [todayRes, monthRes] = await Promise.all([
        api.get("/attendance/summary/today/my"),
        api.get("/attendance/summary/monthly/my")
      ]);
      setTodaySummary(todayRes.data);
      setMonthlySummary(monthRes.data);
    } catch {}
  };

  const fetchAdminSummaries = async () => {
    try {
      const [todayRes, monthRes] = await Promise.all([
        api.get("/attendance/summary/today"),
        api.get("/attendance/summary/monthly")
      ]);
      setTodaySummary(todayRes.data);
      setMonthlySummary(monthRes.data);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  const fetchTodayAttendance = async () => {
    try {
      const res = await api.get("/attendance/today/my");
      setTodayAttendance(res.data);
    } catch {}
  };

  const markAttendance = async (memberId) => {
    try {
      await api.post("/attendance/mark", {
        teamId: team._id,
        memberId,
        date: new Date().toISOString(),
        status: "Present"
      });
      setMsg("Attendance marked!");
      fetchLeaderSummaries();
      fetchTodayAttendance();
    } catch {
      setMsg("Failed to mark attendance.");
    }
  };

  if (loading) return <div>Loading...</div>;

  // Show message for non-approved members
  if (!user.isLeader && !user.role === "Owner" && userMembershipStatus !== "Approved") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <h2 className="text-xl font-semibold mb-4 text-orange-500">Access Restricted</h2>
          <p className="mb-4">You need to be an approved team member to view attendance.</p>
          {userMembershipStatus === "Pending" ? (
            <p>Your team membership request is pending approval. Please wait for the team leader to approve your request.</p>
          ) : (
            <p>Please join a team to access attendance features.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Mark Attendance</h1>
      {msg && <div className="mb-4 text-green-600">{msg}</div>}

      {/* Today's Present Students Table */}
      <h2 className="text-xl font-semibold mb-2">Today's Present Students</h2>
      {todaySummary.length > 0 ? (
        <table className="w-full border rounded mb-6">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 text-left">Name</th>
              <th className="py-2 px-4 text-left">Email</th>
              {user.role === "Owner" && <th className="py-2 px-4 text-left">Team</th>}
            </tr>
          </thead>
          <tbody>
            {user.role === "Owner"
              ? todaySummary.flatMap((team) =>
                  team.presentCount > 0 && team.teamName
                    ? [<tr key={team.teamName}><td colSpan={user.role === "Owner" ? 3 : 2} className="font-bold bg-gray-50">{team.teamName}</td></tr>]
                        .concat(team.members?.map((m) => (
                          <tr key={m._id || m.email}>
                            <td className="py-2 px-4">{m.name || m.username}</td>
                            <td className="py-2 px-4">{m.email}</td>
                            <td className="py-2 px-4">{team.teamName}</td>
                          </tr>
                        )) || [])
                    : []
                )
              : todaySummary.map((r) => (
                  <tr key={r._id || r.member?._id || r.member?.email}>
                    <td className="py-2 px-4">{r.member?.name || r.member?.username}</td>
                    <td className="py-2 px-4">{r.member?.email}</td>
                  </tr>
                ))}
          </tbody>
        </table>
      ) : (
        <div className="mb-6">No students marked present today.</div>
      )}

      {/* Monthly Attendance Summary Table */}
      <h2 className="text-xl font-semibold mb-2">Monthly Attendance Summary</h2>
      {monthlySummary.length > 0 ? (
        <table className="w-full border rounded mb-6">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 text-left">Name</th>
              <th className="py-2 px-4 text-left">Email</th>
              <th className="py-2 px-4 text-left">Presents</th>
              <th className="py-2 px-4 text-left">Absents</th>
              {user.role === "Owner" && <th className="py-2 px-4 text-left">Team</th>}
            </tr>
          </thead>
          <tbody>
            {monthlySummary.map((s) => (
              <tr key={s._id || s.user?._id || s.user?.email}>
                <td className="py-2 px-4">{s.user?.name || s.user?.username}</td>
                <td className="py-2 px-4">{s.user?.email}</td>
                <td className="py-2 px-4">{s.presentCount}</td>
                <td className="py-2 px-4">{s.absentCount}</td>
                {user.role === "Owner" && <td className="py-2 px-4">{s.team?.teamName}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="mb-6">No monthly attendance records found.</div>
      )}

      {/* Mark Attendance Table for Leaders Only */}
      {user.isLeader && team && approvedMembers.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mb-2">Mark Attendance for Your Team</h2>
          <table className="w-full border rounded">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 text-left">Name</th>
                <th className="py-2 px-4 text-left">Email</th>
                <th className="py-2 px-4 text-left">Skill</th>
                <th className="py-2 px-4 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {approvedMembers.map((m) => {
                const alreadyMarked = todayAttendance.some(
                  (a) => a.member && (a.member.toString ? a.member.toString() : a.member) === (m.user && m.user.toString ? m.user.toString() : m.user)
                );
                return (
                  <tr key={m._id || m.email} className="border-t">
                    <td className="py-2 px-4">{m.name}</td>
                    <td className="py-2 px-4">{m.email}</td>
                    <td className="py-2 px-4">{m.skill}</td>
                    <td className="py-2 px-4">
                      {m.user ? (
                        <button
                          onClick={() => markAttendance(m.user)}
                          className="bg-orange-500 text-white px-4 py-1 rounded hover:bg-black hover:text-orange-500 transition"
                          disabled={alreadyMarked}
                        >
                          {alreadyMarked ? "Already Marked" : "Mark Attendance"}
                        </button>
                      ) : (
                        <span className="text-gray-400">Not a registered user</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
} 