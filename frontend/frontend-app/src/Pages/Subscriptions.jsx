import React, { useState, useEffect } from "react";
import axios from "axios";
import DashboardLayout from "../components/layouts/DashboardLayout";
import { Bell, BellOff, Loader2, ExternalLink, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080/api";
const getAuthHeader = () => {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const Subscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [unsubscribingId, setUnsubscribingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/ip/subscriptions`, {
        headers: getAuthHeader()
      });
      console.log("Subscriptions response:", response.data);
      setSubscriptions(response.data);
    } catch (err) {
      console.error("Failed to fetch subscriptions:", err);
      setError("Could not load your subscriptions.");
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async (type, assetId) => {
    setUnsubscribingId(`${type}-${assetId}`);
    try {
      await axios.delete(`${API_BASE_URL}/ip/subscriptions/${type}/${assetId}`, {
        headers: getAuthHeader()
      });
      // Remove from list
      setSubscriptions(prev => prev.filter(sub => !(sub.assetType === type && sub.assetId === assetId)));
    } catch (err) {
      console.error("Unsubscribe failed:", err);
      alert("Failed to unsubscribe. Please try again.");
    } finally {
      setUnsubscribingId(null);
    }
  };

  const goToDetails = (type, id) => {
    const assetType = type === "PATENT" ? "patent" : "trademark";
    navigate(`/ip/${id}?type=${assetType}`);
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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Subscriptions</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            You will receive alerts for status changes on these IP assets.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl p-4 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {subscriptions.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-12 text-center">
            <BellOff size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">You are not subscribed to any IP assets.</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
              Go to a patent or trademark detail page and click the bell icon to subscribe.
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {subscriptions.map((sub) => (
                <li key={sub.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          sub.assetType === "PATENT"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400"
                            : "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400"
                        }`}>
                          {sub.assetType}
                        </span>
                        <span className="text-xs text-gray-400 font-mono">{sub.assetNumber}</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{sub.title}</p>
                      <div className="flex gap-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                        <span>Jurisdiction: {sub.jurisdiction || "—"}</span>
                        <span>Status: {sub.status || "—"}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => goToDetails(sub.assetType, sub.assetId)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg"
                        title="View details"
                      >
                        <ExternalLink size={18} />
                      </button>
                      <button
                        onClick={() => handleUnsubscribe(sub.assetType, sub.assetId)}
                        disabled={unsubscribingId === `${sub.assetType}-${sub.assetId}`}
                        className="p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-lg disabled:opacity-50"
                        title="Unsubscribe"
                      >
                        {unsubscribingId === `${sub.assetType}-${sub.assetId}` ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <BellOff size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Subscriptions;