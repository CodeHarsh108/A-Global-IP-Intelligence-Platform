import { useAuth } from "../../context/AuthContext";
import { ChevronDown, User, LogOut, Shield } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";


const Topbar = () => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const getUserInitials = () => {
    if (!user?.username) return "U";
    return user.username
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="sticky top-0 z-40 h-16 backdrop-blur-md bg-[#020617]/80 border-b border-slate-900 flex items-center justify-between px-6">
      
      {/* LEFT SECTION: Branding or Search */}
      <div className="flex items-center gap-8">
        {/* Responsive Branding (Hidden when sidebar is open, usually visible on mobile) */}
        <div className="flex items-center gap-2 lg:hidden">
          <Shield size={20} className="text-blue-500 fill-blue-500/10" />
          <span className="text-sm font-bold text-white tracking-tight">IP Intelligence</span>
        </div>

        {/* Search bar removed — SearchPage has its own full search UI */}
      </div>

      {/* RIGHT SECTION: User Actions */}
      <div className="flex items-center gap-5">
        
        {/* Global Notifications */}
        

        {/* Divider */}
        <div className="h-8 w-[1px] bg-slate-800 mx-1" />

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-3 p-1 rounded-xl hover:bg-slate-900/50 transition-all group"
          >
            <div className="w-9 h-9 bg-blue-600 text-white rounded-lg flex items-center justify-center font-black text-sm shadow-[0_0_15px_rgba(37,99,235,0.25)]">
              {getUserInitials()}
            </div>
            
            <div className="hidden lg:block text-left">
              <p className="text-[13px] font-bold text-slate-200 group-hover:text-white transition-colors leading-none mb-1">
                {user?.username || "Guest User"}
              </p>
              <div className="flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 leading-none">
                  {user?.role || "Inquiry"}
                </p>
              </div>
            </div>
            
            <ChevronDown size={14} className={`text-slate-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
          </button>

          {open && (
            <>
              {/* Backdrop to close dropdown */}
              <div className="fixed inset-0 z-[-1]" onClick={() => setOpen(false)} />
              
              <div className="absolute right-0 mt-3 w-60 bg-[#1a1f2e] border border-slate-800 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                <div className="px-4 py-3 mb-1 border-b border-slate-800/50">
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Active Account</p>
                  <p className="text-sm font-bold text-white truncate">{user?.username}</p>
                  <p className="text-[11px] text-slate-500 truncate font-medium">{user?.email}</p>
                </div>
                
                <button
                  onClick={() => { setOpen(false); navigate("/profile"); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-blue-600/10 hover:text-white flex items-center gap-3 transition-colors font-semibold"
                >
                  <User size={16} className="text-blue-500" />
                  User Profile
                </button>
                
                <button
  onClick={() => {
    if (window.confirm("Are you sure you want to log out?")) {
      logout();
      setOpen(false);
      navigate("/");
    }
  }}
  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
>
  <LogOut size={14} />
  Logout
</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Topbar;