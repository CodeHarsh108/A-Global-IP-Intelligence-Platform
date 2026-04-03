import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/layouts/DashboardLayout";
import { 
  User, Mail, Camera, Save, 
  CheckCircle2, Globe, Shield, Info,
  ArrowLeft
} from "lucide-react";

const EditProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    username: user?.username || "Srushti Jagtap",
    email: user?.email || "srushtijagtap@gmail.com",
    bio: "Data Analyst specializing in Intellectual Property and Patent Trends.",
    isPublic: true
  });

  const [status, setStatus] = useState(null);

  const handleSave = (e) => {
    e.preventDefault();
    setStatus('success');
    setTimeout(() => {
        setStatus(null);
        navigate("/profile"); // Redirect back after save
    }, 2000);
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Top Navigation Bar */}
        <div className="flex justify-between items-center pb-4 border-b border-gray-800">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 bg-gray-800/50 hover:bg-gray-700 rounded-lg text-gray-400 transition-all"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-white">Edit Profile</h1>
              <p className="text-sm text-gray-400 mt-1">Refine your identity on the Global IP Platform.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: FORM SECTION */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSave} className="space-y-6">
              
              {/* Photo Section */}
              <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Identity Image</h3>
                    <Shield size={14} className="text-blue-500/50" />
                </div>
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-4xl font-bold shadow-xl shadow-blue-900/20">
                      {formData.username.charAt(0)}
                    </div>
                    <label className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all cursor-pointer border-2 border-dashed border-blue-400/50">
                      <Camera size={20} className="text-white mb-1" />
                      <span className="text-[10px] text-white font-bold uppercase">Upload</span>
                      <input type="file" className="hidden" />
                    </label>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-200">Profile Picture</p>
                    <p className="text-xs text-gray-500 max-w-[200px]">Square images work best. Max size 2MB (PNG, JPG).</p>
                  </div>
                </div>
              </div>

              {/* Information Section */}
              <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-6 space-y-6">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">General Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Full Name</label>
                    <div className="relative group">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={16} />
                      <input 
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                        className="w-full bg-gray-900/40 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Email Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={16} />
                      <input 
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full bg-gray-900/40 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all shadow-inner"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Professional Bio</label>
                  <textarea 
                    rows="4"
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    className="w-full bg-gray-900/40 border border-gray-700 rounded-lg p-3 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all resize-none shadow-inner"
                    placeholder="Tell us about your role..."
                  />
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between p-6 bg-blue-600/5 border border-blue-500/20 rounded-xl">
                <div className="flex items-center gap-3 text-blue-400">
                    <Info size={16} />
                    <span className="text-xs font-medium">Changes take effect immediately upon saving.</span>
                </div>
                <div className="flex gap-4">
                  <button 
                    type="button" 
                    onClick={() => navigate("/profile")}
                    className="px-6 py-2 text-sm font-bold text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex items-center gap-2 px-8 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-lg shadow-lg shadow-blue-900/20 transition-all active:scale-95"
                  >
                    <Save size={18} />
                    Save Profile
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* RIGHT: PREVIEW SECTION */}
          <div className="space-y-6">
             <div className="bg-gray-800/20 border border-gray-700/50 border-dashed rounded-xl p-6 relative overflow-hidden">
                <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-4">Live Preview</h3>
                
                <div className="flex flex-col items-center text-center p-4">
                    <div className="w-16 h-16 rounded-xl bg-blue-600 flex items-center justify-center text-white text-2xl font-bold mb-4">
                        {formData.username.charAt(0)}
                    </div>
                    <h4 className="text-white font-bold">{formData.username || '—'}</h4>
                    <p className="text-xs text-gray-500 truncate w-full mt-1">{formData.email || '—'}</p>
                    
                    <div className="mt-4 pt-4 border-t border-gray-800 w-full text-left">
                        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-tighter mb-2">Bio Snippet</p>
                        <p className="text-[11px] text-gray-400 leading-relaxed italic line-clamp-3">
                            "{formData.bio || 'No bio provided...'}"
                        </p>
                    </div>

                    <div className="mt-6 w-full py-2 bg-gray-800/50 rounded-lg border border-gray-700 flex items-center justify-center gap-2">
                        <Globe size={12} className="text-green-500" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Global IP Profile Active</span>
                    </div>
                </div>
             </div>

             {status === 'success' && (
                <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-500 text-xs font-bold animate-pulse">
                    <CheckCircle2 size={16} />
                    SYNC COMPLETE: PROFILE UPDATED
                </div>
             )}
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default EditProfile;