import { useState, useEffect } from "react";
import {
  Terminal, Cpu, HardDrive, Zap, Activity,
  Download, RefreshCw
} from "lucide-react";
import DashboardLayout from "../components/layouts/DashboardLayout";
import LogsTable from "../components/LogTable";
import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";
const getAuthHeader = () => {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const SystemLogs = () => {
  // ========== API ACTIVITY LOGS (dynamic from backend) ==========
  const [apiLogs, setApiLogs] = useState([]);
  const [apiTotal, setApiTotal] = useState(0);
  const [apiPage, setApiPage] = useState(0);
  const [apiLoading, setApiLoading] = useState(false);
  const apiLogsPerPage = 10;

  const fetchApiLogs = async (page = 0) => {
    setApiLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/logs`, {
        headers: getAuthHeader(),
        params: { page, size: apiLogsPerPage },
      });
      setApiLogs(response.data.content);
      setApiTotal(response.data.totalElements);
      setApiPage(page);
    } catch (err) {
      console.error("Failed to fetch API logs:", err);
    } finally {
      setApiLoading(false);
    }
  };

  useEffect(() => {
    fetchApiLogs(0);
  }, []);

  // Columns for API logs table
  const apiColumns = [
    {
      label: "User",
      key: "userName",
      render: (val) => <span className="font-mono text-blue-300 text-xs">{val || "Anonymous"}</span>
    },
    {
      label: "Endpoint",
      key: "endpoint",
      render: (val) => <span className="font-mono text-xs text-slate-300">{val}</span>
    },
    { label: "Method", key: "method", render: (val) => <span className="text-xs font-semibold">{val}</span> },
    {
      label: "Status",
      key: "statusCode",
      render: (val) => {
        const color = val >= 200 && val < 300 ? "text-green-400" : val >= 400 ? "text-red-400" : "text-yellow-400";
        return <span className={`text-xs font-bold ${color}`}>{val}</span>;
      }
    },
    {
      label: "Time",
      key: "timestamp",
      render: (val) => <span className="text-xs text-slate-500">{new Date(val).toLocaleString()}</span>
    }
  ];

  return (
    <DashboardLayout>
      <div className="max-w-[1600px] mx-auto space-y-8 p-6 text-slate-300">

        {/* ========== HEADER ========== */}
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3">
              <Terminal className="text-blue-500" size={28} />
              <h2 className="text-3xl font-bold text-white tracking-tight">System Archive</h2>
            </div>
            <p className="text-slate-400 text-sm mt-1">API request and response logs</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 text-xs font-bold border border-emerald-500/20">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              HEALTH: 99.9%
            </span>
            <button className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition shadow-lg shadow-blue-600/20 flex items-center gap-2">
              <Download size={18} /> Export Logs
            </button>
          </div>
        </div>

        {/* ========== SYSTEM STATS GRID ========== */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <SysStat label="Avg CPU Load" value="24%" icon={<Cpu className="text-blue-500"/>} iconBg="bg-blue-500/10" />
          <SysStat label="Queries/Sec" value="1.2k" icon={<Activity className="text-emerald-500"/>} iconBg="bg-emerald-500/10" />
          <SysStat label="API Latency" value="88ms" icon={<Zap className="text-amber-500"/>} iconBg="bg-amber-500/10" />
          <SysStat label="Storage Used" value="62%" icon={<HardDrive className="text-purple-500"/>} iconBg="bg-purple-500/10" />
        </div>

        {/* ========== API ACTIVITY LOGS SECTION ========== */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <Activity size={18} /> API Activity Logs
            </h3>
            <button onClick={() => fetchApiLogs(0)} className="text-blue-400 text-sm hover:text-blue-300 flex items-center gap-1">
              <RefreshCw size={14} /> Refresh
            </button>
          </div>

          <div className="bg-[#1a1f2e] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            {apiLoading ? (
              <div className="p-8 text-center text-slate-400">Loading API logs...</div>
            ) : apiLogs.length === 0 ? (
              <div className="p-8 text-center text-slate-400">No API logs available.</div>
            ) : (
              <LogsTable logs={apiLogs} columns={apiColumns} />
            )}
          </div>

          {/* Pagination for API logs */}
          {apiTotal > apiLogsPerPage && (
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => fetchApiLogs(Math.max(0, apiPage - 1))}
                disabled={apiPage === 0}
                className="px-3 py-1 rounded-lg text-sm border border-white/20 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm text-gray-400">
                Page {apiPage + 1} of {Math.ceil(apiTotal / apiLogsPerPage)}
              </span>
              <button
                onClick={() => fetchApiLogs(apiPage + 1)}
                disabled={(apiPage + 1) * apiLogsPerPage >= apiTotal}
                className="px-3 py-1 rounded-lg text-sm border border-white/20 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
};

// Helper component for stats cards
const SysStat = ({ label, value, icon, iconBg }) => (
  <div className="bg-[#1a1f2e] border border-slate-800 p-6 rounded-2xl flex justify-between items-center group hover:border-slate-600 transition-all">
    <div>
      <p className="text-sm font-medium text-slate-400 mb-1 group-hover:text-slate-300 transition-colors">{label}</p>
      <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
    </div>
    <div className={`p-4 rounded-xl shadow-inner ${iconBg}`}>
      {icon}
    </div>
  </div>
);

export default SystemLogs;