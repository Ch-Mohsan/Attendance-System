import React, { useState, useEffect } from "react";
import { useUserContext } from "../context/UserContext.jsx";
import api from "../utils/api";

export default function StudentDashboard() {
  const { user, setUser } = useUserContext();
  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", skill: "" });
  const [formMsg, setFormMsg] = useState("");
  const [leaderForm, setLeaderForm] = useState({ teamName: "", skill: "" });
  const [leaderMsg, setLeaderMsg] = useState("");

  useEffect(() => {
    if (user && user.isLeader) {
      fetchTeam();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchTeam = async () => {
    try {
      setLoading(true);
      // Get only the team where the user is leader
      const res = await api.get("/teams/my");
      setTeam(res.data);
      setMembers(res.data ? res.data.members : []);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch team");
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setFormMsg("");
    try {
      // Check if user exists by email
      const userRes = await api.get(`/users/find-by-email?email=${encodeURIComponent(form.email)}`);
      const userId = userRes.data.user.id || userRes.data.user._id;
      // Proceed to add member with userId
      await api.post(`/teams/${team._id}/members`, { ...form, userId });
      setForm({ name: "", email: "", skill: "" });
      setFormMsg("Member request sent for approval.");
      fetchTeam();
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setFormMsg("User Not Exist, Must Register");
      } else {
        setFormMsg(err.response?.data?.message || "Failed to add member");
      }
    }
  };

  const handleLeaderInputChange = (e) => {
    setLeaderForm({ ...leaderForm, [e.target.name]: e.target.value });
  };

  const handleLeaderRequest = async (e) => {
    e.preventDefault();
    setLeaderMsg("");
    try {
      const res = await api.post("/users/request-leader", leaderForm);
      setLeaderMsg("Leader request submitted successfully.");
      setUser((prev) => ({ ...prev, leaderApprovalStatus: "Pending", requestedTeam: leaderForm }));
    } catch (err) {
      setLeaderMsg(err.response?.data?.message || "Failed to submit leader request");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Student Dashboard</h1>
      {user.isLeader && team ? (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-orange-500">Your Team: {team.teamName}</h2>
          <div className="mb-4">Skill/Field: <span className="font-semibold">{team.skill}</span></div>
          <h3 className="text-lg font-semibold mb-2">Team Members</h3>
          <table className="w-full border rounded mb-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 text-left">Name</th>
                <th className="py-2 px-4 text-left">Email</th>
                <th className="py-2 px-4 text-left">Skill</th>
                <th className="py-2 px-4 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m._id || m.email} className="border-t">
                  <td className="py-2 px-4">{m.name}</td>
                  <td className="py-2 px-4">{m.email}</td>
                  <td className="py-2 px-4">{m.skill}</td>
                  <td className="py-2 px-4">
                    <span className={m.status === "Approved" ? "text-green-600" : "text-yellow-600"}>
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <form onSubmit={handleAddMember} className="mb-4 bg-gray-50 p-4 rounded">
            <h4 className="font-semibold mb-2">Add Team Member</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleInputChange}
                placeholder="Name"
                required
                className="p-2 border rounded"
              />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleInputChange}
                placeholder="Email"
                required
                className="p-2 border rounded"
              />
              <input
                type="text"
                name="skill"
                value={form.skill}
                onChange={handleInputChange}
                placeholder="Skill"
                required
                className="p-2 border rounded"
              />
            </div>
            <button
              type="submit"
              className="mt-3 bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
            >
              Add Member
            </button>
            {formMsg && <div className="mt-2 text-orange-600">{formMsg}</div>}
          </form>
        </div>
      ) : !user.isLeader && user.leaderApprovalStatus === "Not Requested" ? (
        <div className="bg-white rounded-lg shadow p-6 max-w-md mx-auto">
          <h2 className="text-xl font-semibold mb-4 text-orange-500">Request to Become a Team Leader</h2>
          <form onSubmit={handleLeaderRequest}>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Team Name</label>
              <input
                type="text"
                name="teamName"
                value={leaderForm.teamName}
                onChange={handleLeaderInputChange}
                required
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Skill/Field</label>
              <input
                type="text"
                name="skill"
                value={leaderForm.skill}
                onChange={handleLeaderInputChange}
                required
                className="w-full p-2 border rounded"
              />
            </div>
            <button
              type="submit"
              className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
            >
              Request Leader Status
            </button>
            {leaderMsg && <div className="mt-2 text-orange-600">{leaderMsg}</div>}
          </form>
        </div>
      ) : !user.isLeader && user.leaderApprovalStatus === "Pending" ? (
        <div className="bg-white rounded-lg shadow p-6 max-w-md mx-auto text-center">
          <h2 className="text-xl font-semibold mb-2 text-orange-500">Leader Request Pending</h2>
          <p>Your request to become a team leader is pending admin approval.</p>
        </div>
      ) : !user.isLeader && user.leaderApprovalStatus === "Rejected" ? (
        <div className="bg-white rounded-lg shadow p-6 max-w-md mx-auto text-center">
          <h2 className="text-xl font-semibold mb-2 text-red-500">Leader Request Rejected</h2>
          <p>Your request to become a team leader was rejected. Please contact admin for more info.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">You are not a leader of any team yet.</div>
      )}
    </div>
  );
} 