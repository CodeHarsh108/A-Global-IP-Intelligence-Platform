import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FileText, Shield, Globe, Calendar, Star,
  Download, Activity, ArrowLeft, ExternalLink, Lock,
  Loader2, AlertTriangle, Bell, BellOff, Plus, Clock
} from "lucide-react";
import DashboardLayout from "../components/layouts/DashboardLayout";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080/api";

const getAuthHeader = () => {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const IPDetailPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const type = searchParams.get("type") || "patent"; // "patent" or "trademark"

  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookmarked, setBookmarked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [subLoading, setSubLoading] = useState(false);

  // Filing tracker state
  const [filings, setFilings] = useState([]);
  const [loadingFilings, setLoadingFilings] = useState(false);
  const [showAddFilingModal, setShowAddFilingModal] = useState(false);
  const [newFiling, setNewFiling] = useState({ status: "", description: "", date: "" });
  const [submittingFiling, setSubmittingFiling] = useState(false);
  const { user, hasRole } = useAuth();

  // Fetch filings when tab becomes active
  const fetchFilings = async () => {
    if (!id) return;
    setLoadingFilings(true);
    try {
      const assetType = type === "patent" ? "PATENT" : "TRADEMARK";
      const response = await axios.get(
        `${API_BASE_URL}/ip/filings/${assetType}/${id}`,
        { headers: getAuthHeader() }
      );
      setFilings(response.data);
    } catch (err) {
      console.error("Failed to fetch filings:", err);
    } finally {
      setLoadingFilings(false);
    }
  };

  useEffect(() => {
    if (activeTab === "filings") {
      fetchFilings();
    }
  }, [activeTab]);

  // Check if asset is saved (bookmarked)
  useEffect(() => {
    const checkSaved = async () => {
      if (!id) return;
      try {
        const assetType = type === "patent" ? "PATENT" : "TRADEMARK";
        const response = await axios.get(
          `${API_BASE_URL}/ip/assets/saved/${assetType}/${id}`,
          { headers: getAuthHeader() }
        );
        setBookmarked(response.data.saved);
      } catch (err) {
        console.error("Failed to check saved status:", err);
      }
    };
    if (!loading && data) {
      checkSaved();
    }
  }, [loading, data, id, type]);

  const handleAddFiling = async (e) => {
    e.preventDefault();
    setSubmittingFiling(true);
    try {
      const assetType = type === "patent" ? "PATENT" : "TRADEMARK";
      await axios.post(
        `${API_BASE_URL}/ip/filings`,
        {
          assetType,
          assetId: id,
          status: newFiling.status,
          description: newFiling.description,
          date: newFiling.date || null,
        },
        { headers: getAuthHeader() }
      );
      setShowAddFilingModal(false);
      setNewFiling({ status: "", description: "", date: "" });
      fetchFilings(); // refresh list
    } catch (err) {
      console.error("Failed to add filing:", err);
      alert("Error adding filing. Check console.");
    } finally {
      setSubmittingFiling(false);
    }
  };

  // Fetch asset details
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const endpoint = type === "patent" ? "patents" : "trademarks";
        const response = await axios.get(
          `${API_BASE_URL}/ip/${endpoint}/${id}`,
          { headers: getAuthHeader() }
        );
        setData(response.data);
      } catch (err) {
        console.error("Failed to fetch IP detail:", err);
        setError(
          err.response?.status === 404
            ? `No ${type} found with ID: ${id}`
            : "Failed to load details. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, type]);

  // Fetch subscription status
  useEffect(() => {
    const checkSubscription = async () => {
      if (!id) return;
      try {
        const assetType = type === "patent" ? "PATENT" : "TRADEMARK";
        const response = await axios.get(
          `${API_BASE_URL}/ip/subscriptions/${assetType}/${id}`,
          { headers: getAuthHeader() }
        );
        setSubscribed(response.data.subscribed);
      } catch (err) {
        console.error("Failed to check subscription:", err);
      }
    };
    if (!loading && data) {
      checkSubscription();
    }
  }, [loading, data, id, type]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleExport = () => {
    if (!data) return;

    let csvContent = "data:text/csv;charset=utf-8,";
    const rows = [];

    if (type === "patent") {
      rows.push(["Field", "Value"]);
      rows.push(["Title", data.title]);
      rows.push(["Asset Number", data.assetNumber || data.applicationNumber]);
      rows.push(["Jurisdiction", data.jurisdiction]);
      rows.push(["Status", data.status]);
      rows.push(["Assignee", data.assignee]);
      rows.push(["Inventors", data.inventors]);
      rows.push(["Filing Date", data.filingDate]);
      rows.push(["Publication Date", data.publicationDate]);
      rows.push(["Grant Date", data.grantDate]);
      rows.push(["Abstract", `"${data.abstractText?.replace(/"/g, '""')}"`]);
    } else {
      rows.push(["Field", "Value"]);
      rows.push(["Mark", data.mark || data.title]);
      rows.push(["Application Number", data.applicationNumber]);
      rows.push(["Registration Number", data.registrationNumber]);
      rows.push(["Jurisdiction", data.jurisdiction]);
      rows.push(["Status", data.status]);
      rows.push(["Owner", data.assignee]);
      rows.push(["Mark Type", data.markType]);
      rows.push(["Filing Date", data.filingDate]);
      rows.push(["Goods & Services", `"${data.goodsServices?.replace(/"/g, '""')}"`]);
    }

    rows.forEach(row => {
      csvContent += row.join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${type}_details_${data.assetNumber || data.applicationNumber || id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const assetType = type === "patent" ? "PATENT" : "TRADEMARK";
      if (bookmarked) {
        await axios.delete(`${API_BASE_URL}/ip/assets/save/${assetType}/${id}`, {
          headers: getAuthHeader()
        });
        setBookmarked(false);
      } else {
        await axios.post(`${API_BASE_URL}/ip/assets/save`,
          { type: assetType, assetId: id },
          { headers: getAuthHeader() }
        );
        setBookmarked(true);
      }
    } catch (err) {
       console.error("Failed to save/unsave asset:", err);
  const msg = err.response?.data?.error || err.message || "Could not update saved status";
  alert(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setSaving(false);
    }
  };

  const handleSubscribe = async () => {
    setSubLoading(true);
    try {
      const assetType = type === "patent" ? "PATENT" : "TRADEMARK";
      if (subscribed) {
        await axios.delete(`${API_BASE_URL}/ip/subscriptions/${assetType}/${id}`, {
          headers: getAuthHeader()
        });
        setSubscribed(false);
      } else {
        await axios.post(
          `${API_BASE_URL}/ip/subscriptions`,
          { type: assetType, assetId: id },
          { headers: getAuthHeader() }
        );
        setSubscribed(true);
      }
    } catch (err) {
       console.error("Failed to save/unsave asset:", err);
  const msg = err.response?.data?.error || err.message || "Could not update saved status";
  alert(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setSubLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <Loader2 size={40} className="animate-spin text-blue-600" />
          <p className="text-slate-500 font-mono text-sm animate-pulse">
            FETCHING GLOBAL DOSSIER...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
          <AlertTriangle size={40} className="text-amber-500" />
          <p className="text-lg font-semibold text-gray-800 dark:text-white">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium"
          >
            <ArrowLeft size={16} /> Go Back
          </button>
        </div>
      </DashboardLayout>
    );
  }

  // ------- PATENT VIEW -------
  if (type === "patent") {
    const inventors = data.inventors
      ? data.inventors.split(",").map((s) => s.trim())
      : [];
    const ipcClasses = data.ipcClasses
      ? data.ipcClasses.split(",").map((s) => s.trim())
      : [];
    const claims = data.claims
      ? data.claims.split(/\d+\.\s+/).filter(Boolean)
      : [];

    return (
      <DashboardLayout>
        <div className="max-w-[1600px] mx-auto space-y-6 pb-12 text-slate-300 p-4">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft size={16} /> Back to Search
          </button>

          {/* HERO */}
          <header className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Shield size={150} />
            </div>
            <div className="relative z-10 flex justify-between items-start flex-wrap gap-4">
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest">
                    {data.status || "Unknown"}
                  </span>
                  <span className="text-slate-500 text-sm font-mono">
                    {data.assetNumber || data.applicationNumber || `ID: ${data.id}`}
                  </span>
                  {data.jurisdiction && (
                    <span className="flex items-center gap-1 text-slate-400 text-xs">
                      <Globe size={12} /> {data.jurisdiction}
                    </span>
                  )}
                </div>
                <h1 className="text-3xl font-extrabold text-white leading-tight max-w-4xl tracking-tight">
                  {data.title}
                </h1>
                {data.assignee && (
                  <p className="text-blue-400 font-semibold">
                    Assignee: {data.assignee}
                    {data.assigneeCountry ? ` (${data.assigneeCountry})` : ""}
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSubscribe}
                  disabled={subLoading}
                  className={`p-3 rounded-xl transition-all flex items-center gap-2 ${
                    subscribed
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30"
                      : "bg-slate-800 border border-slate-700 hover:border-slate-500 text-slate-300"
                  }`}
                  title={subscribed ? "Unsubscribe from alerts" : "Subscribe to alerts"}
                >
                  {subLoading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : subscribed ? (
                    <Bell size={20} className="fill-amber-400 text-amber-400" />
                  ) : (
                    <BellOff size={20} />
                  )}
                  <span className="text-xs font-medium hidden md:inline">
                    {subscribed ? "Subscribed" : "Subscribe"}
                  </span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="p-3 bg-slate-800 border border-slate-700 rounded-xl hover:border-slate-500 transition-all"
                >
                  {saving ? (
                    <Loader2 size={20} className="animate-spin text-slate-400" />
                  ) : (
                    <Star
                      size={20}
                      className={bookmarked ? "fill-amber-400 text-amber-400" : "text-slate-400"}
                    />
                  )}
                </button>
                <button
                  onClick={handleExport}
                  className="flex items-center gap-3 bg-white text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-all"
                >
                  <Download size={18} /> Export Data
                </button>
              </div>
            </div>
          </header>

          {/* METRICS GRID */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <MetricCard label="Citations" value={data.citationCount ?? "—"} sub="Forward Links" color="text-blue-400" />
            <MetricCard label="Claims" value={data.claimCount ?? (claims.length || "—")} sub="Total Claims" color="text-purple-400" />
            <MetricCard label="Drawings" value={data.drawingCount ?? "—"} sub="Figures" color="text-emerald-400" />
            <MetricCard label="Type" value={data.patentType || "Patent"} sub="Patent Type" color="text-amber-400" />
            <MetricCard label="IPC Classes" value={ipcClasses.length || "—"} sub="Classifications" color="text-pink-400" />
          </div>

          <div className="grid grid-cols-12 gap-6">
            {/* MAIN CONTENT */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
                <nav className="flex bg-slate-900/50 border-b border-slate-800 px-4 flex-wrap">
                  {["overview", "claims", "legal info", "filings"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-6 py-5 text-[10px] font-black uppercase tracking-widest transition-all relative ${
                        activeTab === tab ? "text-blue-500" : "text-slate-500 hover:text-slate-200"
                      }`}
                    >
                      {tab}
                      {activeTab === tab && (
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-500" />
                      )}
                    </button>
                  ))}
                </nav>

                <div className="p-8 min-h-[350px]">
                  {activeTab === "overview" && (
                    <div className="space-y-8 animate-in fade-in">
                      {data.abstractText && (
                        <section>
                          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                            <div className="w-1 h-5 bg-blue-500" /> Abstract
                          </h3>
                          <p className="text-slate-400 leading-relaxed italic p-6 bg-slate-800/20 rounded-2xl border border-slate-800/50">
                            "{data.abstractText}"
                          </p>
                        </section>
                      )}
                      {data.description && !data.abstractText && (
                        <section>
                          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                            <div className="w-1 h-5 bg-blue-500" /> Description
                          </h3>
                          <p className="text-slate-400 leading-relaxed italic p-6 bg-slate-800/20 rounded-2xl border border-slate-800/50">
                            "{data.description}"
                          </p>
                        </section>
                      )}
                      <section className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        {ipcClasses.length > 0 && (
                          <div className="space-y-3">
                            <h4 className="text-slate-500 text-xs font-bold uppercase tracking-wider">
                              IPC Classifications
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {ipcClasses.map((c) => (
                                <span
                                  key={c}
                                  className="bg-slate-950 px-3 py-1.5 rounded-lg text-xs font-mono text-blue-400 border border-slate-800"
                                >
                                  {c}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {inventors.length > 0 && (
                          <div className="space-y-3">
                            <h4 className="text-slate-500 text-xs font-bold uppercase tracking-wider">
                              Inventors
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {inventors.map((inv) => (
                                <span
                                  key={inv}
                                  className="bg-slate-800 px-3 py-1.5 rounded-lg text-xs text-slate-300 border border-slate-700"
                                >
                                  {inv}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {data.technology && (
                          <div className="space-y-3">
                            <h4 className="text-slate-500 text-xs font-bold uppercase tracking-wider">
                              Technology Domain
                            </h4>
                            <span className="inline-block bg-indigo-500/10 text-indigo-400 px-3 py-1.5 rounded-lg text-xs border border-indigo-500/20">
                              {data.technology}
                            </span>
                          </div>
                        )}
                      </section>
                    </div>
                  )}

                  {activeTab === "claims" && (
                    <div className="space-y-4 animate-in fade-in">
                      {claims.length > 0 ? (
                        claims.map((claim, i) => (
                          <div
                            key={i}
                            className="p-5 bg-slate-950/50 border border-slate-800 rounded-2xl hover:bg-slate-900 transition-all"
                          >
                            <p className="text-slate-300 text-sm leading-relaxed">
                              <span className="text-blue-500 font-black mr-4 text-xs italic">
                                CLAIM_{i + 1}
                              </span>
                              {claim}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-500 italic">No claims data available.</p>
                      )}
                    </div>
                  )}

                  {activeTab === "legal info" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in fade-in">
                      {[
                        { label: "Filing Date", value: formatDate(data.filingDate) },
                        { label: "Publication Date", value: formatDate(data.publicationDate) },
                        { label: "Grant Date", value: formatDate(data.grantDate) },
                        { label: "Next Fee Date", value: formatDate(data.nextFeeDate) },
                        { label: "Legal Status", value: data.legalStatus },
                        { label: "Annual Fee Paid", value: data.annualFeePaid != null ? (data.annualFeePaid ? "Yes" : "No") : null },
                        { label: "Application Number", value: data.applicationNumber },
                        { label: "Examiner", value: data.examiner },
                      ]
                        .filter((f) => f.value && f.value !== "N/A")
                        .map((f) => (
                          <div key={f.label} className="bg-slate-800/30 border border-slate-800 rounded-xl p-4">
                            <p className="text-xs font-bold uppercase text-slate-500 mb-1">
                              {f.label}
                            </p>
                            <p className="text-white font-medium">{f.value}</p>
                          </div>
                        ))}
                    </div>
                  )}

                  {/* FILINGS TAB CONTENT */}
                  {activeTab === "filings" && (
                    <div className="space-y-4 animate-in fade-in">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white font-bold flex items-center gap-2">
                          <Calendar size={16} className="text-blue-500" /> Filing Timeline
                        </h3>
                        {(hasRole('ANALYST') || hasRole('ADMIN')) && (
                          <button
                            onClick={() => setShowAddFilingModal(true)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600/20 border border-blue-500/30 rounded-lg text-blue-400 text-xs font-semibold hover:bg-blue-600/30 transition"
                          >
                            <Plus size={14} /> Add Filing
                          </button>
                        )}
                      </div>

                      {loadingFilings ? (
                        <div className="flex justify-center py-8">
                          <Loader2 size={24} className="animate-spin text-blue-500" />
                        </div>
                      ) : filings.length === 0 ? (
                        <p className="text-slate-500 italic py-8 text-center">
                          No filings recorded for this asset.
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {filings.map((filing, idx) => (
                            <div key={filing.id || idx} className="relative pl-6 pb-4 border-l-2 border-slate-700 last:pb-0">
                              <div className="absolute left-[-5px] top-0 w-2 h-2 rounded-full bg-blue-500" />
                              <div className="flex items-start gap-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                                      {filing.status}
                                    </span>
                                    <span className="text-xs text-slate-500 flex items-center gap-1">
                                      <Clock size={10} /> {new Date(filing.date).toLocaleString()}
                                    </span>
                                  </div>
                                  {filing.description && (
                                    <p className="text-sm text-slate-400">{filing.description}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* SIDEBAR */}
            <aside className="col-span-12 lg:col-span-4 space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <h3 className="text-white font-bold mb-4 flex items-center justify-between text-sm">
                  Key Details <Activity size={14} />
                </h3>
                <div className="space-y-3">
                  {data.jurisdiction && (
                    <InfoRow label="Jurisdiction" value={data.jurisdiction} />
                  )}
                  {data.assetNumber && (
                    <InfoRow label="Asset Number" value={data.assetNumber} mono />
                  )}
                  {data.cpcClasses && (
                    <InfoRow label="CPC Classes" value={data.cpcClasses} mono />
                  )}
                  {data.citedPatents && (
                    <InfoRow label="Cited Patents" value={data.citedPatents} />
                  )}
                  <InfoRow
                    label="Core Patent"
                    value={data.isCorePatent != null ? (data.isCorePatent ? "Yes ⭐" : "No") : "—"}
                  />
                </div>
              </div>

              {data.isCorePatent && (
                <div className="bg-gradient-to-br from-blue-600/20 to-slate-900 border border-blue-500/30 rounded-2xl p-6 shadow-xl">
                  <h3 className="text-blue-400 font-black text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Shield size={14} /> Strategic Intelligence
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    This is a core patent in its portfolio. High strategic value — recommended for deeper analysis.
                  </p>
                  <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-blue-500 w-4/5" />
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-500">
                    <span>PORTFOLIO STRENGTH</span>
                    <span>80/100</span>
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>

        {/* Add Filing Modal */}
        {showAddFilingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl w-full max-w-md shadow-2xl">
              <form onSubmit={handleAddFiling}>
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Add New Filing</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newFiling.status}
                      onChange={(e) => setNewFiling({ ...newFiling, status: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. Application, Granted, Renewal, Expiry"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      value={newFiling.description}
                      onChange={(e) => setNewFiling({ ...newFiling, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="Optional details"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Date (optional, defaults to now)
                    </label>
                    <input
                      type="datetime-local"
                      value={newFiling.date}
                      onChange={(e) => setNewFiling({ ...newFiling, date: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddFilingModal(false)}
                    className="px-4 py-2 border border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 rounded-lg text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingFiling}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm flex items-center gap-2"
                  >
                    {submittingFiling ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                    Add Filing
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </DashboardLayout>
    );
  }

  // ------- TRADEMARK VIEW -------
  const niceClassList = data.niceClasses
    ? data.niceClasses.split(",").map((s) => s.trim())
    : [];

  return (
    <DashboardLayout>
      <div className="max-w-[1200px] mx-auto space-y-6 pb-12 text-slate-300 p-4">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft size={16} /> Back to Search
        </button>

        {/* HERO */}
        <header className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 flex justify-between items-start flex-wrap gap-4">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest">
                  Trademark
                </span>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest">
                  {data.status || "Unknown"}
                </span>
                {data.jurisdiction && (
                  <span className="flex items-center gap-1 text-slate-400 text-xs">
                    <Globe size={12} /> {data.jurisdiction}
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-extrabold text-white">{data.mark || data.title}</h1>
              {data.assignee && (
                <p className="text-blue-400 font-semibold">Owner: {data.assignee}</p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSubscribe}
                disabled={subLoading}
                className={`p-3 rounded-xl transition-all flex items-center gap-2 ${
                  subscribed
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30"
                    : "bg-slate-800 border border-slate-700 hover:border-slate-500 text-slate-300"
                }`}
                title={subscribed ? "Unsubscribe from alerts" : "Subscribe to alerts"}
              >
                {subLoading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : subscribed ? (
                  <Bell size={20} className="fill-amber-400 text-amber-400" />
                ) : (
                  <BellOff size={20} />
                )}
                <span className="text-xs font-medium hidden md:inline">
                  {subscribed ? "Subscribed" : "Subscribe"}
                </span>
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="p-3 bg-slate-800 border border-slate-700 rounded-xl hover:border-slate-500 transition-all"
              >
                {saving ? (
                  <Loader2 size={20} className="animate-spin text-slate-400" />
                ) : (
                  <Star
                    size={20}
                    className={bookmarked ? "fill-amber-400 text-amber-400" : "text-slate-400"}
                  />
                )}
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-3 bg-white text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-all"
              >
                <Download size={18} /> Export Data
              </button>
            </div>
          </div>
        </header>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-white font-bold text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
              <FileText size={14} /> Trademark Details
            </h2>
            {data.applicationNumber && <InfoRow label="Application Number" value={data.applicationNumber} mono />}
            {data.registrationNumber && <InfoRow label="Registration Number" value={data.registrationNumber} mono />}
            {data.markType && <InfoRow label="Mark Type" value={data.markType} />}
            {data.colorClaim && <InfoRow label="Color Claim" value={data.colorClaim} />}
            <InfoRow label="Is Logo" value={data.isLogo != null ? (data.isLogo ? "Yes" : "No") : "—"} />
            <InfoRow label="Filing Date" value={formatDate(data.filingDate)} />
            <InfoRow label="Renewal Date" value={data.renewalDate ? formatDate(data.renewalDate) : "N/A"} />
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-white font-bold text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
              <Activity size={14} /> Goods & Services
            </h2>
            {data.goodsServices ? (
              <p className="text-slate-400 text-sm leading-relaxed">{data.goodsServices}</p>
            ) : (
              <p className="text-slate-600 italic text-sm">No goods & services information.</p>
            )}
            {niceClassList.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase text-slate-500 mb-2">Nice Classes</p>
                <div className="flex flex-wrap gap-2">
                  {niceClassList.map((nc) => (
                    <span
                      key={nc}
                      className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-1 rounded-lg text-xs font-mono"
                    >
                      Class {nc}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Add Filing Modal for trademark (same as patent) */}
        {showAddFilingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl w-full max-w-md shadow-2xl">
              <form onSubmit={handleAddFiling}>
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Add New Filing</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newFiling.status}
                      onChange={(e) => setNewFiling({ ...newFiling, status: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. Application, Granted, Renewal, Expiry"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      value={newFiling.description}
                      onChange={(e) => setNewFiling({ ...newFiling, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="Optional details"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Date (optional, defaults to now)
                    </label>
                    <input
                      type="datetime-local"
                      value={newFiling.date}
                      onChange={(e) => setNewFiling({ ...newFiling, date: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddFilingModal(false)}
                    className="px-4 py-2 border border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 rounded-lg text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingFiling}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm flex items-center gap-2"
                  >
                    {submittingFiling ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                    Add Filing
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

// ---- Helper Sub-Components ----
const MetricCard = ({ label, value, sub, color }) => (
  <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg border-b-4 border-b-slate-800 hover:border-b-blue-500 transition-all">
    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
    <h3 className={`text-2xl font-black ${color}`}>{value}</h3>
    <p className="text-[9px] text-slate-600 mt-1 font-bold italic">{sub}</p>
  </div>
);

const InfoRow = ({ label, value, mono }) => (
  <div className="flex justify-between items-start gap-4 py-2 border-b border-slate-800/50 last:border-0">
    <span className="text-xs text-slate-500 font-bold uppercase tracking-wide flex-shrink-0">{label}</span>
    <span className={`text-sm text-slate-300 text-right ${mono ? "font-mono" : ""}`}>{value || "—"}</span>
  </div>
);

export default IPDetailPage;