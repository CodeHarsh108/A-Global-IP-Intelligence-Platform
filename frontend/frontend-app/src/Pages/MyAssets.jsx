
// src/Pages/MyAssets.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import DashboardLayout from "../components/layouts/DashboardLayout";
import { Bookmark, Trash2, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

const API_BASE_URL = "http://localhost:8080/api";
const getAuthHeader = () => {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const MyAssets = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedAssets();
  }, []);

  const fetchSavedAssets = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/ip/assets`, {
        headers: getAuthHeader(),
      });
      setAssets(response.data);
    } catch (err) {
      console.error("Failed to fetch saved assets:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (type, assetId) => {
    try {
      await axios.delete(`${API_BASE_URL}/ip/assets/save/${type}/${assetId}`, {
        headers: getAuthHeader(),
      });
      fetchSavedAssets(); // refresh list
    } catch (err) {
      console.error("Failed to unsave:", err);
    }
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Saved Assets
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Patents and trademarks you have bookmarked
          </p>
        </div>

        {assets.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-8 text-center">
            <Bookmark size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              You haven't saved any IP assets yet.
            </p>
            <Link
              to="/search"
              className="text-blue-600 hover:underline mt-2 inline-block"
            >
              Go to Search
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {assets.map((asset) => {
              // Direct access to asset properties, not nested patent/trademark
              const type = asset.type; // "PATENT" or "TRADEMARK"
              const assetId = asset.assetId;
              const title = asset.title || "Untitled";
              const number = asset.applicationNumber || "—";
              const status = asset.status || "—";
              const jurisdiction = asset.jurisdiction || "—";
              const filingDate = asset.filingDate ? new Date(asset.filingDate).toLocaleDateString() : "—";

              return (
                <div
                  key={assetId}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow border p-4 flex justify-between items-center hover:shadow-md transition"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          type === "PATENT"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400"
                            : "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400"
                        }`}
                      >
                        {type === "PATENT" ? "Patent" : "Trademark"}
                      </span>
                      <span className="text-xs text-gray-400">{number}</span>
                    </div>
                    <Link
                      to={`/ip/${assetId}?type=${type.toLowerCase()}`}
                      className="text-lg font-semibold text-blue-600 hover:underline"
                    >
                      {title}
                    </Link>
                    <p className="text-sm text-gray-500 mt-1">
                      {status} • {jurisdiction}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">Filed: {filingDate}</p>
                  </div>
                  <button
                    onClick={() => handleUnsave(type, assetId)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                    title="Remove from saved"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyAssets;