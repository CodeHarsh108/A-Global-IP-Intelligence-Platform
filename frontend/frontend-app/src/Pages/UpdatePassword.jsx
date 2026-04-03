import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/layouts/DashboardLayout";
import { 
  Lock, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  Save,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const UpdatePassword = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState(null); // 'success' or 'error'
  
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Real-time validation state
  const [validation, setValidation] = useState({
    length: false,
    number: false,
    symbol: false,
    match: false
  });

  useEffect(() => {
    setValidation({
      length: formData.newPassword.length >= 8,
      number: /\d/.test(formData.newPassword),
      symbol: /[!@#$%^&*]/.test(formData.newPassword),
      match: formData.newPassword !== "" && formData.newPassword === formData.confirmPassword
    });
  }, [formData.newPassword, formData.confirmPassword]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (Object.values(validation).every(Boolean)) {
      setStatus('success');
      setTimeout(() => navigate("/profile"), 2000);
    } else {
      setStatus('error');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-4 pb-4 border-b border-gray-800">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-white">Security Credentials</h1>
            <p className="text-sm text-gray-400 mt-1">Manage your authentication tokens and account access.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-8 shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Current Password */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Current Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={16} />
                    <input 
                      type={showPassword ? "text" : "password"}
                      className="w-full bg-gray-900/40 border border-gray-700 rounded-lg py-2.5 pl-10 pr-12 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all"
                      placeholder="Verification required..."
                      value={formData.currentPassword}
                      onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="h-px bg-gray-800 my-2" />

                {/* New Password */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">New System Password</label>
                  <div className="relative group">
                    <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={16} />
                    <input 
                      type={showPassword ? "text" : "password"}
                      className="w-full bg-gray-900/40 border border-gray-700 rounded-lg py-2.5 pl-10 pr-12 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all"
                      placeholder="Initialize new password"
                      value={formData.newPassword}
                      onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                      required
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Confirm Initialization</label>
                  <div className="relative group">
                    <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={16} />
                    <input 
                      type={showPassword ? "text" : "password"}
                      className="w-full bg-gray-900/40 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all"
                      placeholder="Repeat new password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="submit"
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-lg shadow-lg shadow-blue-900/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!Object.values(validation).every(Boolean)}
                  >
                    <Save size={18} />
                    Commit Changes
                  </button>
                  <button 
                    type="button"
                    onClick={() => navigate(-1)}
                    className="flex-1 py-2.5 bg-gray-700/30 hover:bg-gray-700 border border-gray-600 text-gray-300 text-sm font-medium rounded-lg transition-all"
                  >
                    Abort
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar: Validation Requirements */}
          <div className="space-y-6">
            <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-6">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Security Policy</h3>
              <div className="space-y-4">
                <ValidationRow isMet={validation.length} label="At least 8 characters" />
                <ValidationRow isMet={validation.number} label="Contains a numeric digit" />
                <ValidationRow isMet={validation.symbol} label="Contains special character (!@#$)" />
                <ValidationRow isMet={validation.match} label="Password match confirmation" />
              </div>

              <div className="mt-8 p-4 bg-blue-500/5 border border-blue-500/10 rounded-lg">
                <div className="flex gap-3">
                  <AlertCircle size={16} className="text-blue-500 shrink-0" />
                  <p className="text-[11px] text-blue-400/80 leading-relaxed">
                    Updating your password will invalidate all existing sessions. You will be required to re-authenticate on all active devices.
                  </p>
                </div>
              </div>
            </div>

            {status === 'success' && (
              <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-500 text-xs font-bold animate-in fade-in slide-in-from-bottom-2">
                <CheckCircle2 size={16} />
                CREDENTIALS UPDATED SUCCESSFULLY
              </div>
            )}
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

// Internal Helper Component
const ValidationRow = ({ isMet, label }) => (
  <div className="flex items-center justify-between">
    <span className={`text-xs ${isMet ? 'text-gray-300' : 'text-gray-500'}`}>{label}</span>
    {isMet ? (
      <CheckCircle2 size={14} className="text-green-500" />
    ) : (
      <div className="w-3.5 h-3.5 rounded-full border border-gray-700" />
    )}
  </div>
);

export default UpdatePassword;