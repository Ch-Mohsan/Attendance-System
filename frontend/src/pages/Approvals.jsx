import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { getApiErrorMessage } from "../utils/apiError";
import { toastApiPromise, toastError } from "../utils/notify";

export default function Approvals() {
  const [pendingMembers, setPendingMembers] = useState([]);
  const [pendingLeaders, setPendingLeaders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch pending members and leader requests
  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get("/teams"),
      api.get("/users/leader-requests")
    ])
      .then(([teamsRes, leadersRes]) => {
        // Pending team members
        const pendings = [];
        teamsRes.data.forEach((team) => {
          team.members.forEach((m) => {
            if (m.status === "Pending") {
              pendings.push({
                teamId: team._id,
                teamName: team.teamName,
                memberId: m._id,
                name: m.name || m.username,
                email: m.email,
                skill: m.skill,
                status: m.status,
              });
            }
          });
        });
        setPendingMembers(pendings);

        // Pending leader requests
        setPendingLeaders(leadersRes.data);
        setLoading(false);
      })
      .catch(() => {
        const message = "Failed to fetch pending approvals";
        toastError(message);
        setError(message);
        setLoading(false);
      });
  }, []);

  // Approve member
  const handleApproveMember = async (teamId, memberId) => {
    try {
      await toastApiPromise(api.patch(`/teams/${teamId}/members/${memberId}/approve`), {
        pending: "Approving member...",
        success: "Member approved",
      });
      setPendingMembers((prev) => prev.filter((m) => m.memberId !== memberId));
    } catch (err) {
      const message = getApiErrorMessage(err, "Failed to approve member");
      toastError(message);
      setError(message);
    }
  };

  // Approve leader
  const handleApproveLeader = async (userId) => {
    try {
      await toastApiPromise(api.patch(`/users/approve-leader/${userId}`), {
        pending: "Approving leader...",
        success: "Leader approved",
      });
      setPendingLeaders((prev) => prev.filter((l) => l._id !== userId));
    } catch (err) {
      const message = getApiErrorMessage(err, "Failed to approve leader");
      toastError(message);
      setError(message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-8 bg-white rounded-lg shadow animate-fade-in">
      <h2 className="text-2xl font-bold text-black mb-6 text-center">Approvals</h2>
      {loading && <div className="text-center text-orange-500">Loading...</div>}
      {error && <div className="text-center text-red-500 mb-4">{error}</div>}

      {/* Leader Requests */}
      <h3 className="text-xl font-semibold mb-2 mt-6">Pending Leader Requests</h3>
      {pendingLeaders.length === 0 ? (
        <div className="text-center text-gray-600 mb-4">No pending leader requests.</div>
      ) : (
        <table className="w-full border rounded mb-8">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 text-left">Username</th>
              <th className="py-2 px-4 text-left">Email</th>
              <th className="py-2 px-4 text-left">Team Name</th>
              <th className="py-2 px-4 text-left">Skill/Field</th>
              <th className="py-2 px-4 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {pendingLeaders.map((l) => (
              <tr key={l._id} className="border-t">
                <td className="py-2 px-4">{l.username}</td>
                <td className="py-2 px-4">{l.email}</td>
                <td className="py-2 px-4">{l.requestedTeam?.teamName || "-"}</td>
                <td className="py-2 px-4">{l.requestedTeam?.skill || "-"}</td>
                <td className="py-2 px-4">
                  <button
                    onClick={() => handleApproveLeader(l._id)}
                    className="bg-orange-500 text-white px-4 py-1 rounded hover:bg-black hover:text-orange-500 transition"
                  >
                    Approve
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Pending Team Members */}
      <h3 className="text-xl font-semibold mb-2 mt-6">Pending Team Members</h3>
      {pendingMembers.length === 0 ? (
        <div className="text-center text-gray-600">No pending members.</div>
      ) : (
        <table className="w-full border rounded">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 text-left">Team</th>
              <th className="py-2 px-4 text-left">Name</th>
              <th className="py-2 px-4 text-left">Email</th>
              <th className="py-2 px-4 text-left">Skill</th>
              <th className="py-2 px-4 text-left">Status</th>
              <th className="py-2 px-4 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {pendingMembers.map((m) => (
              <tr key={m.memberId} className="border-t">
                <td className="py-2 px-4">{m.teamName}</td>
                <td className="py-2 px-4">{m.name}</td>
                <td className="py-2 px-4">{m.email}</td>
                <td className="py-2 px-4">{m.skill}</td>
                <td className="py-2 px-4 text-yellow-500 font-semibold">{m.status}</td>
                <td className="py-2 px-4">
                  <button
                    onClick={() => handleApproveMember(m.teamId, m.memberId)}
                    className="bg-orange-500 text-white px-4 py-1 rounded hover:bg-black hover:text-orange-500 transition"
                  >
                    Approve
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}