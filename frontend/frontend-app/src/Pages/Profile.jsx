import React from "react";
import { useNavigate } from "react-router-dom"; // Added for navigation
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/layouts/DashboardLayout";
import { 
  User, 
  Mail, 
  Shield, 
  Calendar, 
  Edit3, 
  Key,
  ChevronRight,
  UserCheck
} from "lucide-react";

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate(); 

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl">
        
        {/* Header - Simple and Clean */}
        <div className="pb-4 border-b border-gray-800">
          <h1 className="text-2xl font-semibold text-white">
            Account Settings
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Overview of your profile information and platform access rights.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-8 flex flex-col items-center">
              <div className="w-20 h-20 rounded-xl bg-blue-600 flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-sm">
                {user?.username?.charAt(0).toUpperCase() || 'S'}
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {user?.username || 'Srushti Jagtap'}
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                {user?.email || 'srushtijagtap@gmail.com'}
              </p>
              <div className="bg-blue-600/10 px-4 py-1.5 rounded-full text-[11px] font-bold text-blue-400 uppercase tracking-wider border border-blue-500/20">
                {user?.role || 'Data Analyst'}
              </div>
            </div>

            <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-5">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-1">Security Actions</h3>
              <div className="space-y-2">
                
                {/* --- NAVIGATION TRIGGER: EDIT PROFILE --- */}
                <button 
                  onClick={() => navigate("/profile/edit")}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-700/30 border border-gray-700 text-sm text-gray-300 hover:bg-gray-700/60 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Edit3 size={16} className="text-blue-500 group-hover:scale-110 transition-transform" />
                    Edit Profile Details
                  </div>
                  <ChevronRight size={14} className="text-gray-500" />
                </button>

                {/* --- NAVIGATION TRIGGER: UPDATE PASSWORD --- */}
                <button 
                  onClick={() => navigate("/profile/update-password")}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-700/30 border border-gray-700 text-sm text-gray-300 hover:bg-gray-700/60 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Key size={16} className="text-blue-500 group-hover:scale-110 transition-transform" />
                    Update Password
                  </div>
                  <ChevronRight size={14} className="text-gray-500" />
                </button>

              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-8 space-y-6">
            
            <div className="bg-gray-800/40 border border-gray-700 rounded-xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-gray-700 bg-gray-800/60">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Account Specifications</h3>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12">
                <InfoBlock label="Display Name" value={user?.username || 'Srushti Jagtap'} icon={<User size={16}/>} />
                <InfoBlock label="Email Address" value={user?.email || 'srushtijagtap@gmail.com'} icon={<Mail size={16}/>} />
                <InfoBlock label="Account Type" value={user?.role || 'Data Analyst'} icon={<UserCheck size={16}/>} />
                <InfoBlock label="Member Since" value="February 2024" icon={<Calendar size={16}/>} />
              </div>
            </div>

            <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6 border-b border-gray-700 pb-3">
                <Shield size={16} className="text-blue-500" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Feature Access</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FeatureItem label="Global IP Search" enabled={true} />
                <FeatureItem label="Trend Analysis" enabled={user?.role === 'ANALYST' || user?.role === 'ADMIN'} />
                <FeatureItem label="User Management" enabled={user?.role === 'ADMIN'} />
                <FeatureItem label="Full System Logs" enabled={user?.role === 'ADMIN'} />
              </div>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};


const InfoBlock = ({ label, value, icon }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">
      {label}
    </label>
    <div className="flex items-center gap-3">
      <div className="text-blue-500/70">{icon}</div>
      <span className="text-sm font-medium text-gray-200">{value}</span>
    </div>
  </div>
);

const FeatureItem = ({ label, enabled }) => (
  <div className={`flex items-center justify-between p-4 rounded-lg border transition-all 
    ${enabled 
      ? 'bg-gray-800/40 border-gray-700' 
      : 'bg-gray-900/20 border-gray-800/50'}`}>
    <span className={`text-xs font-medium ${enabled ? 'text-gray-200' : 'text-gray-600'}`}>
      {label}
    </span>
    <div className="flex items-center gap-2">
      <div className={`w-1.5 h-1.5 rounded-full ${enabled ? 'bg-green-500' : 'bg-gray-700'}`} />
      <span className={`text-[10px] font-bold uppercase ${enabled ? 'text-green-500' : 'text-gray-700'}`}>
        {enabled ? 'Enabled' : 'Locked'}
      </span>
    </div>
  </div>
);

export default Profile;