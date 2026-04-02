import React, { useState, useMemo } from "react";
import DashboardLayout from "../components/layouts/DashboardLayout";
import { 
  Bell, CheckCircle, XCircle, AlertCircle, Clock, Filter, Eye, 
  Search, SortAsc, SortDesc, Trash2, Mail, CheckCheck, 
  AlertTriangle, Info, TrendingUp, Briefcase, Calendar
} from "lucide-react";

const Alerts = () => {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest, type
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: "Patent Filing",
      title: "New patent filing by MedTech Corp",
      description: "US Patent Application #2024012345 - AI-based Medical Imaging System",
      ipAsset: "AI-based Medical Imaging System",
      jurisdiction: "US",
      status: "Published",
      timestamp: "2026-02-17T10:30:00",
      read: false,
      severity: "info"
    },
    {
      id: 2,
      type: "Status Change",
      title: "Patent status changed to Granted",
      description: "Electric Vehicle Battery Technology (EP20231234) has been granted",
      ipAsset: "Electric Vehicle Battery Technology",
      jurisdiction: "EP",
      status: "Granted",
      timestamp: "2026-02-16T15:45:00",
      read: false,
      severity: "success"
    },
    {
      id: 3,
      type: "Competitor Activity",
      title: "New competitor filing detected",
      description: "Tesla filed new patent in semiconductor technology",
      ipAsset: "Semiconductor Device Architecture",
      jurisdiction: "US",
      status: "Filed",
      timestamp: "2026-02-16T09:20:00",
      read: true,
      severity: "warning"
    },
    {
      id: 4,
      type: "Legal Status",
      title: "Patent expired - renewal required",
      description: "Smart Agriculture Device patent needs renewal by March 2026",
      ipAsset: "Smart Agriculture Device",
      jurisdiction: "IN",
      status: "Expiring",
      timestamp: "2026-02-15T14:30:00",
      read: true,
      severity: "error"
    },
    {
      id: 5,
      type: "Trademark",
      title: "New trademark application",
      description: "Nike filed 'AirMax Pro' trademark in multiple jurisdictions",
      ipAsset: "AirMax Pro",
      jurisdiction: "US, EP, JP",
      status: "Applied",
      timestamp: "2026-02-15T11:10:00",
      read: false,
      severity: "info"
    }
  ]);

  const getSeverityIcon = (severity) => {
    switch(severity) {
      case "success": return <CheckCircle size={18} className="text-green-500" />;
      case "warning": return <AlertCircle size={18} className="text-yellow-500" />;
      case "error": return <XCircle size={18} className="text-red-500" />;
      default: return <Bell size={18} className="text-blue-500" />;
    }
  };

  const getSeverityBg = (severity) => {
    switch(severity) {
      case "success": return "bg-green-500/10 border-green-500/20";
      case "warning": return "bg-yellow-500/10 border-yellow-500/20";
      case "error": return "bg-red-500/10 border-red-500/20";
      default: return "bg-blue-500/10 border-blue-500/20";
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const markAsRead = (id) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, read: true } : alert
    ));
  };

  const markAllAsRead = () => {
    setAlerts(alerts.map(alert => ({ ...alert, read: true })));
  };

  const deleteAlert = (id) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  const deleteAllRead = () => {
    setAlerts(alerts.filter(alert => !alert.read));
  };

  // Filter and sort alerts
  const filteredAndSortedAlerts = useMemo(() => {
    let filtered = alerts;

    // Filter by type
    if (filter !== "all") {
      if (filter === "unread") {
        filtered = filtered.filter(a => !a.read);
      } else {
        filtered = filtered.filter(a => a.type.toLowerCase().includes(filter.toLowerCase()));
      }
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(a => 
        a.title.toLowerCase().includes(query) ||
        a.description.toLowerCase().includes(query) ||
        a.ipAsset.toLowerCase().includes(query) ||
        a.type.toLowerCase().includes(query)
      );
    }

    // Sort
    filtered = [...filtered];
    if (sortBy === "newest") {
      filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } else if (sortBy === "oldest") {
      filtered.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    } else if (sortBy === "type") {
      filtered.sort((a, b) => a.type.localeCompare(b.type));
    }
    
    return filtered;
  }, [alerts, filter, searchQuery, sortBy]);

  const unreadCount = alerts.filter(a => !a.read).length;
  const totalAlerts = alerts.length;

  // Statistics by type
  const statsByType = {
    patent: alerts.filter(a => a.type.includes("Patent")).length,
    trademark: alerts.filter(a => a.type.includes("Trademark")).length,
    competitor: alerts.filter(a => a.type.includes("Competitor")).length,
    legal: alerts.filter(a => a.type.includes("Legal")).length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Bell className="text-blue-500" size={28} />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Alerts & Notifications
              </h1>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Stay updated with IP activities and changes
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 text-sm shadow-md hover:shadow-lg"
              >
                <CheckCheck size={16} />
                Mark All Read
              </button>
            )}
            {alerts.some(a => a.read) && (
              <button
                onClick={deleteAllRead}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition flex items-center gap-2 text-sm"
              >
                <Trash2 size={16} />
                Clear Read
              </button>
            )}
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 dark:from-blue-500/20 dark:to-blue-600/10 rounded-xl border border-blue-500/20 p-4 hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <Bell size={20} className="text-blue-500" />
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalAlerts}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Total Alerts</p>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 dark:from-yellow-500/20 dark:to-yellow-600/10 rounded-xl border border-yellow-500/20 p-4 hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <Clock size={20} className="text-yellow-500" />
              <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{unreadCount}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Unread</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 dark:from-green-500/20 dark:to-green-600/10 rounded-xl border border-green-500/20 p-4 hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <TrendingUp size={20} className="text-green-500" />
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">{statsByType.patent}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Patent Alerts</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 dark:from-purple-500/20 dark:to-purple-600/10 rounded-xl border border-purple-500/20 p-4 hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <Briefcase size={20} className="text-purple-500" />
              <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">{statsByType.trademark}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Trademark Alerts</p>
          </div>
        </div>

        {/* Search and Filters Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search alerts by title, description, or IP asset..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pl-4 pr-10 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white appearance-none"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="type">Sort by Type</option>
              </select>
              {sortBy === "newest" ? (
                <SortDesc className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              ) : (
                <SortAsc className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              )}
            </div>
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by:</span>
            </div>
            
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                filter === "all" 
                  ? "bg-blue-600 text-white shadow-md" 
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              All
            </button>
            
            <button
              onClick={() => setFilter("unread")}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                filter === "unread" 
                  ? "bg-yellow-600 text-white shadow-md" 
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              Unread ({unreadCount})
            </button>
            
            <button
              onClick={() => setFilter("patent")}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                filter === "patent" 
                  ? "bg-green-600 text-white shadow-md" 
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              Patent
            </button>
            
            <button
              onClick={() => setFilter("trademark")}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                filter === "trademark" 
                  ? "bg-purple-600 text-white shadow-md" 
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              Trademark
            </button>

            <button
              onClick={() => setFilter("competitor")}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                filter === "competitor" 
                  ? "bg-orange-600 text-white shadow-md" 
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              Competitor
            </button>

            <button
              onClick={() => setFilter("legal")}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                filter === "legal" 
                  ? "bg-red-600 text-white shadow-md" 
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              Legal Status
            </button>
          </div>
        </div>

        {/* Alerts List with Animation */}
        <div className="space-y-4">
          {filteredAndSortedAlerts.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-12 text-center animate-in fade-in">
              <Bell size={64} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No alerts found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery ? "Try adjusting your search or filters." : "You're all caught up! No alerts to display."}
              </p>
            </div>
          ) : (
            filteredAndSortedAlerts.map((alert, index) => (
              <div
                key={alert.id}
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border ${
                  !alert.read ? 'border-l-4 border-l-blue-500 shadow-md' : 'border-gray-200 dark:border-gray-700'
                } p-6 transition-all duration-300 hover:shadow-xl animate-in slide-in-from-bottom-2`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className={`p-2 rounded-lg ${getSeverityBg(alert.severity)} shrink-0`}>
                      {getSeverityIcon(alert.severity)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {alert.title}
                        </h3>
                        {!alert.read && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs rounded-full animate-pulse">
                            New
                          </span>
                        )}
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock size={12} />
                          {formatTime(alert.timestamp)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {alert.description}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-3 text-xs">
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
                          {alert.type}
                        </span>
                        <span className="text-gray-500 truncate max-w-[200px]">
                          {alert.ipAsset}
                        </span>
                        <span className="text-gray-500">
                          {alert.jurisdiction}
                        </span>
                        <span className={`px-2 py-1 rounded-full ${
                          alert.status === "Granted" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                          alert.status === "Published" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                          alert.status === "Expiring" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                          "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400"
                        }`}>
                          {alert.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => markAsRead(alert.id)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition group"
                      title="Mark as read"
                    >
                      <Eye size={16} className="text-gray-500 group-hover:text-blue-500 transition" />
                    </button>
                    <button
                      onClick={() => deleteAlert(alert.id)}
                      className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition group"
                      title="Delete"
                    >
                      <XCircle size={16} className="text-gray-500 group-hover:text-red-500 transition" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary Footer */}
        {filteredAndSortedAlerts.length > 0 && (
          <div className="text-center text-sm text-gray-500 dark:text-gray-400 pt-4">
            Showing {filteredAndSortedAlerts.length} of {alerts.length} alerts
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Alerts;