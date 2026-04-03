import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import {
    Search,
    Globe,
    Tag,
    ExternalLink,
    Calendar,
    User,
    CheckCircle,
    Loader2,
    Database,
    SearchX,
    Filter,
    ChevronDown,
    ChevronUp,
} from "lucide-react";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080/api";


const getAuthHeader = () => {
    const token = localStorage.getItem("accessToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const SearchPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { hasRole } = useAuth();
    const canUseAdvancedFilters = hasRole('ANALYST') || hasRole('ADMIN');
    const [query, setQuery] = useState("");
    const [type, setType] = useState("PATENT"); // PATENT | TRADEMARK

    // Filters
    const [jurisdiction, setJurisdiction] = useState("");
    const [status, setStatus] = useState("");
    const [yearFrom, setYearFrom] = useState("");
    const [yearTo, setYearTo] = useState("");
    const [niceClass, setNiceClass] = useState("");
    const [showFilters, setShowFilters] = useState(false);

    // Pagination
    const [page, setPage] = useState(0);
    const [pageSize] = useState(10);

    // Results
    const [results, setResults] = useState([]);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [error, setError] = useState("");

    // Dropdown options
    const [jurisdictions, setJurisdictions] = useState([]);
    const [statuses, setStatuses] = useState([]);

    // Load filter options when type changes
    useEffect(() => {
        const endpoint = type === "PATENT" ? "patents" : "trademarks";
        const headers = getAuthHeader();

        Promise.allSettled([
            axios.get(`${API_BASE_URL}/ip/${endpoint}/jurisdictions`, { headers }),
            axios.get(`${API_BASE_URL}/ip/${endpoint}/statuses`, { headers }),
        ]).then(([jRes, sRes]) => {
            if (jRes.status === "fulfilled") setJurisdictions(jRes.value.data);
            if (sRes.status === "fulfilled") setStatuses(sRes.value.data);
        });
    }, [type]);


    const handleSearch = useCallback(
        async (overridePage = 0) => {
            setLoading(true);
            setHasSearched(true);
            setError("");

            try {
                const headers = getAuthHeader();
                let response;

                if (type === "PATENT") {
                    const requestBody = {
                        query: query.trim(),
                        jurisdiction: jurisdiction || undefined,
                        status: status || undefined,
                        yearFrom: yearFrom ? parseInt(yearFrom) : undefined,
                        yearTo: yearTo ? parseInt(yearTo) : undefined,
                    };
                    response = await axios.post(
                        `${API_BASE_URL}/ip/patents/search?page=${overridePage}&size=${pageSize}&sortBy=filingDate&sortOrder=desc`,
                        requestBody,
                        { headers }
                    );
                } else {
                    const requestBody = {
                        query: query.trim(),
                        jurisdiction: jurisdiction || undefined,
                        status: status || undefined,
                        yearFrom: yearFrom ? parseInt(yearFrom) : undefined,
                        yearTo: yearTo ? parseInt(yearTo) : undefined,
                        niceClass: niceClass || undefined,
                    };
                    response = await axios.post(
                        `${API_BASE_URL}/ip/trademarks/search?page=${overridePage}&size=${pageSize}&sortBy=filingDate&sortOrder=desc`,
                        requestBody,
                        { headers }
                    );
                }

                const data = response.data;
                const items =
                    type === "PATENT"
                        ? data.patents ?? data.content ?? []
                        : data.trademarks ?? data.content ?? [];

                setResults(Array.isArray(data) ? data : items);
                setTotalElements(data.totalElements || (Array.isArray(data) ? data.length : items.length));
                setTotalPages(data.totalPages || 1);
                setPage(overridePage);
            } catch (err) {
                console.error("Search failed:", err);
                setError(
                    err.response?.data?.error ||
                    "Search failed. Please ensure the backend is running."
                );
                setResults([]);
            } finally {
                setLoading(false);
            }
        },
        [query, type, jurisdiction, status, yearFrom, yearTo, niceClass, pageSize]
    );

    // Initial load and URL param handling
    useEffect(() => {
        const q = searchParams.get("q");
        if (q !== null) {
            setQuery(q.trim());
        }
        handleSearch(0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]); // Only run when URL params change

    const handleSubmit = (e) => {
        e.preventDefault();
        handleSearch(0);
    };

    const handlePageChange = (newPage) => {
        handleSearch(newPage);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleResultClick = (item) => {
        const idParam = item.id;
        const typeParam = type.toLowerCase();
        navigate(`/ip/${idParam}?type=${typeParam}`);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "N/A";
        return new Date(dateStr).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-gray-950 transition-colors duration-300">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[40rem] h-[40rem] rounded-full bg-blue-400/5 blur-[100px] animate-pulse" />
                <div
                    className="absolute bottom-[5%] left-[-10%] w-[35rem] h-[35rem] rounded-full bg-indigo-500/5 blur-[100px] animate-pulse"
                    style={{ animationDelay: "2s" }}
                />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
                        Global IP{" "}
                        <span className="text-blue-600">Intelligence</span> Hub
                    </h1>
                    <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                        Search patents and trademarks across global IP databases.
                    </p>
                </div>

                <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl p-6 md:p-8 mb-8 transition-all">
                    <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search
                                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                                size={20}
                            />
                            <input
                                type="text"
                                placeholder={canUseAdvancedFilters ? "Search by keyword, application number, or applicant..." : "Search by keyword"}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all dark:text-white text-lg"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/20 transform active:scale-95 transition-all flex items-center justify-center gap-2 min-w-[140px]"
                        >
                            {loading ? <Loader2 className="animate-spin" size={24} /> : "Search Now"}
                        </button>
                    </form>

                    <div className="flex flex-wrap items-center gap-6 mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Tag size={14} /> Type:
                            </span>
                            <div className="flex gap-2">
                                {["PATENT", "TRADEMARK"].map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => {
                                            setType(t);
                                            setJurisdiction("");
                                            setStatus("");
                                            setNiceClass("");
                                        }}
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${type === t
                                            ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                                            : "bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"
                                            }`}
                                    >
                                        {t.charAt(0) + t.slice(1).toLowerCase()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {canUseAdvancedFilters && (
                            <button
                                type="button"
                                onClick={() => setShowFilters((v) => !v)}
                                className="ml-auto flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-blue-600 transition-colors px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 hover:border-blue-400"
                            >
                                <Filter size={14} /> Advanced Filters
                                {showFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                        )}
                    </div>

                    {canUseAdvancedFilters && showFilters && (
                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">
                                    <Globe size={12} className="inline mr-1" /> Jurisdiction
                                </label>
                                <select
                                    value={jurisdiction}
                                    onChange={(e) => setJurisdiction(e.target.value)}
                                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none dark:text-white"
                                >
                                    <option value="">All Jurisdictions</option>
                                    {jurisdictions.map((j) => (
                                        <option key={j} value={j}>{j}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">
                                    <CheckCircle size={12} className="inline mr-1" /> Status
                                </label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none dark:text-white"
                                >
                                    <option value="">All Statuses</option>
                                    {statuses.map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">
                                    <Calendar size={12} className="inline mr-1" /> Year From
                                </label>
                                <input
                                    type="number"
                                    placeholder="e.g. 2018"
                                    value={yearFrom}
                                    onChange={(e) => setYearFrom(e.target.value)}
                                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none dark:text-white"
                                    min="1900"
                                    max="2030"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">
                                    <Calendar size={12} className="inline mr-1" /> Year To
                                </label>
                                <input
                                    type="number"
                                    placeholder="e.g. 2024"
                                    value={yearTo}
                                    onChange={(e) => setYearTo(e.target.value)}
                                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none dark:text-white"
                                    min="1900"
                                    max="2030"
                                />
                            </div>

                            {type === "TRADEMARK" && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">
                                        Nice Class
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 9, 42"
                                        value={niceClass}
                                        onChange={(e) => setNiceClass(e.target.value)}
                                        className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none dark:text-white"
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {error && (
                    <div className="mb-6 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-red-600 dark:text-red-400 text-sm font-medium">
                        {error}
                    </div>
                )}

                <div className="space-y-6">
                    {loading ? (
                        <div className="py-20 text-center">
                            <div className="inline-block p-4 rounded-full bg-blue-50 dark:bg-blue-900/20 mb-4">
                                <Database className="text-blue-600 animate-bounce" size={48} />
                            </div>
                            <p className="text-xl font-medium text-gray-600 dark:text-gray-400">
                                Scanning global databases...
                            </p>
                        </div>
                    ) : results.length > 0 ? (
                        <>
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Showing{" "}
                                    <span className="font-bold text-gray-700 dark:text-gray-200">
                                        {results.length}
                                    </span>{" "}
                                    of{" "}
                                    <span className="font-bold text-gray-700 dark:text-gray-200">
                                        {totalElements}
                                    </span>{" "}
                                    results
                                </p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                {results.map((item) => (
                                    <div
                                        key={item.id}
                                        onClick={() => handleResultClick(item)}
                                        className="group relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 hover:shadow-2xl transition-all hover:border-blue-500/30 overflow-hidden cursor-pointer"
                                    >
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />

                                        <div className="flex justify-between items-start mb-4 relative z-10">
                                            <span
                                                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${type === "PATENT"
                                                    ? "bg-blue-500/10 text-blue-600"
                                                    : "bg-purple-500/10 text-purple-600"
                                                    }`}
                                            >
                                                {type === "PATENT" ? "Patent" : "Trademark"}
                                            </span>
                                            <span className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                                                <Globe size={14} /> {item.jurisdiction || "Global"}
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                                            {type === "PATENT" ? item.title : (item.mark || item.title)}
                                        </h3>

                                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-5">
                                            {item.description ||
                                                (type === "TRADEMARK" ? item.goodsServices : item.abstractText) ||
                                                "No description available"}
                                        </p>

                                        <div className="grid grid-cols-2 gap-3 mb-5">
                                            <div className="space-y-1">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                                    {type === "PATENT" ? "Application No." : "Reg. Number"}
                                                </span>
                                                <p className="text-xs font-mono font-bold dark:text-gray-300 text-gray-700 truncate">
                                                    {item.applicationNumber || item.registrationNumber || "N/A"}
                                                </p>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                                    {type === "PATENT" ? "Assignee" : "Owner"}
                                                </span>
                                                <p className="text-xs font-bold dark:text-gray-300 text-gray-700 flex items-center gap-1.5 truncate">
                                                    <User size={12} /> {item.assignee || "N/A"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-800 relative z-10">
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-1 text-xs text-gray-400 uppercase font-bold tracking-tighter">
                                                    <Calendar size={14} />{" "}
                                                    {formatDate(item.filingDate)}
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-emerald-500 uppercase font-bold tracking-tighter">
                                                    <CheckCircle size={14} /> {item.status || "Unknown"}
                                                </div>
                                            </div>
                                            <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:rotate-12">
                                                <ExternalLink size={20} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {totalPages > 1 && (
                                <div className="flex justify-center gap-2 mt-8">
                                    <button
                                        onClick={() => handlePageChange(page - 1)}
                                        disabled={page === 0}
                                        className="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-bold disabled:opacity-40 hover:border-blue-500 transition-all"
                                    >
                                        ← Prev
                                    </button>
                                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                                        const p = i;
                                        return (
                                            <button
                                                key={p}
                                                onClick={() => handlePageChange(p)}
                                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${p === page
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-500"
                                                    }`}
                                            >
                                                {p + 1}
                                            </button>
                                        );
                                    })}
                                    <button
                                        onClick={() => handlePageChange(page + 1)}
                                        disabled={page >= totalPages - 1}
                                        className="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-bold disabled:opacity-40 hover:border-blue-500 transition-all"
                                    >
                                        Next →
                                    </button>
                                </div>
                            )}
                        </>
                    ) : hasSearched ? (
                        <div className="py-20 text-center bg-white dark:bg-gray-900 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                            <div className="inline-block p-4 rounded-full bg-rose-50 dark:bg-rose-900/20 mb-4">
                                <SearchX className="text-rose-600" size={48} />
                            </div>
                            <h3 className="text-xl font-bold dark:text-white text-gray-900">
                                No matches found
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mt-2">
                                Try adjusting your keywords or using broader filters.
                            </p>
                        </div>
                    ) : (
                        <div className="py-20 text-center">
                            <div className="p-8 max-w-lg mx-auto bg-blue-600/5 rounded-[3rem] border border-blue-600/10">
                                <Database className="text-blue-600 h-16 w-16 mx-auto mb-6 opacity-20" />
                                <h3 className="text-2xl font-bold dark:text-white text-gray-900 mb-2">
                                    Ready to explore?
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Enter a patent title, company name, or trademark to begin your
                                    intelligence gathering across global databases.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchPage;
