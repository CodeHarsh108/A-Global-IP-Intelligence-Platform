import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import DashboardLayout from "../components/layouts/DashboardLayout";
import { toast } from "react-toastify";
import { RefreshCcw, Activity } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";

const API_BASE_URL = "http://localhost:8080";

const API_LIST = [
  { group: "Patents", name: "Patent Count", method: "GET", url: "/api/ip/patents/count" },
  { group: "Patents", name: "Patent Jurisdictions", method: "GET", url: "/api/ip/patents/jurisdictions" },
  { group: "Patents", name: "Patent Statuses", method: "GET", url: "/api/ip/patents/statuses" },
  { group: "Patents", name: "Patent Test", method: "GET", url: "/api/ip/patents/test" },
  { group: "Patents", name: "Patent Search", method: "POST", url: "/api/ip/patents/search" },
  { group: "Trademarks", name: "Trademark Count", method: "GET", url: "/api/ip/trademarks/count" },
  { group: "Trademarks", name: "Trademark Jurisdictions", method: "GET", url: "/api/ip/trademarks/jurisdictions" },
  { group: "Trademarks", name: "Trademark Search", method: "POST", url: "/api/ip/trademarks/search" },
  { group: "User Assets", name: "Get Assets", method: "GET", url: "/api/ip/assets" }
];

const APIMonitoring = () => {
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState([]);
  const [latencyHistory, setLatencyHistory] = useState([]);
  const [apiHistory, setApiHistory] = useState({}); // mini graphs

  const fetchStatus = useCallback(async () => {
    setLoading(true);

    const token = localStorage.getItem("accessToken");
    const config = {
      headers: { Authorization: token ? `Bearer ${token}` : "" }
    };

    let results = [];

    for (let api of API_LIST) {
      const start = Date.now();

      try {
        if (api.method === "POST") {
          await axios.post(API_BASE_URL + api.url, {}, config);
        } else {
          await axios.get(API_BASE_URL + api.url, config);
        }

        const latency = Date.now() - start;

        results.push({ ...api, latency, status: "UP" });

        // ✅ mini graph update
        setApiHistory(prev => ({
          ...prev,
          [api.name]: [
            ...(prev[api.name] || []).slice(-9),
            { value: latency }
          ]
        }));

      } catch (err) {
        const status = err.response?.status === 401 ? "AUTH" : "DOWN";

        results.push({ ...api, latency: 0, status });

        if (status === "DOWN") {
          toast.error(`${api.name} is DOWN`);
        }

        setApiHistory(prev => ({
          ...prev,
          [api.name]: [
            ...(prev[api.name] || []).slice(-9),
            { value: 0 }
          ]
        }));
      }
    }

    // average latency
    const healthy = results.filter(r => r.status === "UP");
    const avgLatency =
      healthy.length > 0
        ? healthy.reduce((acc, r) => acc + r.latency, 0) / healthy.length
        : 0;

    setLatencyHistory(prev => [
      ...prev.slice(-14),
      {
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        latency: Math.round(avgLatency)
      }
    ]);

    setServices(results);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 15000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const uptimePercent =
    services.length > 0
      ? Math.round(
          (services.filter(s => s.status === "UP").length / services.length) * 100
        )
      : 0;

  const circleColor = uptimePercent < 50 ? "#f43f5e" : "#10b981";

  return (
    <DashboardLayout>
      <div className="p-6 space-y-8 text-gray-200">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <p className="text-xs text-emerald-400 font-bold uppercase">System Live</p>
            </div>
            <h1 className="text-3xl font-bold text-white">API Monitoring</h1>
          </div>

          <button
            onClick={fetchStatus}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex gap-2 items-center"
          >
            <RefreshCcw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* STATS */}
        <div className="grid md:grid-cols-3 gap-6">
          <StatCard title="Total APIs" value={services.length} />
          <StatCard title="Healthy" value={services.filter(s => s.status === "UP").length} color="text-emerald-400" />
          <StatCard title="Down" value={services.filter(s => s.status === "DOWN").length} color="text-rose-400" />
        </div>

        {/* ANALYTICS */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* MAIN GRAPH */}
          <div className="lg:col-span-3 bg-[#1E2533] p-6 rounded-xl border border-slate-700/50">
            <h3 className="mb-6 text-white text-sm font-semibold uppercase">
              Response Time Trend
            </h3>

            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={latencyHistory}>
                  <defs>
                    <linearGradient id="latencyColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>

                  <CartesianGrid stroke="#334155" vertical={false} strokeDasharray="3 3" />

                  <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip />

                  <Area type="monotone" dataKey="latency" stroke="#3b82f6" fill="url(#latencyColor)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 🔥 CIRCULAR GRAPH RESTORED */}
          <div className="bg-[#1E2533] p-6 rounded-xl border border-slate-700/50 flex flex-col items-center justify-center">

            <h3 className="mb-6 text-white text-sm font-semibold uppercase">
              Uptime Score
            </h3>

            <div className="relative">
              <svg className="w-40 h-40 -rotate-90">
                <circle cx="80" cy="80" r="70" stroke="#0F172A" strokeWidth="12" fill="transparent"/>
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke={circleColor}
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray="439.8"
                  strokeDashoffset={439.8 - (439.8 * uptimePercent) / 100}
                  strokeLinecap="round"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-white">{uptimePercent}%</span>
                <span className="text-xs text-slate-400">
                  {uptimePercent < 50 ? "Critical" : "Stable"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* API CARDS */}
        {["Patents", "Trademarks", "User Assets"].map(group => (
          <div key={group}>
            <h2 className="text-xs text-slate-400 mb-4">{group}</h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {services
                .filter(s => s.group === group)
                .map((api, i) => (
                  <ServiceCard
                    key={i}
                    api={api}
                    history={apiHistory[api.name] || []}
                  />
                ))}
            </div>
          </div>
        ))}

      </div>
    </DashboardLayout>
  );
};

/* COMPONENTS */

const StatCard = ({ title, value, color = "text-white" }) => (
  <div className="bg-[#1E2533] p-5 rounded-xl border border-slate-700/50">
    <p className="text-xs text-slate-400">{title}</p>
    <h2 className={`text-2xl font-bold ${color}`}>{value}</h2>
  </div>
);

const ServiceCard = ({ api, history }) => {
  const color =
    api.status === "UP"
      ? "emerald"
      : api.status === "DOWN"
      ? "rose"
      : api.status === "AUTH"
      ? "purple"
      : "amber";

  return (
    <div className="bg-[#1E2533] border border-slate-700/50 p-4 rounded-xl hover:border-blue-500/50 transition">

      <div className="flex justify-between mb-2">
        <h4 className="text-white text-sm">{api.name}</h4>
        <span className={`text-xs px-2 py-1 rounded bg-${color}-500/10 text-${color}-400`}>
          {api.status}
        </span>
      </div>

      <p className="text-xs text-slate-400 mb-2">{api.url}</p>

      <div className="flex justify-between text-xs text-slate-400 mb-2">
        <span className="flex items-center gap-1">
          <Activity size={12} /> Latency
        </span>
        <span>{api.latency} ms</span>
      </div>

      {/* 🔥 MINI GRAPH */}
      <div className="h-12">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={history}>
            <Area
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              fill="#3b82f620"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};

export default APIMonitoring;
