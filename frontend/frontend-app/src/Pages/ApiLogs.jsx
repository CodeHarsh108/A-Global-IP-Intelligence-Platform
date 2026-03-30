import { useEffect, useState } from "react";

function ApiLogs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken"); // ✅ get JWT token

    fetch("http://localhost:8080/admin/logs", {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`
        }
    })
      .then(res => {
        if (!res.ok) {
          throw new Error("Unauthorized or error fetching logs");
        }
        return res.json();
      })
      .then(data => setLogs(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-6 text-white bg-[#0B1120] min-h-screen">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">API Usage Logs</h1>
        <p className="text-gray-400 text-sm">
          Monitor API requests and system activity
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-[#111827] p-4 rounded-xl">
          <p className="text-gray-400 text-sm">Total Requests</p>
          <h2 className="text-xl font-bold">{logs.length}</h2>
        </div>

        <div className="bg-[#111827] p-4 rounded-xl">
          <p className="text-gray-400 text-sm">Success (200)</p>
          <h2 className="text-green-400 text-xl font-bold">
            {logs.filter(l => l.statusCode === 200).length}
          </h2>
        </div>

        <div className="bg-[#111827] p-4 rounded-xl">
          <p className="text-gray-400 text-sm">Errors</p>
          <h2 className="text-red-400 text-xl font-bold">
            {logs.filter(l => l.statusCode >= 400).length}
          </h2>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#111827] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#1F2937] text-gray-300">
            <tr>
              <th className="p-3 text-left">Endpoint</th>
              <th className="p-3 text-left">Method</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Timestamp</th>
            </tr>
          </thead>

          <tbody>
            {logs.map(log => (
              <tr
                key={log.id}
                className="border-b border-gray-700 hover:bg-[#1F2937]"
              >
                <td className="p-3">{log.endpoint}</td>

                <td className="p-3">
                  <span className="px-2 py-1 bg-blue-600 rounded text-xs">
                    {log.method}
                  </span>
                </td>

                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      log.statusCode === 200
                        ? "bg-green-600"
                        : "bg-red-600"
                    }`}
                  >
                    {log.statusCode}
                  </span>
                </td>

                <td className="p-3 text-gray-400">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ApiLogs;