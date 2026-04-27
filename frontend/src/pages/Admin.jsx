import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { getApiErrorMessage } from "../utils/apiError";
import { toastApiPromise, toastError } from "../utils/notify";

export default function Admin() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [todaySummary, setTodaySummary] = useState([]);
  const [monthlySummary, setMonthlySummary] = useState([]);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");

  // Fetch all teams
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        setLoading(true);
        const res = await api.get("/teams");
        if (cancelled) return;
        setTeams(res.data);
        setError("");
      } catch (err) {
        const message = getApiErrorMessage(err, "Failed to fetch teams");
        toastError(message);
        if (!cancelled) setError(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch today's attendance summary
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        setSummaryLoading(true);
        const res = await api.get("/attendance/summary/today");
        if (cancelled) return;
        setTodaySummary(res.data);
        setSummaryError("");
      } catch (err) {
        const message = getApiErrorMessage(err, "Failed to fetch today's summary");
        toastError(message);
        if (!cancelled) setSummaryError(message);
      } finally {
        if (!cancelled) setSummaryLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch monthly attendance summary
  useEffect(() => {
    if (!selectedMonth) return;
    let cancelled = false;

    const run = async () => {
      try {
        setSummaryLoading(true);
        const res = await api.get(`/attendance/summary/monthly?month=${selectedMonth}`);
        if (cancelled) return;
        setMonthlySummary(res.data);
        setSummaryError("");
      } catch (err) {
        const message = getApiErrorMessage(err, "Failed to fetch monthly summary");
        toastError(message);
        if (!cancelled) setSummaryError(message);
      } finally {
        if (!cancelled) setSummaryLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [selectedMonth]);

  // Approve member
  const handleApprove = async (teamId, memberId) => {
    try {
      const res = await toastApiPromise(
        api.patch(`/teams/${teamId}/members/${memberId}/approve`),
        {
          pending: "Approving member...",
          success: "Member approved",
        }
      );
      const updatedTeam = res.data;
      setTeams((prev) =>
        prev.map((t) => (t._id === updatedTeam._id ? updatedTeam : t))
      );
    } catch (err) {
      const message = getApiErrorMessage(err, "Failed to approve member");
      toastError(message);
      setError(message);
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 p-8 bg-white rounded-lg shadow animate-fade-in">
      <h2 className="text-2xl font-bold text-black mb-6 text-center">Admin Panel: Team Approvals</h2>
      {/* Attendance Summaries */}
      <div className="mb-10">
        <h3 className="text-xl font-semibold mb-2 text-orange-500">Today's Attendance Summary</h3>
        {summaryLoading ? (
          <div className="text-orange-500">Loading...</div>
        ) : todaySummary.length === 0 ? (
          <div className="text-gray-600">No attendance marked today.</div>
        ) : (
          <table className="w-full border rounded mb-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 text-left">Team Name</th>
                <th className="py-2 px-4 text-left">Present Count</th>
              </tr>
            </thead>
            <tbody>
              {todaySummary.map((s, idx) => (
                <tr key={idx} className="border-t">
                  <td className="py-2 px-4">{s.teamName}</td>
                  <td className="py-2 px-4">{s.presentCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <h3 className="text-xl font-semibold mb-2 text-orange-500 mt-8">Monthly Attendance Summary</h3>
        <div className="mb-2">
          <label className="mr-2">Select Month:</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="border p-1 rounded"
          />
        </div>
        {summaryLoading && selectedMonth ? (
          <div className="text-orange-500">Loading...</div>
        ) : monthlySummary.length === 0 && selectedMonth ? (
          <div className="text-gray-600">No records for this month.</div>
        ) : (
          <table className="w-full border rounded mb-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 text-left">Student</th>
                <th className="py-2 px-4 text-left">Email</th>
                <th className="py-2 px-4 text-left">Team</th>
                <th className="py-2 px-4 text-left">Month</th>
                <th className="py-2 px-4 text-left">Present Count</th>
              </tr>
            </thead>
            <tbody>
              {monthlySummary.map((s, idx) => (
                <tr key={idx} className="border-t">
                  <td className="py-2 px-4">{s.user?.name || s.user?.username}</td>
                  <td className="py-2 px-4">{s.user?.email}</td>
                  <td className="py-2 px-4">{s.team?.teamName}</td>
                  <td className="py-2 px-4">{s.month}</td>
                  <td className="py-2 px-4">{s.presentCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {summaryError && <div className="text-red-500">{summaryError}</div>}
      </div>
      {loading && <div className="text-center text-orange-500">Loading...</div>}
      {error && <div className="text-center text-red-500 mb-4">{error}</div>}
      {teams.length === 0 && !loading ? (
        <div className="text-center text-gray-600">No teams found.</div>
      ) : (
        teams.map((team) => (
          <div key={team._id} className="mb-8">
            <div className="mb-2 text-lg font-semibold text-orange-500">
              Team: <span className="text-black">{team.teamName}</span> | Skill: <span className="text-black">{team.skill}</span>
            </div>
            <table className="w-full border rounded mb-2">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 text-left">Name</th>
                  <th className="py-2 px-4 text-left">Email</th>
                  <th className="py-2 px-4 text-left">Skill</th>
                  <th className="py-2 px-4 text-left">Status</th>
                  <th className="py-2 px-4 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {team.members.map((m) => (
                  <tr key={m._id} className="border-t">
                    <td className="py-2 px-4">{m.name || m.username}</td>
                    <td className="py-2 px-4">{m.email}</td>
                    <td className="py-2 px-4">{m.skill}</td>
                    <td className="py-2 px-4">
                      <span className={
                        m.status === "Pending"
                          ? "text-yellow-500 font-semibold"
                          : "text-green-600 font-semibold"
                      }>
                        {m.status}
                      </span>
                    </td>
                    <td className="py-2 px-4">
                      {m.status === "Pending" && (
                        <button
                          onClick={() => handleApprove(team._id, m._id)}
                          className="bg-orange-500 text-white px-4 py-1 rounded hover:bg-black hover:text-orange-500 transition"
                        >
                          Approve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
}