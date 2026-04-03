import React, { useState, useEffect, useMemo } from "react";
import DashboardLayout from "../components/layouts/DashboardLayout";
import axios from "axios";
import {
  BarChart3,
  TrendingUp,
  Globe,
  Calendar,
  Download,
  FileText,
  Activity,
  Loader2,
  Layers,
  Award,
  PieChart as PieChartIcon,
  X,
  Info,
  ChevronDown,
  Plus
} from "lucide-react";
// Recharts removed due to React 19 compatibility issues - using custom CSS visualizations instead.

const API_BASE_URL = "http://localhost:8080/api";
const getAuthHeader = () => {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

// Helper to get date range from timeRange string
const getDateRange = (range) => {
  const now = new Date();
  switch (range) {
    case "1m": return new Date(now.setMonth(now.getMonth() - 1));
    case "3m": return new Date(now.setMonth(now.getMonth() - 3));
    case "6m": return new Date(now.setMonth(now.getMonth() - 6));
    case "1y": return new Date(now.setFullYear(now.getFullYear() - 1));
    default: return null;
  }
};

const Analytics = () => {
  const [timeRange, setTimeRange] = useState("1y");
  const [dataType, setDataType] = useState("patents");
  const [analyticsData, setAnalyticsData] = useState(null);
  const [reports, setReports] = useState([]);
  const [allPatents, setAllPatents] = useState([]); // store all patents for frontend filtering
  const [allTrademarks, setAllTrademarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTech, setSelectedTech] = useState(null); // for drill-down

  // Modal states
  const [showAssigneesModal, setShowAssigneesModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [assigneePage, setAssigneePage] = useState(1);
  const [selectedReportType, setSelectedReportType] = useState("summary");

  useEffect(() => {
  const headers = getAuthHeader();
  Promise.allSettled([
    axios.get(`${API_BASE_URL}/analyst/analytics`, { headers }),
    axios.get(`${API_BASE_URL}/analyst/reports`, { headers }),
    axios.post(`${API_BASE_URL}/ip/patents/search?size=1000`, {}, { headers }),
    axios.post(`${API_BASE_URL}/ip/trademarks/search?size=500`, {}, { headers })
  ]).then(([analyticsRes, reportsRes, patentsRes, trademarksRes]) => {
    if (analyticsRes.status === "fulfilled") setAnalyticsData(analyticsRes.value.data);
    if (reportsRes.status === "fulfilled") {
      const reportsPayload = reportsRes.value.data;
      setReports(Array.isArray(reportsPayload) ? reportsPayload : (reportsPayload?.reports || []));
    }
    if (patentsRes.status === "fulfilled") {
      console.log('Patents response:', patentsRes.value.data);
      setAllPatents(patentsRes.value.data?.patents || []);
    }
    if (trademarksRes.status === "fulfilled") {
      console.log('Trademarks response:', trademarksRes.value.data);
      setAllTrademarks(trademarksRes.value.data?.trademarks || []);
    }
    setLoading(false);
  });
}, []);

  // Filter data based on timeRange
  const filteredPatents = useMemo(() => {
    if (!allPatents.length) return [];
    const cutoff = getDateRange(timeRange);
    if (!cutoff) return allPatents;
    return allPatents.filter(p => new Date(p.filingDate) >= cutoff);
  }, [allPatents, timeRange]);

  const filteredTrademarks = useMemo(() => {
    if (!allTrademarks.length) return [];
    const cutoff = getDateRange(timeRange);
    if (!cutoff) return allTrademarks;
    return allTrademarks.filter(t => new Date(t.filingDate) >= cutoff);
  }, [allTrademarks, timeRange]);

  // Derive chart data from filtered patents/trademarks
  const trendsData = useMemo(() => {
    const years = {};
    filteredPatents.forEach(p => {
      const year = new Date(p.filingDate).getFullYear();
      years[year] = years[year] || { year, patentCount: 0, trademarkCount: 0 };
      years[year].patentCount++;
    });
    filteredTrademarks.forEach(t => {
      const year = new Date(t.filingDate).getFullYear();
      years[year] = years[year] || { year, patentCount: 0, trademarkCount: 0 };
      years[year].trademarkCount++;
    });
    return Object.values(years).sort((a, b) => a.year - b.year);
  }, [filteredPatents, filteredTrademarks]);

  const topCitedData = useMemo(() => {
    return [...filteredPatents]
      .sort((a, b) => (b.citationCount || 0) - (a.citationCount || 0))
      .slice(0, 10)
      .map(p => ({ title: p.title, citationCount: p.citationCount || 0 }));
  }, [filteredPatents]);

  const techDistData = useMemo(() => {
    const techs = {};
    filteredPatents.forEach(p => {
      if (p.technology) {
        techs[p.technology] = (techs[p.technology] || 0) + 1;
      }
    });
    return Object.entries(techs)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [filteredPatents]);

  const familyData = useMemo(() => {
    const families = {};
    filteredPatents.forEach(p => {
      if (p.familyId) {
        const size = p.familyId ? 1 : 0; // simplistic: count members per family would need grouping
        // For demo, we'll use mock distribution based on citationCount
        const range = (p.citationCount || 0) > 50 ? "6+ members" : (p.citationCount || 0) > 20 ? "3-5 members" : "1-2 members";
        families[range] = (families[range] || 0) + 1;
      }
    });
    // fallback if no family data
    if (Object.keys(families).length === 0) {
      return [
        { name: "1-2 members", value: 45, percentage: 50 },
        { name: "3-5 members", value: 30, percentage: 33.3 },
        { name: "6+ members", value: 15, percentage: 16.7 }
      ];
    }
    const total = Object.values(families).reduce((a, b) => a + b, 0);
    return Object.entries(families).map(([name, value]) => ({
      name,
      value,
      percentage: ((value / total) * 100).toFixed(1)
    }));
  }, [filteredPatents]);

  const jurisdictionData = useMemo(() => {
    const juris = {};
    filteredPatents.forEach(p => {
      if (p.jurisdiction) {
        juris[p.jurisdiction] = (juris[p.jurisdiction] || 0) + 1;
      }
    });
    filteredTrademarks.forEach(t => {
      if (t.jurisdiction) {
        juris[t.jurisdiction] = (juris[t.jurisdiction] || 0) + 1;
      }
    });
    const total = Object.values(juris).reduce((a, b) => a + b, 0);
    return Object.entries(juris)
      .map(([name, count]) => ({ country: name, count, percentage: ((count / total) * 100).toFixed(1) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [filteredPatents, filteredTrademarks]);

  const assigneeData = useMemo(() => {
    const assignees = {};
    filteredPatents.forEach(p => {
      if (p.assignee) {
        assignees[p.assignee] = (assignees[p.assignee] || 0) + 1;
      }
    });
    filteredTrademarks.forEach(t => {
      if (t.assignee) {
        assignees[t.assignee] = (assignees[t.assignee] || 0) + 1;
      }
    });
    return Object.entries(assignees)
      .map(([name, count]) => ({ name, count, trend: "+" + Math.floor(Math.random() * 30) + "%" })) // random trend for demo
      .sort((a, b) => b.count - a.count);
  }, [filteredPatents, filteredTrademarks]);

  // Pagination for assignees modal
  const assigneesPerPage = 5;
  const totalAssigneePages = Math.ceil(assigneeData.length / assigneesPerPage);
  const paginatedAssignees = assigneeData.slice(
    (assigneePage - 1) * assigneesPerPage,
    assigneePage * assigneesPerPage
  );

  // Export function
  const exportReports = (type = "summary") => {
    let csv = "";
    if (type === "summary" || type === "full") {
      csv += "Year,Patent Count,Trademark Count\n";
      trendsData.forEach(t => {
        csv += `${t.year},${t.patentCount},${t.trademarkCount}\n`;
      });
      csv += "\nTitle,Citation Count\n";
      topCitedData.forEach(t => {
        const title = t.title.replace(/,/g, ' ');
        csv += `"${title}",${t.citationCount}\n`;
      });
    }
    if (type === "full") {
      csv += "\nJurisdiction,Count,Percentage\n";
      jurisdictionData.forEach(j => {
        csv += `${j.country},${j.count},${j.percentage}%\n`;
      });
      csv += "\nAssignee,Filings,Trend\n";
      assigneeData.forEach(a => {
        csv += `${a.name},${a.count},${a.trend}\n`;
      });
    }
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics_${type}_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    setShowReportModal(false);
  };

  const barColors = [
    "bg-blue-500",
    "bg-indigo-500",
    "bg-violet-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-rose-500",
    "bg-orange-500",
    "bg-amber-500",
    "bg-yellow-500",
    "bg-lime-500",
    "bg-emerald-500",
    "bg-teal-500",
  ];

  const filingTrends = {
    months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    patents: [45, 52, 48, 61, 55, 67, 72, 65, 59, 75, 82, 88],
    trademarks: [32, 38, 35, 42, 40, 48, 52, 45, 42, 55, 60, 65]
  };

  const topJurisdictions = [
    { country: "United States (USPTO)", count: 245, percentage: 32 },
    { country: "European Union (EPO)", count: 178, percentage: 23 },
    { country: "China (CNIPA)", count: 156, percentage: 20 },
    { country: "Japan (JPO)", count: 98, percentage: 13 },
    { country: "South Korea (KIPO)", count: 67, percentage: 9 },
    { country: "Others", count: 23, percentage: 3 }
  ];

  const topAssignees = [
    { name: "MedTech Corp", count: 34, trend: "+12%" },
    { name: "AgroTech Industries", count: 28, trend: "+8%" },
    { name: "Nano Solutions Inc", count: 23, trend: "+15%" },
    { name: "BioGen Research", count: 21, trend: "+5%" },
    { name: "Quantum Computing Ltd", count: 18, trend: "+22%" }
  ];

  const statusDistribution = [
    { status: "Granted", count: 342, percentage: 45, color: "bg-green-500" },
    { status: "Pending", count: 256, percentage: 34, color: "bg-yellow-500" },
    { status: "Published", count: 98, percentage: 13, color: "bg-blue-500" },
    { status: "Expired", count: 62, percentage: 8, color: "bg-red-500" }
  ];

  // Summary card values — prefer backend data, fallback to mock counts
  const totalFilings = analyticsData?.totalPatents != null && analyticsData?.totalTrademarks != null
    ? analyticsData.totalPatents + analyticsData.totalTrademarks
    : 758;
  const activePatents = analyticsData?.totalPatents ?? 342;
  const pendingApplications = analyticsData?.totalTrademarks ?? 256;
  const jurisdictionsCount = 12;

  const handleExport = () => {
    // Prepare CSV data for Top Jurisdictions
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "SECTION: TOP JURISDICTIONS\n";
    csvContent += "Country,Count,Percentage\n";
    topJurisdictions.forEach(j => {
      csvContent += `${j.country},${j.count},${j.percentage}%\n`;
    });

    csvContent += "\nSECTION: STATUS DISTRIBUTION\n";
    csvContent += "Status,Count,Percentage\n";
    statusDistribution.forEach(s => {
      csvContent += `${s.status},${s.count},${s.percentage}%\n`;
    });

    csvContent += "\nSECTION: TOP ASSIGNEES\n";
    csvContent += "Name,Count,Trend\n";
    topAssignees.forEach(a => {
      csvContent += `"${a.name}",${a.count},${a.trend}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `IP_Analytics_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Analytics Dashboard
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Comprehensive intellectual property intelligence and visualization
            </p>
          </div>

          <div className="flex gap-3">
            <div className="relative">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-semibold rounded-xl text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all"
              >
                <option value="1m">Last Month</option>
                <option value="3m">Last 3 Months</option>
                <option value="6m">Last 6 Months</option>
                <option value="1y">Last Year</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                <ChevronDown size={16} />
              </div>
            </div>

            <button 
              onClick={handleExport}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all flex items-center gap-2 text-sm shadow-md shadow-blue-500/20"
            >
              <Download size={18} />
              Export Dataset
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            label="Total Filings"
            value={totalFilings}
            sub="Patents + Trademarks"
            icon={<FileText size={24} className="text-blue-600" />}
            iconBg="bg-blue-100 dark:bg-blue-900/20"
          />
          <StatCard
            label="Active Patents"
            value={activePatents}
            sub="Across all jurisdictions"
            icon={<Activity size={24} className="text-green-600" />}
            iconBg="bg-green-100 dark:bg-green-900/20"
          />
          <StatCard
            label="Trademarks"
            value={pendingApplications}
            sub="Active registrations"
            icon={<BarChart3 size={24} className="text-orange-600" />}
            iconBg="bg-orange-100 dark:bg-orange-900/20"
          />
          <StatCard
            label="Global Offices"
            value={jurisdictionsCount}
            sub="Active jurisdictions"
            icon={<Globe size={24} className="text-purple-600" />}
            iconBg="bg-purple-100 dark:bg-purple-900/20"
          />
        </div>

        {/* Row 1: Filing Trends + Recent Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Filing Trends Chart (2/3 width) */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Filing Trends</h2>
                <p className="text-xs text-gray-500 mt-1">Monthly progression of intellectual property registrations</p>
              </div>
              <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
                <button
                  onClick={() => setDataType("patents")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${dataType === "patents"
                    ? "bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                >
                  Patents
                </button>
                <button
                  onClick={() => setDataType("trademarks")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${dataType === "trademarks"
                    ? "bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-400 shadow-sm"
                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                >
                  Trademarks
                </button>
              </div>
            </div>

            {(() => {
              const rangeMap = { "1m": 1, "3m": 3, "6m": 6, "1y": 12 };
              const count = rangeMap[timeRange] ?? 6;
              const slicedMonths = filingTrends.months.slice(-count);
              const slicedValues = filingTrends[dataType].slice(-count);
              const max = Math.max(...slicedValues, 1);
              return (
                <div className="space-y-5">
                  {slicedMonths.map((month, index) => {
                    const value = slicedValues[index];
                    const percentage = (value / max) * 100;
                    const colorClasses = barColors[index % barColors.length];
                    
                    return (
                      <div key={month} className="group flex items-center gap-6">
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 w-12 font-black uppercase tracking-widest">{month}</span>
                        <div className="flex-1 h-3.5 bg-gray-50 dark:bg-gray-700/50 rounded-full overflow-hidden relative">
                          <div
                            className={`h-full ${colorClasses} rounded-full transition-all duration-1000 ease-out group-hover:opacity-80 shadow-sm`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="w-12 text-right">
                          <span className="text-sm font-black text-gray-700 dark:text-gray-200 group-hover:text-blue-600 transition-colors">
                            {value}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>

          {/* Recent Reports Section (1/3 width, moved up) */}
          <ChartCard title="Intelligence Reports" description="Previously generated analytical reports for quick access">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Recent Activity</h3>
              <button
                onClick={() => setShowReportModal(true)}
                className="p-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 transition-colors"
                title="Generate New Report"
              >
                <Plus size={16} />
              </button>
            </div>
            {reports.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 bg-gray-50/50 dark:bg-gray-700/20 rounded-2xl border border-dashed border-gray-200 dark:border-gray-600">
                <FileText size={40} className="text-gray-200 dark:text-gray-700 mb-3" />
                <p className="text-gray-400 dark:text-gray-500 text-xs font-medium text-center px-6">No reports generated recently</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.slice(0, 5).map((report, idx) => (
                  <div key={report.id ?? idx} className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-700/30 hover:bg-white dark:hover:bg-gray-700 rounded-2xl transition-all border border-transparent hover:border-gray-100 dark:hover:border-gray-600 group">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-white dark:bg-gray-600 rounded-xl shadow-sm">
                        <FileText size={20} className="text-blue-500 dark:text-blue-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-[120px]">{report.name}</p>
                        <p className="text-[10px] text-gray-400 font-medium uppercase mt-0.5">{report.date}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => exportReports("full")}
                      className="p-2.5 bg-white dark:bg-gray-600 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl shadow-sm transition-all opacity-0 group-hover:opacity-100"
                      title="Download Full Report"
                    >
                      <Download size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button
               onClick={() => setShowReportModal(true)}
               className="mt-6 w-full py-3 text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 border-2 border-dashed border-blue-100 dark:border-blue-900/30 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-2xl transition-all"
            >
              Generate Analytical Snapshot
            </button>
          </ChartCard>
        </div>

        {/* Row 2: Top Cited Patents (Full Width) */}
        <div className="grid grid-cols-1 gap-6">
          <ChartCard title="Strategic Impact: Top Cited Patents" description="Patents with the highest global citation volume indicating market leadership">
            {topCitedData.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8 pt-4">
                {topCitedData.slice(0, 8).map((p, idx) => (
                  <div key={idx} className="group relative">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors leading-relaxed">
                          {p.title}
                        </h4>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mt-1">Strategic Asset #{idx + 1}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 ml-6">
                        <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                          <Activity size={16} />
                          <span className="text-base font-black tracking-tight">{p.citationCount}</span>
                        </div>
                        <span className="text-[10px] text-gray-400 uppercase font-black">Citations</span>
                      </div>
                    </div>
                    <div className="h-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-full overflow-hidden shadow-inner">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-full transition-all duration-1000 ease-out group-hover:brightness-110"
                        style={{ 
                          width: `${Math.min(100, (p.citationCount / (topCitedData[0]?.citationCount || 1)) * 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="Cumulative citation data unavailable" />
            )}
          </ChartCard>
        </div>

        {/* Row 3: Family Distribution + Top Jurisdictions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Global Protection: Family Distribution" description="Breadth of international coverage per patent family">
            {familyData.length > 0 ? (
              <div className="space-y-6 py-4">
                {familyData.map((entry, index) => (
                  <div key={entry.name} className="space-y-2">
                    <div className="flex justify-between text-sm items-center">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-lg shadow-sm" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                        />
                        <span className="text-gray-700 dark:text-gray-300 font-bold">{entry.name}</span>
                      </div>
                      <span className="text-gray-900 dark:text-white font-black text-base">{entry.percentage}%</span>
                    </div>
                    <div className="h-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-1000"
                        style={{ 
                          width: `${entry.percentage}%`,
                          backgroundColor: COLORS[index % COLORS.length] 
                        }}
                      />
                    </div>
                  </div>
                ))}
                <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-2xl border border-gray-100 dark:border-gray-600">
                  <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                    <Info size={12} className="inline mr-2" />
                    Increased family sizes typically correlate with higher asset valuation and broader litigation risk.
                  </p>
                </div>
              </div>
            ) : (
              <EmptyState message="Family size distribution not yet synchronized" />
            )}
          </ChartCard>

          <ChartCard title="Commercial Footprint: Jurisdictions" description="Geographic concentration of IP filings across major patent offices">
            {jurisdictionData.length > 0 ? (
              <div className="space-y-6 py-2">
                {jurisdictionData.map((j) => (
                  <div key={j.country} className="group">
                    <div className="flex justify-between text-sm mb-2">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-[10px] font-black rounded uppercase">{j.country.substring(0, 2)}</span>
                        <span className="text-gray-700 dark:text-gray-300 font-bold group-hover:text-purple-600 transition-colors">{j.country}</span>
                      </div>
                      <span className="text-gray-900 dark:text-white font-black">{j.count} Assets</span>
                    </div>
                    <div className="h-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000" 
                        style={{ width: `${j.percentage}%` }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="Geographic data processing in progress" />
            )}
          </ChartCard>
        </div>

        {/* Row 4: Top Assignees + Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
          <ChartCard title="Competitive Landscape: Top Assignees" description="Organizations with the most significant volume of new filings">
            {assigneeData.length > 0 ? (
              <div className="space-y-5 py-2">
                {assigneeData.slice(0, 5).map((a) => (
                  <div key={a.name} className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-700/30 rounded-2xl border border-transparent hover:border-gray-100 dark:hover:border-gray-600 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-600 shadow-sm flex items-center justify-center text-sm font-black text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                        {a.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-900 dark:text-white">{a.name}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Filings: {a.count}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl border border-green-100 dark:border-green-900/10">
                        {a.trend}
                      </span>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => setShowAssigneesModal(true)}
                  className="mt-4 w-full py-4 text-xs font-black uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-700 rounded-2xl transition-all shadow-lg shadow-blue-500/30"
                >
                  View Full Competitive Directory
                </button>
              </div>
            ) : (
              <EmptyState message="Assignee ranking currently unavailable" />
            )}
          </ChartCard>
          
          <div className="bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-700 rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
              <Globe size={160} />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                  <Activity size={24} />
                </div>
                <h3 className="text-2xl font-black tracking-tight">Intelligence Insights</h3>
              </div>
              
              <div className="space-y-6">
                <p className="text-white/90 text-lg font-medium leading-relaxed">
                  Predictive Analysis indicates your portfolio in <span className="px-2 py-0.5 bg-white/20 rounded font-black">Digital Health</span> is outperforming industry benchmarks by <span className="font-black text-green-300">12.4%</span> Year-over-Year.
                </p>
                <div className="p-6 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
                  <p className="text-sm font-bold text-indigo-100 flex items-center gap-2 mb-4">
                    <Info size={16} /> Market Momentum Indicator
                  </p>
                  <div className="flex justify-between items-center mb-2 text-[10px] font-black uppercase tracking-widest">
                    <span className="text-white/70">Efficiency</span>
                    <span className="text-white">88%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-400 to-blue-400 rounded-full w-[88%]" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative z-10 pt-8 flex gap-4">
              <div className="flex-1 p-4 bg-black/20 rounded-2xl backdrop-blur-sm">
                <p className="text-[10px] font-black uppercase tracking-tighter text-white/50 mb-1">Growth Forecast</p>
                <p className="text-xl font-black">+18%</p>
              </div>
              <div className="flex-1 p-4 bg-black/20 rounded-2xl backdrop-blur-sm">
                <p className="text-[10px] font-black uppercase tracking-tighter text-white/50 mb-1">Risk Score</p>
                <p className="text-xl font-black">Low</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View All Assignees Modal */}
      {showAssigneesModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-700 animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
              <div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Competitive Directory</h3>
                <p className="text-xs text-gray-500 font-medium mt-1">Full list of organizations by filing volume</p>
              </div>
              <button
                onClick={() => setShowAssigneesModal(false)}
                className="p-2.5 bg-white dark:bg-gray-700 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-xl shadow-sm transition-all"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-8 overflow-y-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <th className="pb-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Global Entity</th>
                    <th className="pb-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Asset Volume</th>
                    <th className="pb-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Market Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                  {paginatedAssignees.map((a) => (
                    <tr key={a.name} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="py-5 font-bold text-gray-900 dark:text-white">{a.name}</td>
                      <td className="py-5 text-gray-600 dark:text-gray-400 font-bold">{a.count}</td>
                      <td className="py-5 text-right">
                        <span className="text-[10px] font-black px-2.5 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg border border-green-100 dark:border-green-900/10">
                          {a.trend}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Pagination */}
              <div className="flex justify-center gap-2 mt-10">
                {Array.from({ length: totalAssigneePages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setAssigneePage(i + 1)}
                    className={`min-w-[40px] h-10 rounded-xl text-xs font-black transition-all ${
                      assigneePage === i + 1
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                        : "bg-gray-50 dark:bg-gray-700 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-8 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 flex justify-end">
              <button
                onClick={() => setShowAssigneesModal(false)}
                className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-black uppercase tracking-widest rounded-2xl hover:scale-105 transition-transform"
              >
                Close Directory
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generate Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-md w-full shadow-2xl border border-gray-100 dark:border-gray-700 animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
              <div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Export Intelligence</h3>
                <p className="text-xs text-gray-500 font-medium mt-1">Configure your analytical data export</p>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="p-2.5 bg-white dark:bg-gray-700 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-xl shadow-sm transition-all"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-8 space-y-8">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Analysis Depth</label>
                <div className="grid grid-cols-1 gap-3">
                  <button 
                    onClick={() => setSelectedReportType("summary")}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${selectedReportType === "summary" 
                      ? "border-blue-600 bg-blue-50/50 dark:bg-blue-900/20" 
                      : "border-gray-100 dark:border-gray-700 hover:border-blue-200"}`}
                  >
                    <p className="text-sm font-black text-gray-900 dark:text-white">Summary Snapshot</p>
                    <p className="text-xs text-gray-500 mt-1">Trends, Citations, and primary KPIs</p>
                  </button>
                  <button 
                    onClick={() => setSelectedReportType("full")}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${selectedReportType === "full" 
                      ? "border-blue-600 bg-blue-50/50 dark:bg-blue-900/20" 
                      : "border-gray-100 dark:border-gray-700 hover:border-blue-200"}`}
                  >
                    <p className="text-sm font-black text-gray-900 dark:text-white">Full Intelligence Report</p>
                    <p className="text-xs text-gray-500 mt-1">Includes Jurisdictions, Assignees, and raw data</p>
                  </button>
                </div>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-900/10">
                <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-3 font-medium">
                  <Download size={14} className="flex-shrink-0" />
                  Files are exported in industry-standard CSV format for immediate processing.
                </p>
              </div>
            </div>
            <div className="p-8 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-4">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-6 py-3 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-gray-900 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => exportReports(selectedReportType)}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-widest rounded-2xl flex items-center gap-3 transition-all shadow-lg shadow-blue-500/30"
              >
                <Download size={16} />
                Download Report
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

// Helper components with premium refinements
const StatCard = ({ label, value, sub, icon, iconBg }) => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-none transition-all duration-500 group">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">{label}</p>
        <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{value}</h3>
        <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 mt-2 uppercase tracking-tighter">{sub}</p>
      </div>
      <div className={`p-4 ${iconBg} rounded-2xl group-hover:scale-110 transition-transform duration-500 shadow-inner`}>
        {icon}
      </div>
    </div>
  </div>
);

const ChartCard = ({ title, description, children }) => (
  <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-none transition-all duration-500">
    <div className="flex items-center gap-3 mb-8">
      <div>
        <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">{title}</h3>
        <p className="text-xs text-gray-500 mt-1 font-medium">{description}</p>
      </div>
    </div>
    {children}
  </div>
);

const EmptyState = ({ message }) => (
  <div className="h-[320px] flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 dark:bg-gray-700/20 rounded-3xl border border-dashed border-gray-200 dark:border-gray-600">
    <Activity size={48} className="text-gray-200 dark:text-gray-700 mb-4 animate-pulse" />
    <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center px-12 leading-relaxed">
      {message}
    </p>
  </div>
);

export default Analytics;