// src/Pages/AnalystDashboard.jsx
import { useEffect, useState } from "react";
import DashboardLayout from "../components/layouts/DashboardLayout";
import axios from "axios";
import { Loader2, TrendingUp, BarChart3, Bell, FileText, Award } from "lucide-react";

const API_BASE_URL = "http://localhost:8080/api";

const getAuthHeader = () => {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const AnalystDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const headers = getAuthHeader();
    Promise.allSettled([
      axios.get(`${API_BASE_URL}/analyst/dashboard`, { headers }),
      axios.get(`${API_BASE_URL}/analyst/analytics`, { headers }),
    ]).then(([dashRes, analyticsRes]) => {
      if (dashRes.status === "fulfilled") setDashboardData(dashRes.value.data);
      if (analyticsRes.status === "fulfilled") setAnalyticsData(analyticsRes.value.data);
      if (dashRes.status === "rejected" && analyticsRes.status === "rejected") {
        setError("Failed to load dashboard data.");
      }
      setLoading(false);
    });
  }, []);

  // Build stats from analytics data, fallback to dashboard data, then defaults
  const stats = [
    {
      label: "Total Patents",
      value: analyticsData?.totalPatents ?? "—",
      icon: <FileText size={20} className="text-blue-400" />,
    },
    {
      label: "Total Trademarks",
      value: analyticsData?.totalTrademarks ?? "—",
      icon: <TrendingUp size={20} className="text-purple-400" />,
    },
    {
      label: "Active Monitors",
      value: analyticsData?.activeMonitors ?? "—",
      icon: <Bell size={20} className="text-amber-400" />,
    },
    {
      label: "Reports Generated",
      value: analyticsData?.reportsGenerated ?? "—",
      icon: <BarChart3 size={20} className="text-emerald-400" />,
    },
  ];

  const trends = analyticsData?.trends || [];
  const features = dashboardData?.features || [];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 size={36} className="animate-spin text-blue-500" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-white">Analyst Dashboard</h2>
          <p className="text-sm text-gray-400 mt-1">
            {dashboardData?.message || "Monitor your research activity and generated insights"}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((item, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-xl shadow-md hover:bg-white/15 transition"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-400">{item.label}</p>
                {item.icon}
              </div>
              <h3 className="text-3xl font-bold text-white">{item.value}</h3>
            </div>
          ))}
        </div>

        {/* Trends & Features row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trends */}
          {trends.length > 0 && (
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-xl shadow-md">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp size={18} className="text-blue-400" /> Market Trends
              </h3>
              <ul className="space-y-3">
                {trends.map((trend, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 text-sm text-gray-300 py-2 border-b border-white/10 last:border-0"
                  >
                    <span className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                    {trend}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Available Features */}
          {features.length > 0 && (
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-xl shadow-md">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Award size={18} className="text-emerald-400" /> Available Features
              </h3>
              <ul className="space-y-3">
                {features.map((feature, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 text-sm text-gray-300 py-2 border-b border-white/10 last:border-0"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AnalystDashboard;