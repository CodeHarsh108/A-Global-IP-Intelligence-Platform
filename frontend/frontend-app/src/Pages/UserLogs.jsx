import { useState, useMemo, useEffect } from "react";
import { Search, Filter, ShieldAlert, CheckCircle2, XCircle, Download, Calendar, Activity, User, Eye, FileText } from "lucide-react";
import DashboardLayout from "../components/layouts/DashboardLayout";
import LogsTable from "../components/LogTable";

const UserLogs = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 8;

  const [logs] = useState([
    { id: 1, user: "Rahul Sharma", action: "Patent View", details: "US20230123456A1", status: "Success", time: "2026-02-19 10:12" },
    { id: 2, user: "Priya Mehta", action: "Export PDF", details: "Global Dossier", status: "Success", time: "2026-02-19 10:25" },
    { id: 3, user: "Amit Verma", action: "Claim Edit", details: "Draft-442", status: "Success", time: "2026-02-19 11:00" },
    { id: 4, user: "Sneha Kapoor", action: "Login Attempt", details: "Unauthorized IP", status: "Failed", time: "2026-02-19 11:12" },
  ]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch = log.user.toLowerCase().includes(search.toLowerCase()) || log.action.toLowerCase().includes(search.toLowerCase());
      return (statusFilter === "All" || log.status === statusFilter) && matchesSearch;
    });
  }, [logs, search, statusFilter]);

  const paginatedLogs = filteredLogs.slice((currentPage - 1) * logsPerPage, currentPage * logsPerPage);

  const columns = [
    { 
      label: "User", 
      key: "user", 
      render: (val) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-[11px] text-blue-400 font-bold">
            {val.charAt(0)}
          </div>
          <span className="font-medium text-slate-200">{val}</span>
        </div>
      )
    },
    { label: "Activity", key: "action" },
    { label: "Details", key: "details", render: (v) => <span className="text-slate-400">{v}</span> },
    { 
      label: "Status", 
      key: "status",
      render: (val) => (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
          val === 'Success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${val === 'Success' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          {val}
        </span>
      )
    },
    { label: "Timestamp", key: "time", render: (v) => <span className="text-slate-500 text-sm">{v}</span> },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-[1600px] mx-auto space-y-8 p-6 text-slate-300">
        
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">User Activity Logs</h2>
            <p className="text-slate-400 text-sm mt-1">Audit trail for patent research and user access.</p>
          </div>
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition shadow-lg shadow-blue-600/20">
            <Download size={18} /> Export CSV
          </button>
        </div>

        {/* STATS - MATCHING YOUR IMAGE */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard label="Total Events" value={logs.length} icon={<Activity className="text-blue-500"/>} iconBg="bg-blue-500/10" />
          <StatCard label="Active Users" value="14" icon={<User className="text-emerald-500"/>} iconBg="bg-emerald-500/10" />
          <StatCard label="Security Alerts" value="02" icon={<ShieldAlert className="text-rose-500"/>} iconBg="bg-rose-500/10" />
          <StatCard label="Jurisdictions" value="12" icon={<Calendar className="text-purple-500"/>} iconBg="bg-purple-500/10" />
        </div>

        {/* SEARCH & FILTERS */}
        <div className="bg-[#1a1f2e] border border-slate-800 rounded-2xl p-4 flex gap-4 shadow-xl">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" placeholder="Search user or action..."
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#0f1219] text-white border border-slate-800 focus:border-blue-500 outline-none transition-all"
              value={search} onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="bg-[#0f1219] border border-slate-800 text-white rounded-xl px-4 outline-none">
            <option>All Levels</option>
            <option>Success</option>
            <option>Failed</option>
          </select>
        </div>

        {/* TABLE */}
        <div className="bg-[#1a1f2e] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <LogsTable logs={paginatedLogs} columns={columns} />
        </div>
      </div>
    </DashboardLayout>
  );
};

const StatCard = ({ label, value, icon, iconBg }) => (
  <div className="bg-[#1a1f2e] border border-slate-800 p-6 rounded-2xl flex justify-between items-center hover:border-slate-600 transition-all">
    <div>
      <p className="text-sm font-medium text-slate-400 mb-1">{label}</p>
      <h3 className="text-3xl font-bold text-white">{value}</h3>
    </div>
    <div className={`p-4 rounded-xl ${iconBg}`}>{icon}</div>
  </div>
);

export default UserLogs;