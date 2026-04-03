import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/layouts/DashboardLayout";
import { CheckCircle, XCircle, Eye, Download, Loader2, FileText, Image, File } from "lucide-react";
import axios from "axios";

const AdminRequestManagement = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedRequestForAction, setSelectedRequestForAction] = useState(null);
  const [actionType, setActionType] = useState(null); // 'approve' or 'reject'
  const [stats, setStats] = useState({ pending: 0, approvedToday: 0, rejectedToday: 0 });


const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080/api";
  useEffect(() => {
    fetchRequests();
    fetchStats();
  }, []);

  const fetchStats = async () => {
  try {
    const token = localStorage.getItem("accessToken");
    const response = await axios.get(`${API_BASE_URL}/admin/analyst-requests/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setStats(response.data);
  } catch (error) {
    console.error("Failed to fetch stats:", error);
  }
};

  const fetchRequests = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(
        `${API_BASE_URL}/admin/analyst-requests/pending`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Fetched requests:", response.data);
      setRequests(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
     console.error("Error fetching requests:", error);
  const errMsg = error.response?.data?.error || error.response?.data || "Failed to fetch requests";
  setError(typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg));
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    setProcessingId(requestId);
    try {
      const token = localStorage.getItem("accessToken");
      await axios.post(
        `${API_BASE_URL}/admin/analyst-requests/review`,
        {
          requestId,
          approved: true,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("✅ Request approved successfully! The analyst will receive an email.");
      fetchRequests();
    } catch (error) {
      console.error("Error approving request:", error);
      alert("❌ Failed to approve request");
    } finally {
      setProcessingId(null);
      setShowConfirmModal(false);
      setSelectedRequestForAction(null);
      setActionType(null);
    }
  };

  const handleReject = async (requestId) => {
    setProcessingId(requestId);
    try {
      const token = localStorage.getItem("accessToken");
      await axios.post(
        `${API_BASE_URL}/admin/analyst-requests/review`,
        {
          requestId,
          approved: false,
          rejectionReason: "Application rejected by admin",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("❌ Request rejected successfully!");
      fetchRequests();
    } catch (error) {
      console.error("Error rejecting request:", error);
      alert("Failed to reject request");
    } finally {
      setProcessingId(null);
      setShowConfirmModal(false);
      setSelectedRequestForAction(null);
      setActionType(null);
    }
  };

  const openConfirmModal = (request, action) => {
    setSelectedRequestForAction(request);
    setActionType(action);
    setShowConfirmModal(true);
  };

  const getDocumentIcon = (filename) => {
    if (!filename) return <File size={20} />;
    const ext = filename.split('.').pop().toLowerCase();
    if (ext === 'pdf') return <FileText size={20} className="text-red-500" />;
    if (['jpg', 'jpeg', 'png'].includes(ext)) return <Image size={20} className="text-blue-500" />;
    return <File size={20} className="text-gray-500" />;
  };

  const viewDocument = (requestId, documentType) => {
    const token = localStorage.getItem("accessToken");
    window.open(
      `${API_BASE_URL}/files/view/${requestId}/${documentType}?token=${token}`,
      '_blank'
    );
  };

  const downloadDocument = (requestId, documentType) => {
    const token = localStorage.getItem("accessToken");
    window.open(
      `${API_BASE_URL}/files/download/${requestId}/${documentType}?token=${token}`,
      '_blank'
    );
  };

  const getAvailableDocuments = (request) => {
    const docs = [];
    if (request.patentAgentLicensePath) docs.push({ type: 'patentAgentLicense', name: 'Patent Agent License' });
    if (request.lawCouncilIdPath) docs.push({ type: 'lawCouncilId', name: 'Law Council ID' });
    if (request.companyProofPath) docs.push({ type: 'companyProof', name: 'Company Proof' });
    if (request.researchInstitutionProofPath) docs.push({ type: 'researchInstitutionProof', name: 'Research Proof' });
    return docs;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  const getCredentialTypeLabel = (type) => {
    const types = {
      PATENT_AGENT: "Patent Agent",
      LAW_COUNCIL: "Law Council Member",
      COMPANY: "Company Employee",
      RESEARCH_INSTITUTION: "Research Institution",
    };
    return types[type] || type;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 size={32} className="animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analyst Registration Requests</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Review and manage pending analyst registration requests
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">Pending Requests</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">Approved Today</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{stats.approvedToday}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">Rejected Today</p>
            <p className="text-3xl font-bold text-red-600 mt-2">{stats.rejectedToday}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Applicant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Credential Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Credential Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Submitted</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Documents</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      No pending requests
                    </td>
                  </tr>
                ) : (
                  requests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {request.firstName} {request.lastName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600 dark:text-gray-400">{request.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600 dark:text-gray-400">{getCredentialTypeLabel(request.credentialType)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600 dark:text-gray-400">{request.credentialNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600 dark:text-gray-400">{formatDate(request.submittedAt)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          {getAvailableDocuments(request).map((doc, index) => (
                            <div key={index} className="flex items-center gap-2">
                              {getDocumentIcon(doc.type)}
                              <span className="text-xs text-gray-600 dark:text-gray-400">{doc.name}</span>
                              <button
                                onClick={() => viewDocument(request.id, doc.type)}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                title="View"
                              >
                                <Eye size={14} />
                              </button>
                              <button
                                onClick={() => downloadDocument(request.id, doc.type)}
                                className="p-1 text-green-600 hover:bg-green-50 rounded"
                                title="Download"
                              >
                                <Download size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openConfirmModal(request, 'approve')}
                            disabled={processingId === request.id}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition disabled:opacity-50"
                            title="Approve"
                          >
                            {processingId === request.id ? (
                              <Loader2 size={20} className="animate-spin" />
                            ) : (
                              <CheckCircle size={20} />
                            )}
                          </button>
                          <button
                            onClick={() => openConfirmModal(request, 'reject')}
                            disabled={processingId === request.id}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                            title="Reject"
                          >
                            <XCircle size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirmModal && selectedRequestForAction && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {actionType === 'approve' ? 'Approve Application' : 'Reject Application'}
                </h3>
              </div>
              <div className="p-6">
                <p className="text-gray-700 dark:text-gray-300">
                  {actionType === 'approve'
                    ? `Are you sure you want to approve ${selectedRequestForAction.firstName} ${selectedRequestForAction.lastName}'s request?`
                    : `Are you sure you want to reject ${selectedRequestForAction.firstName} ${selectedRequestForAction.lastName}'s request?`}
                </p>
                {actionType === 'reject' && (
                  <p className="text-sm text-gray-500 mt-2">
                    The applicant will be notified via email.
                  </p>
                )}
              </div>
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    setSelectedRequestForAction(null);
                    setActionType(null);
                  }}
                  className="px-4 py-2 border border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 rounded-lg text-cyan-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (actionType === 'approve') {
                      handleApprove(selectedRequestForAction.id);
                    } else {
                      handleReject(selectedRequestForAction.id);
                    }
                  }}
                  disabled={processingId === selectedRequestForAction.id}
                  className={`px-4 py-2 rounded-lg text-white flex items-center gap-2 ${
                    actionType === 'approve'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  } disabled:opacity-50`}
                >
                  {processingId === selectedRequestForAction.id ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    actionType === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminRequestManagement;