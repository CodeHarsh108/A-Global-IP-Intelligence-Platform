// src/Pages/Analytics.jsx
import React, { useState, useEffect } from "react";
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
  X
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

const Analytics = () => {
  const [timeRange, setTimeRange] = useState("1y");
  const [dataType, setDataType] = useState("patents");
  const [analyticsData, setAnalyticsData] = useState(null);
  const [reports, setReports] = useState([]);
  const [trends, setTrends] = useState([]);
  const [topCited, setTopCited] = useState([]);
  const [familyDist, setFamilyDist] = useState([]);
  const [techDist, setTechDist] = useState([]);
  const [loading, setLoading] = useState(true);

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
      axios.get(`${API_BASE_URL}/analyst/visualizations/trends`, { headers }),
      axios.get(`${API_BASE_URL}/analyst/visualizations/top-cited?limit=10`, { headers }),
      axios.get(`${API_BASE_URL}/analyst/visualizations/families`, { headers }),
      axios.get(`${API_BASE_URL}/analyst/visualizations/technologies`, { headers })
    ]).then(([
      analyticsRes, reportsRes, trendsRes, topRes, familyRes, techRes
    ]) => {
      if (analyticsRes.status === "fulfilled") setAnalyticsData(analyticsRes.value.data);
      if (reportsRes.status === "fulfilled") {
        const reportsPayload = reportsRes.value.data;
        setReports(Array.isArray(reportsPayload) ? reportsPayload : (reportsPayload?.reports || []));
      }
      if (trendsRes.status === "fulfilled") setTrends(trendsRes.value.data);
      if (topRes.status === "fulfilled") setTopCited(topRes.value.data);
      if (familyRes.status === "fulfilled") setFamilyDist(familyRes.value.data);
      if (techRes.status === "fulfilled") setTechDist(techRes.value.data);
      setLoading(false);
    });
  }, []);

  // Prepare data for pie charts
  const pieTechData = techDist.slice(0, 5).map(item => ({
    name: item.technology,
    value: item.count
  }));

  // Family size distribution (fallback mock if empty)
  const familySizeCounts = familyDist.length > 0
    ? familyDist.reduce((acc, curr) => {
        const size = curr.memberCount;
        const range = size <= 2 ? "1-2 members" : size <= 5 ? "3-5 members" : "6+ members";
        acc[range] = (acc[range] || 0) + 1;
        return acc;
      }, {})
    : { "1-2 members": 45, "3-5 members": 30, "6+ members": 15 }; // fallback mock

  const familyPieData = Object.entries(familySizeCounts).map(([name, value]) => ({
    name,
    value,
    percentage: ((value / Object.values(familySizeCounts).reduce((a, b) => a + b, 0)) * 100).toFixed(1)
  }));

  // Filter trends based on timeRange
  const filteredTrends = (() => {
    if (!trends.length) return [];
    const sorted = [...trends].sort((a, b) => a.year - b.year);
    const now = new Date().getFullYear();
    switch (timeRange) {
      case "1m": return sorted.filter(d => d.year >= now - 1);
      case "3m": return sorted.filter(d => d.year >= now - 3);
      case "6m": return sorted.filter(d => d.year >= now - 6);
      case "1y": return sorted.filter(d => d.year >= now - 10);
      default: return sorted;
    }
  })();

  // Mock fallback data for charts when real data missing
  const mockTrends = [
    { year: 2020, patentCount: 45, trademarkCount: 23 },
    { year: 2021, patentCount: 52, trademarkCount: 28 },
    { year: 2022, patentCount: 48, trademarkCount: 25 },
    { year: 2023, patentCount: 61, trademarkCount: 32 },
    { year: 2024, patentCount: 58, trademarkCount: 35 },
  ];

  const mockTopCited = [
    { title: "AI-Based Medical Imaging System", citationCount: 45 },
    { title: "Solid-State Battery Technology", citationCount: 28 },
    { title: "CRISPR-Cas9 Gene Editing", citationCount: 156 },
    { title: "5G Beamforming Technology", citationCount: 67 },
    { title: "OLED Display with Quantum Dot Layer", citationCount: 34 },
    { title: "3D Stacked Semiconductor", citationCount: 12 },
    { title: "Wireless Charging System", citationCount: 23 },
    { title: "Autonomous Drone Navigation", citationCount: 41 },
    { title: "mRNA Vaccine Formulation", citationCount: 234 },
    { title: "Quantum Computing Error Correction", citationCount: 89 },
  ];

  const mockJurisdictions = [
    { country: "United States (USPTO)", count: 245, percentage: 32 },
    { country: "European Union (EPO)", count: 178, percentage: 23 },
    { country: "China (CNIPA)", count: 156, percentage: 20 },
    { country: "Japan (JPO)", count: 98, percentage: 13 },
    { country: "South Korea (KIPO)", count: 67, percentage: 9 },
    { country: "Others", count: 23, percentage: 3 }
  ];

  // Expanded list of assignees for modal
  const allAssignees = [
    { name: "MedTech Corp", count: 34, trend: "+12%" },
    { name: "AgroTech Industries", count: 28, trend: "+8%" },
    { name: "Nano Solutions Inc", count: 23, trend: "+15%" },
    { name: "BioGen Research", count: 21, trend: "+5%" },
    { name: "Quantum Computing Ltd", count: 18, trend: "+22%" },
    { name: "Tesla Motors", count: 42, trend: "+18%" },
    { name: "Samsung Electronics", count: 56, trend: "+9%" },
    { name: "Huawei Technologies", count: 47, trend: "+14%" },
    { name: "IBM", count: 63, trend: "+7%" },
    { name: "Microsoft", count: 51, trend: "+11%" },
    { name: "Google", count: 39, trend: "+21%" },
    { name: "Apple", count: 44, trend: "+16%" },
    { name: "Amazon", count: 29, trend: "+25%" },
    { name: "Meta", count: 31, trend: "+19%" },
    { name: "Intel", count: 37, trend: "+13%" },
  ];
  const assigneesPerPage = 5;
  const totalAssigneePages = Math.ceil(allAssignees.length / assigneesPerPage);
  const paginatedAssignees = allAssignees.slice(
    (assigneePage - 1) * assigneesPerPage,
    assigneePage * assigneesPerPage
  );

  const mockStatusDist = [
    { status: "Granted", count: 342, percentage: 45, color: "bg-green-500" },
    { status: "Pending", count: 256, percentage: 34, color: "bg-yellow-500" },
    { status: "Published", count: 98, percentage: 13, color: "bg-blue-500" },
    { status: "Expired", count: 62, percentage: 8, color: "bg-red-500" }
  ];

  // Summary card values
  const totalFilings = analyticsData?.totalPatents != null && analyticsData?.totalTrademarks != null
    ? analyticsData.totalPatents + analyticsData.totalTrademarks
    : 758;
  const activePatents = analyticsData?.totalPatents ?? 342;
  const pendingApplications = analyticsData?.totalTrademarks ?? 256;
  const jurisdictionsCount = 12;

  // Export function – downloads CSV of trends and top cited
  const exportReports = (type = "summary") => {
    let csv = "";
    if (type === "summary" || type === "full") {
      const trendsToExport = filteredTrends.length ? filteredTrends : mockTrends;
      const topToExport = topCited.length ? topCited : mockTopCited;

      csv += "Year,Patent Count,Trademark Count\n";
      trendsToExport.forEach(t => {
        csv += `${t.year},${t.patentCount},${t.trademarkCount}\n`;
      });
      csv += "\nTitle,Citation Count\n";
      topToExport.forEach(t => {
        const title = t.title.replace(/,/g, ' ');
        csv += `"${title}",${t.citationCount}\n`;
      });
    }
    if (type === "full") {
      // Add more sections (jurisdictions, assignees, etc.)
      csv += "\nJurisdiction,Count,Percentage\n";
      mockJurisdictions.forEach(j => {
        csv += `${j.country},${j.count},${j.percentage}%\n`;
      });
      csv += "\nAssignee,Filings,Trend\n";
      allAssignees.forEach(a => {
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
              Comprehensive IP intelligence and trend analysis
            </p>
          </div>

          <div className="flex gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="1m">Last Month</option>
              <option value="3m">Last 3 Months</option>
              <option value="6m">Last 6 Months</option>
              <option value="1y">Last Year</option>
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
            label="Total Patents"
            value={activePatents}
            sub="Active in database"
            icon={<Activity size={24} className="text-green-600" />}
            iconBg="bg-green-100"
          />
          <StatCard
            label="Total Trademarks"
            value={pendingApplications}
            sub="Active in database"
            icon={<BarChart3 size={24} className="text-yellow-600" />}
            iconBg="bg-yellow-100"
          />
          <StatCard
            label="Active Monitors"
            value={analyticsData?.activeMonitors ?? jurisdictionsCount}
            sub="Watching"
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
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">Top 10 Cited Patents</h3>
            {(topCited.length > 0 ? (
              <ResponsiveContainer width="100%" height={450}>
                <BarChart
                  data={topCited}
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
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151' }} />
                  <Bar dataKey="citationCount" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[450px] flex items-center justify-center text-gray-400 bg-gray-100 dark:bg-gray-700 rounded">
                No citation data available
              </div>
            ))}
          </div>

          {/* Row 1: Filing Trends + Technology Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Filing Trends Line Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">Filing Trends (by year)</h3>
              {filteredTrends.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={filteredTrends} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
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
                <div className="h-[300px] flex items-center justify-center text-gray-400 bg-gray-100 dark:bg-gray-700 rounded">
                  No trend data available
                </div>
              )}
            </div>

            {/* Technology Distribution Pie */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">Technology Distribution</h3>
              {pieTechData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieTechData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieTechData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-400 bg-gray-100 dark:bg-gray-700 rounded">
                  No technology data available
                </div>
              )}
            </div>
          </div>

          {/* Row 2: Family Distribution + Top Jurisdictions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Family Size Distribution Pie */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">Patent Family Sizes</h3>
              <p className="text-xs text-gray-500 mb-2">
                Shows how many patent families fall into each size range (members per family). Larger families indicate broader international protection.
              </p>
              {familyPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={familyPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {familyPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-gray-400 bg-gray-100 dark:bg-gray-700 rounded">
                  No family data available
                </div>
              )}
            </div>

            {/* Top Jurisdictions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">Top Jurisdictions</h3>
              <div className="space-y-4">
                {mockJurisdictions.map((j) => (
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
            </div>
          </div>

          {/* Row 3: Additional Insights (Assignees + Reports) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Assignees */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">Top Assignees</h3>
              <div className="space-y-4">
                {allAssignees.slice(0, 5).map((a) => (
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
            </div>

            {/* Recent Reports */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-6">
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
            </div>
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

// Helper stat card component
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

export default Analytics;