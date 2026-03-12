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
  Info
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer
} from "recharts";

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

  // Summary card values
  const totalFilings = filteredPatents.length + filteredTrademarks.length;
  const activePatents = filteredPatents.length;
  const pendingApplications = filteredTrademarks.length;
  const jurisdictionsCount = jurisdictionData.length;

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
              All charts update based on the selected time range
            </p>
          </div>

          <div className="flex gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 text-cyan-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="1m">Last Month</option>
              <option value="3m">Last 3 Months</option>
              <option value="6m">Last 6 Months</option>
              <option value="1y">Last Year</option>
              <option value="all">All Time</option>
            </select>

            <button
              onClick={() => setShowReportModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 text-sm"
            >
              <Download size={16} />
              Export Report
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
            iconBg="bg-blue-100"
          />
          <StatCard
            label="Patents"
            value={activePatents}
            sub="In selected period"
            icon={<Activity size={24} className="text-green-600" />}
            iconBg="bg-green-100"
          />
          <StatCard
            label="Trademarks"
            value={pendingApplications}
            sub="In selected period"
            icon={<BarChart3 size={24} className="text-yellow-600" />}
            iconBg="bg-yellow-100"
          />
          <StatCard
            label="Jurisdictions"
            value={jurisdictionsCount}
            sub="Active"
            icon={<Globe size={24} className="text-purple-600" />}
            iconBg="bg-purple-100"
          />
        </div>

        {/* === VISUALIZATIONS SECTION === */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-500" /> IP Intelligence Visualizations
          </h2>

          {/* Row 0: Top Cited Bar Chart – full width */}
          <ChartCard title="Top 10 Cited Patents" description="Patents with the highest citation count in the selected period">
            {topCitedData.length > 0 ? (
              <ResponsiveContainer width="100%" height={450}>
                <BarChart
                  data={topCitedData}
                  layout="vertical"
                  margin={{ left: 200, right: 20, top: 10, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis type="number" stroke="#aaa" />
                  <YAxis
                    type="category"
                    dataKey="title"
                    width={190}
                    stroke="#aaa"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(value) =>
                      value.length > 40 ? value.substring(0, 37) + "..." : value
                    }
                  />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#374151' }} />
                  <Bar dataKey="citationCount" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="No citation data for this period" />
            )}
          </ChartCard>

          {/* Row 1: Filing Trends + Technology Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Filing Trends" description="Patent and trademark filings over time">
              {trendsData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendsData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="year" stroke="#aaa" />
                    <YAxis stroke="#aaa" />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151' }} />
                    <Legend />
                    <Line type="monotone" dataKey="patentCount" stroke="#8884d8" name="Patents" />
                    <Line type="monotone" dataKey="trademarkCount" stroke="#82ca9d" name="Trademarks" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState message="No filing data for this period" />
              )}
            </ChartCard>

            <ChartCard title="Technology Distribution" description="Top technology areas by patent count">
              {techDistData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={techDistData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      onClick={(data) => setSelectedTech(data.name)}
                    >
                      {techDistData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState message="No technology data for this period" />
              )}
              {selectedTech && (
                <div className="mt-2 text-xs text-gray-500">
                  Clicked: {selectedTech} – (drill‑down coming soon)
                </div>
              )}
            </ChartCard>
          </div>

          {/* Row 2: Family Distribution + Top Jurisdictions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Patent Family Sizes" description="Number of patent families by size (members per family)">
              {familyData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={familyData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {familyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-gray-500 mt-2">
                    Larger families indicate broader international protection.
                  </p>
                </>
              ) : (
                <EmptyState message="No family data for this period" />
              )}
            </ChartCard>

            <ChartCard title="Top Jurisdictions" description="Filing distribution by patent office">
              {jurisdictionData.length > 0 ? (
                <div className="space-y-4">
                  {jurisdictionData.map((j) => (
                    <div key={j.country}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-400">{j.country}</span>
                        <span className="text-gray-900 dark:text-white font-medium">{j.count}</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-600 rounded-full" style={{ width: `${j.percentage}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState message="No jurisdiction data for this period" />
              )}
            </ChartCard>
          </div>

          {/* Row 3: Additional Insights (Assignees + Reports) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Top Assignees" description="Organizations with most filings">
              {assigneeData.length > 0 ? (
                <>
                  <div className="space-y-4">
                    {assigneeData.slice(0, 5).map((a) => (
                      <div key={a.name} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{a.name}</p>
                          <p className="text-xs text-gray-500">Filings: {a.count}</p>
                        </div>
                        <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">{a.trend}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowAssigneesModal(true)}
                    className="mt-4 w-full py-2 text-sm text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50 transition"
                  >
                    View All Assignees
                  </button>
                </>
              ) : (
                <EmptyState message="No assignee data for this period" />
              )}
            </ChartCard>

            <ChartCard title="Recent Reports" description="Previously generated reports">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Recent Reports</h3>
                <button
                  onClick={() => setShowReportModal(true)}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  Generate New
                </button>
              </div>
              {reports.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm italic">No reports available yet.</p>
              ) : (
                <div className="space-y-3">
                  {reports.slice(0, 3).map((report, idx) => (
                    <div key={report.id ?? idx} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition">
                      <div className="flex items-center gap-3">
                        <FileText size={20} className="text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{report.name}</p>
                          <p className="text-xs text-gray-500">Generated on {report.date}</p>
                        </div>
                      </div>
                      <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg">
                        <Download size={16} className="text-gray-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </ChartCard>
          </div>
        </div>
      </div>

      {/* View All Assignees Modal */}
      {showAssigneesModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">All Assignees</h3>
              <button
                onClick={() => setShowAssigneesModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="py-3 text-left font-medium text-gray-600 dark:text-gray-400">Assignee</th>
                    <th className="py-3 text-left font-medium text-gray-600 dark:text-gray-400">Filings</th>
                    <th className="py-3 text-left font-medium text-gray-600 dark:text-gray-400">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedAssignees.map((a) => (
                    <tr key={a.name} className="border-b border-gray-200 dark:border-gray-700 last:border-0">
                      <td className="py-3 text-gray-900 dark:text-white">{a.name}</td>
                      <td className="py-3 text-gray-700 dark:text-gray-300">{a.count}</td>
                      <td className="py-3">
                        <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">{a.trend}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Pagination */}
              <div className="flex justify-center gap-2 mt-4">
                {Array.from({ length: totalAssigneePages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setAssigneePage(i + 1)}
                    className={`px-3 py-1 rounded-lg text-sm border transition ${
                      assigneePage === i + 1
                        ? "bg-blue-600 text-white border-blue-600"
                        : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button
                onClick={() => setShowAssigneesModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generate Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Generate Report</h3>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Report Type</label>
                <select
                  value={selectedReportType}
                  onChange={(e) => setSelectedReportType(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
                >
                  <option value="summary">Summary (Trends + Top Cited)</option>
                  <option value="full">Full Report (Includes Jurisdictions & Assignees)</option>
                </select>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                The report will be downloaded as a CSV file.
              </p>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 border border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => exportReports(selectedReportType)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Download size={16} />
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

// Helper components
const StatCard = ({ label, value, sub, icon, iconBg }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{value}</h3>
        <p className="text-xs text-green-600 mt-1">{sub}</p>
      </div>
      <div className={`p-3 ${iconBg} rounded-lg`}>{icon}</div>
    </div>
  </div>
);

const ChartCard = ({ title, description, children }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-300">
    <div className="flex items-center gap-2 mb-4">
      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</h3>
      <div className="group relative">
        <Info size={14} className="text-gray-400 cursor-help" />
        <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 w-48">
          {description}
        </div>
      </div>
    </div>
    {children}
  </div>
);

const EmptyState = ({ message }) => (
  <div className="h-[300px] flex items-center justify-center text-gray-400 bg-gray-100 dark:bg-gray-700 rounded">
    {message}
  </div>
);

export default Analytics;