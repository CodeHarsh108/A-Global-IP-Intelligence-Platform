import { useState, useEffect } from "react";
import axios from "axios";
import DashboardLayout from "../components/layouts/DashboardLayout";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080/api";


const getAuthHeader = () => {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ─── Stage config ─────────────────────────────────────────────────────────────
const STAGES = [
  { key: "application", labels: ["Pending", "Filed", "Application"],  color: "bg-blue-500",   text: "text-blue-600 dark:text-blue-400",     badge: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",     icon: "📋", desc: "Filed, awaiting examination" },
  { key: "granted",     labels: ["Granted", "Registered", "Active"],  color: "bg-green-500",  text: "text-green-600 dark:text-green-400",   badge: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400", icon: "✅", desc: "Patent/trademark approved" },
  { key: "renewal",     labels: ["Renewal", "Expiring"],              color: "bg-yellow-500", text: "text-yellow-600 dark:text-yellow-400", badge: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400", icon: "🔄", desc: "Renewal payment required soon" },
  { key: "expiry",      labels: ["Expired", "Lapsed", "Abandoned"],   color: "bg-red-500",    text: "text-red-600 dark:text-red-400",       badge: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",         icon: "⚠️", desc: "Lapsed or expired" },
];

// Improved stage mapping: considers filing/grant dates to move older assets to "renewal"
const getStageFromStatus = (asset) => {
  const status = asset?.status;
  if (!status) return "application";
  const s = status.toLowerCase().trim();

  // Explicit statuses
  if (s === "granted" || s === "registered" || s === "active") {
    // If granted more than 2 years ago → renewal due
    if (asset.grantDate && new Date(asset.grantDate) < new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000)) {
      return "renewal";
    }
    return "granted";
  }
  if (s === "expired" || s === "lapsed" || s === "abandoned") return "expiry";
  if (s === "renewal" || s === "expiring") return "renewal";

  // For pending applications older than 2 years → renewal due (awaiting renewal)
  if (s === "pending" && asset.filingDate && new Date(asset.filingDate) < new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000)) {
    return "renewal";
  }

  return "application";
};

const getStageConfig = (stageKey) => STAGES.find(s => s.key === stageKey) || STAGES[0];

const getLifecycleProgress = (stage) => {
  switch (stage) {
    case "application": return 20;
    case "granted":     return 55;
    case "renewal":     return 78;
    case "expiry":      return 100;
    default:            return 0;
  }
};

// ─── Lifecycle Stepper ────────────────────────────────────────────────────────
const LifecycleStepper = ({ stage }) => {
  const currentIdx = STAGES.findIndex(s => s.key === stage);
  return (
    <div className="flex items-center gap-0 w-full">
      {STAGES.map((s, i) => {
        const isCompleted = i < currentIdx;
        const isCurrent   = i === currentIdx;
        return (
          <div key={s.key} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                isCompleted ? "bg-green-500 border-green-500 text-white" :
                isCurrent   ? `${s.color} border-current text-white` :
                "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-400"
              }`}>
                {isCompleted ? "✓" : i + 1}
              </div>
              <span className={`text-xs mt-1 whitespace-nowrap font-medium ${isCurrent ? s.text : "text-gray-400 dark:text-gray-500"}`}>
                {s.labels[0]}
              </span>
            </div>
            {i < STAGES.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 mb-4 ${i < currentIdx ? "bg-green-400" : "bg-gray-200 dark:bg-gray-700"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

// ─── Detail Modal ─────────────────────────────────────────────────────────────
const DetailModal = ({ asset, onClose }) => {
  if (!asset) return null;
  const stage       = getStageFromStatus(asset);
  const stageConfig = getStageConfig(stage);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex flex-wrap gap-2 mb-2">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${stageConfig.badge}`}>
                  {stageConfig.icon} {stageConfig.labels[0]}
                </span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  asset.assetType === "PATENT"
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400"
                    : "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400"
                }`}>{asset.assetType}</span>
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{asset.title || asset.mark}</h2>
              <p className="text-xs text-gray-400 font-mono mt-1">{asset.applicationNumber || asset.registrationNumber}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition text-lg leading-none">✕</button>
          </div>
        </div>

        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Lifecycle Progress</h3>
          <LifecycleStepper stage={stage} />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 italic">{stageConfig.desc}</p>
        </div>

        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Key Dates</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Filed",     value: asset.filingDate,      icon: "📋" },
              { label: "Granted",   value: asset.grantDate,       icon: "✅" },
              { label: "Expiry",    value: asset.expirationDate,  icon: "📅" },
              { label: "Published", value: asset.publicationDate, icon: "📰" },
            ].map(({ label, value, icon }) => (
              <div key={label} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{icon} {label}</p>
                <p className={`text-sm font-semibold ${value ? "text-gray-900 dark:text-white" : "text-gray-300 dark:text-gray-600"}`}>
                  {value || "—"}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">Assignee / Owner</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">{asset.assignee || asset.owner || "—"}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">Jurisdiction</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">{asset.jurisdiction || "—"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const StatusDashboard = () => {
  const [assets, setAssets]               = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState("");
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [stageFilter, setStageFilter]     = useState("all");
  const [typeFilter, setTypeFilter]       = useState("all");
  const [search, setSearch]               = useState("");
  const [jurisdictionFilter, setJurisdictionFilter] = useState("all");
  const [stats, setStats]                 = useState({ total: 0, application: 0, granted: 0, renewal: 0, expiry: 0 });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    const headers = getAuthHeader();

    try {
      const [patentsRes, trademarksRes] = await Promise.allSettled([
        axios.post(`${API_BASE_URL}/ip/patents/search?page=0&size=50&sortBy=filingDate&sortOrder=desc`, {}, { headers }),
        axios.post(`${API_BASE_URL}/ip/trademarks/search?page=0&size=50&sortBy=filingDate&sortOrder=desc`, {}, { headers }),
      ]);

      let combined = [];

      if (patentsRes.status === "fulfilled") {
        const data    = patentsRes.value.data;
        const patents = (data.patents || data.content || []).map(p => ({ ...p, assetType: "PATENT" }));
        combined = [...combined, ...patents];
      }

      if (trademarksRes.status === "fulfilled") {
        const data       = trademarksRes.value.data;
        const trademarks = (data.trademarks || data.content || []).map(t => ({ ...t, assetType: "TRADEMARK" }));
        combined = [...combined, ...trademarks];
      }

      setAssets(combined);

      const s = { total: combined.length, application: 0, granted: 0, renewal: 0, expiry: 0 };
      combined.forEach(a => { s[getStageFromStatus(a)]++; });
      setStats(s);

    } catch (err) {
      setError("Failed to load data. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const filtered = assets.filter(a => {
    const stage       = getStageFromStatus(a);
    const matchStage  = stageFilter === "all" || stage === stageFilter;
    const matchType   = typeFilter  === "all" || a.assetType === typeFilter;
    const title       = a.title || a.mark || "";
    const num         = a.applicationNumber || a.registrationNumber || "";
    const matchSearch = !search || title.toLowerCase().includes(search.toLowerCase()) || num.toLowerCase().includes(search.toLowerCase());
    const matchJurisdiction = jurisdictionFilter === "all" || a.jurisdiction === jurisdictionFilter;
    return matchStage && matchType && matchSearch && matchJurisdiction;
  });

  return (
    <DashboardLayout>
      {selectedAsset && <DetailModal asset={selectedAsset} onClose={() => setSelectedAsset(null)} />}

      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Status Dashboard</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Track your IP assets — Application → Grant → Renewal → Expiry
            </p>
          </div>
          
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl p-4 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: "Total Assets", value: stats.total,       color: "border-blue-200 dark:border-blue-500/30",     text: "text-blue-600 dark:text-blue-400",     icon: "🗂️" },
            { label: "Application",  value: stats.application, color: "border-blue-200 dark:border-blue-500/30",     text: "text-blue-600 dark:text-blue-400",     icon: "📋" },
            { label: "Granted",      value: stats.granted,     color: "border-green-200 dark:border-green-500/30",   text: "text-green-600 dark:text-green-400",   icon: "✅" },
            { label: "Renewal Due",  value: stats.renewal,     color: "border-yellow-200 dark:border-yellow-500/30", text: "text-yellow-600 dark:text-yellow-400", icon: "🔄" },
            { label: "Expired",      value: stats.expiry,      color: "border-red-200 dark:border-red-500/30",       text: "text-red-600 dark:text-red-400",       icon: "⚠️" },
          ].map(({ label, value, color, text, icon }) => (
            <div key={label} className={`bg-white dark:bg-gray-800 border ${color} rounded-xl p-4 shadow-sm`}>
              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">{icon} {label}</p>
              <p className={`text-3xl font-bold mt-1 ${text}`}>
                {loading ? <span className="animate-pulse">...</span> : value}
              </p>
            </div>
          ))}
        </div>

        {/* Lifecycle Pipeline */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Lifecycle Pipeline</h3>
          <div className="grid grid-cols-4 gap-3">
            {STAGES.map((stage) => {
              const count = stats[stage.key] || 0;
              const pct   = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
              return (
                <button
                  key={stage.key}
                  onClick={() => setStageFilter(stageFilter === stage.key ? "all" : stage.key)}
                  className={`p-4 rounded-xl border-2 transition text-left ${
                    stageFilter === stage.key
                      ? `border-current ${stage.text} bg-gray-50 dark:bg-gray-700`
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg">{stage.icon}</span>
                    <span className={`text-2xl font-bold ${stage.text}`}>{loading ? "..." : count}</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{stage.labels[0]}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{pct}% of portfolio</p>
                  <div className="mt-2 h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className={`h-full ${stage.color} rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filters + Table */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
            <input
              type="text"
              placeholder="Search by title or filing number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-[200px] px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)} className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none">
              <option value="all">All Stages</option>
              {STAGES.map(s => <option key={s.key} value={s.key}>{s.labels[0]}</option>)}
            </select>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none">
              <option value="all">All Types</option>
              <option value="PATENT">Patent</option>
              <option value="TRADEMARK">Trademark</option>
            </select>
            <select 
              value={jurisdictionFilter} 
              onChange={(e) => setJurisdictionFilter(e.target.value)} 
              className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none"
            >
              <option value="all">All Jurisdictions</option>
              {[...new Set(assets.map(a => a.jurisdiction).filter(Boolean))].map(j => (
                <option key={j} value={j}>{j}</option>
              ))}
            </select>
            <span className="text-xs text-gray-400 ml-auto">{filtered.length} asset{filtered.length !== 1 ? "s" : ""}</span>
          </div>

          {loading ? (
            <div className="py-20 text-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-400">Loading IP assets...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    {["IP Asset", "Type", "Stage", "Lifecycle", "Filing Date", "Expiry", "Jurisdiction"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-16 text-gray-400 dark:text-gray-500">
                        <p className="text-3xl mb-2">🔍</p>
                        <p className="text-sm">No assets found</p>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((asset) => {
                      const stage       = getStageFromStatus(asset);
                      const stageConfig = getStageConfig(stage);
                      const progress    = getLifecycleProgress(stage);
                      const title       = asset.title || asset.mark || "Untitled";
                      const number      = asset.applicationNumber || asset.registrationNumber || "—";

                      return (
                        <tr
                          key={`${asset.assetType}-${asset.id}`}
                          onClick={() => setSelectedAsset(asset)}
                          className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/40 cursor-pointer transition group"
                        >
                          <td className="px-4 py-4 max-w-[220px]">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition truncate">{title}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 font-mono mt-0.5">{number}</p>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                              asset.assetType === "PATENT"
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400"
                                : "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400"
                            }`}>{asset.assetType}</span>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit ${stageConfig.badge}`}>
                              {stageConfig.icon} {asset.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 min-w-[140px]">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${stageConfig.color}`} style={{ width: `${progress}%` }} />
                              </div>
                              <span className="text-xs text-gray-400 w-8">{progress}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-xs text-gray-500 dark:text-gray-400">{asset.filingDate || "—"}</td>
                          <td className="px-4 py-4 text-xs text-gray-500 dark:text-gray-400">{asset.expirationDate || "—"}</td>
                          <td className="px-4 py-4">
                            <span className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium">{asset.jurisdiction || "—"}</span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
};

export default StatusDashboard;