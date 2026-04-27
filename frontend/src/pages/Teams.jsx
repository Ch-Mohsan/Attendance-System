import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { useUserContext } from "../context/UserContext";
import { toastApiPromise, toastError, toastSuccess } from "../utils/notify";
import { getApiErrorMessage } from "../utils/apiError";

export default function Teams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useUserContext();

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await api.get("/teams");
      setTeams(response.data);
      setError("");
    } catch (err) {
      console.error("Error fetching teams:", err);
      const message = getApiErrorMessage(err, "Failed to fetch teams");
      toastError(message);
      setError(message);
      setTeams([]); // Ensure teams is always an array
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const teamData = {
      teamName: formData.get("teamName"),
      skill: formData.get("skill")
    };

    try {
      setLoading(true);
      await toastApiPromise(api.post("/teams", teamData), {
        pending: "Creating team...",
        success: "Team created",
      });
      await fetchTeams(); // Refresh the teams list
      e.target.reset(); // Reset the form
      toastSuccess("Team list updated");
    } catch (err) {
      const message = getApiErrorMessage(err, "Failed to create team");
      toastError(message);
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-8 bg-white rounded-lg shadow animate-fade-in">
      <h2 className="text-2xl font-bold text-black mb-6 text-center">Teams</h2>
      
      {/* Create Team Form */}
      {user && (
        <form onSubmit={handleCreateTeam} className="mb-8 bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-orange-500">Create New Team</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Team Name
              </label>
              <input
                type="text"
                name="teamName"
                required
                className="w-full p-2 border rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter team name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Skill/Field
              </label>
              <input
                type="text"
                name="skill"
                required
                className="w-full p-2 border rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter team skill/field"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-4 bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors disabled:bg-gray-400"
          >
            {loading ? "Creating..." : "Create Team"}
          </button>
        </form>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && <div className="text-center text-orange-500">Loading...</div>}

      {/* Teams Table */}
      {!loading && teams.length === 0 ? (
        <div className="text-center text-gray-600 p-4 bg-gray-50 rounded">
          No teams found. Create your first team!
        </div>
      ) : (
        !loading && (
          <div className="overflow-x-auto">
            <table className="w-full border rounded">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 text-left">Team Name</th>
                  <th className="py-2 px-4 text-left">Skill/Field</th>
                  <th className="py-2 px-4 text-left">Leader</th>
                  <th className="py-2 px-4 text-left"># Members</th>
                  <th className="py-2 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((team) => (
                  <tr key={team._id} className="border-t hover:bg-gray-50">
                    <td className="py-2 px-4 font-semibold">{team.teamName}</td>
                    <td className="py-2 px-4">{team.skill}</td>
                    <td className="py-2 px-4">{team.leader?.username || "-"}</td>
                    <td className="py-2 px-4">{team.members?.length || 0}</td>
                    <td className="py-2 px-4">
                      {user && team.leader === user.id && (
                        <button
                          className="text-orange-500 hover:text-orange-600"
                          onClick={() => {/* Add manage team functionality */}}
                        >
                          Manage Team
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
} 