import { useState, useMemo, useEffect } from "react";
import DashboardLayout from "../components/layouts/DashboardLayout";
import LogsTable from "../components/LogTable";

const ActivityLogs = () => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 5;

  const [logs, setLogs] = useState([
    { id: 1, actor: "Admin", action: "Deleted user Rahul Sharma", time: "2026-02-19 12:00" },
    { id: 2, actor: "Analyst", action: "Approved report #45", time: "2026-02-19 12:10" },
    { id: 3, actor: "Admin", action: "Added new user Priya Mehta", time: "2026-02-19 12:20" },
  ]);

  useEffect(() => setCurrentPage(1), [search]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) =>
      log.actor.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase())
    );
  }, [logs, search]);

  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * logsPerPage, currentPage * logsPerPage);

  const columns = [
    { label: "Actor", key: "actor" },
    { label: "Action", key: "action" },
    { label: "Timestamp", key: "time" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white">Activity Logs</h2>

        <input
          type="text"
          placeholder="Search actor or action..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 rounded-lg bg-white/10 text-white placeholder-gray-400 border border-white/20 focus:ring-2 focus:ring-indigo-500 w-full sm:w-72"
        />

        <LogsTable logs={paginatedLogs} columns={columns} />

        <div className="flex justify-end gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded-lg border text-sm ${
                currentPage === i + 1
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "border-white/20 text-gray-300 hover:bg-white/10"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ActivityLogs;
