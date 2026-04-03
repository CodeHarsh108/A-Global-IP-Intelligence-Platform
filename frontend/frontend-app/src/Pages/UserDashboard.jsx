import { useState, useEffect } from "react";
import axios from "axios";
import DashboardLayout from "../components/layouts/DashboardLayout";
import { Search, Bookmark, Bell, Clock, Activity, Calendar } from "lucide-react";

const API_BASE_URL = "http://localhost:8080/api";
const getAuthHeader = () => {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const UserDashboard = () => {
  const [stats, setStats] = useState({ totalSearches: 0, savedAssets: 0, activeSubscriptions: 0 });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeader();
      const [statsRes, activityRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/user/dashboard/stats`, { headers }),
        axios.get(`${API_BASE_URL}/user/dashboard/activity`, { headers })
      ]);
      setStats(statsRes.data);
      setActivities(activityRes.data);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      setError("Unable to load your dashboard. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "SEARCH": return <Search size={16} className="text-blue-500" />;
      case "SAVED": return <Bookmark size={16} className="text-green-500" />;
      case "SUBSCRIBED": return <Bell size={16} className="text-yellow-500" />;
      default: return <Activity size={16} className="text-gray-500" />;
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  };

  const statCards = [
    { label: "Total Searches", value: stats.totalSearches, icon: <Search size={24} className="text-blue-600" />, bg: "bg-blue-100" },
    { label: "Saved Assets", value: stats.savedAssets, icon: <Bookmark size={24} className="text-green-600" />, bg: "bg-green-100" },
    { label: "Active Subscriptions", value: stats.activeSubscriptions, icon: <Bell size={24} className="text-yellow-600" />, bg: "bg-yellow-100" },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Dashboard</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Your personal IP activity at a glance
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl p-4 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {statCards.map((card, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{card.label}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{card.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${card.bg}`}>{card.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity Timeline */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Clock size={18} /> Recent Activity
          </h2>

          {activities.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Activity size={40} className="mx-auto mb-3 opacity-50" />
              <p>No recent activity yet. Start searching and saving IP assets!</p>
            </div>
          ) : (
            <div className="relative">
              {/* Vertical timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
              <div className="space-y-6">
                {activities.map((activity, idx) => (
                  <div key={idx} className="relative pl-10">
                    {/* Timeline dot */}
                    <div className="absolute left-2 top-1 w-5 h-5 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{activity.title}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{activity.description}</p>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-1">
                          <Calendar size={12} /> {formatDate(activity.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickActionCard
            title="Search Patents"
            description="Find patents by keyword, assignee, or inventor"
            icon={<Search size={20} />}
            link="/search"
            color="blue"
          />
          <QuickActionCard
            title="My Subscriptions"
            description="Manage your IP alerts"
            icon={<Bell size={20} />}
            link="/subscriptions"
            color="yellow"
          />
          <QuickActionCard
            title="Saved Assets"
            description="View your saved patents & trademarks"
            icon={<Bookmark size={20} />}
            link="/my-assets" // You'll need to create this route
            color="green"
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

const QuickActionCard = ({ title, description, icon, link, color }) => {
  const colorClasses = {
    blue: "border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-900/20",
    yellow: "border-yellow-200 hover:bg-yellow-50 dark:hover:bg-yellow-900/20",
    green: "border-green-200 hover:bg-green-50 dark:hover:bg-green-900/20",
  };
  return (
    <a
      href={link}
      className={`block bg-white dark:bg-gray-800 border ${colorClasses[color]} rounded-xl p-4 transition hover:shadow-md`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-${color}-100 dark:bg-${color}-900/20`}>{icon}</div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
        </div>
      </div>
    </a>
  );
};

export default UserDashboard;