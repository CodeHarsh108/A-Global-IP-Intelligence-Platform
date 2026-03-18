import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Search,
  Bell,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Users,
  FileText,
  Activity,
  Shield
} from "lucide-react";
import { useState } from "react";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user, hasRole } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  // Improved Menu Logic: 'Search' is now hidden for 'USER' role
  const menuItems = [
    { 
      name: "Dashboard", 
      path: `/${user?.role?.toLowerCase()}-dashboard`, 
      icon: LayoutDashboard,
      visible: true 
    },
    { 
      name: "Search", 
      path: "/search", 
      icon: Search,
      // Only Admins and Analysts see the dedicated Search page link
      visible: hasRole('ADMIN') || hasRole('ANALYST') 
    },
    { 
      name: "Alerts", 
      path: "/alerts", 
      icon: Bell,
      visible: true 
    },
        { 
      name: "My Subscriptions", 
      path: "/subscriptions", 
      icon: Bell,
      visible: true 
    },
    { 
      name: "Analytics", 
      path: "/analytics", 
      icon: BarChart3,
      visible: hasRole('ANALYST') || hasRole('ADMIN')
    },
    {   
  name: "Status Dashboard", 
  path: "/status-dashboard", 
  icon: Activity,
  visible: hasRole('ANALYST') || hasRole('ADMIN')
    },
    { 
      name: "Analyst Requests", 
      path: "/admin/analyst-requests", 
      icon: FileText,
      visible: hasRole('ADMIN')
    },
    { 
      name: "User Management", 
      path: "/admin/users", 
      icon: Users,
      visible: hasRole('ADMIN')
    },
    { 
      name: "System Logs", 
      path: "/admin/logs", 
      icon: FileText,
      visible: hasRole('ADMIN')
    },
    { 
      name: "Activity", 
      path: "/admin/activity", 
      icon: Activity,
      visible: hasRole('ADMIN')
    }
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div
      className={`h-screen ${
        collapsed ? "w-20" : "w-72"
      } transition-all duration-300 bg-[#020617] border-r border-slate-900 flex flex-col z-50`}
    >
      {/* BRANDING SECTION */}
      <div className="flex items-center justify-between p-6">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <Shield size={22} className="text-blue-500 fill-blue-500/10" />
            <h1 className="text-lg font-bold text-white tracking-tight">
              IP <span className="text-blue-500">Intelligence</span>
            </h1>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded bg-slate-900/50 border border-slate-800 text-slate-500 hover:text-white transition-colors"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* USER PROFILE CARD */}
      {!collapsed && user && (
        <div className="mx-4 mb-8 p-4 bg-[#1a1f2e] border border-slate-800/50 rounded-2xl shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center text-white text-lg font-black shadow-[0_0_15px_rgba(37,99,235,0.3)]">
              {user.username?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate tracking-tight">
                {user.username}
              </p>
              <p className="text-[10px] font-medium text-slate-500 truncate lowercase">
                {user.email}
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-500/10 border border-blue-500/20">
            <div className="w-1 h-1 rounded-full bg-blue-400" />
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
              {user.role === 'ADMIN' ? 'Administrator' : user.role === 'ANALYST' ? 'Analyst' : 'User'}
            </span>
          </div>
        </div>
      )}

      {/* NAVIGATION MENU */}
      <div className="px-4 mb-4">
        {!collapsed && (
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4 ml-2">
            Main Menu
          </p>
        )}
        <nav className="space-y-1">
          {menuItems.filter(item => item.visible).map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={index}
                to={item.path}
                className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-200 relative group
                  ${isActive 
                    ? "bg-blue-600/10 border border-blue-500/20 text-white shadow-[0_0_15px_rgba(59,130,246,0.05)]" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
                  }`}
              >
                {isActive && (
                  <div className="absolute left-[-4px] h-5 w-1 bg-blue-500 rounded-full shadow-[0_0_8px_#3b82f6]" />
                )}
                
                <Icon size={20} className={isActive ? "text-blue-500" : "group-hover:text-blue-400 transition-colors"} />
                
                {!collapsed && (
                  <span className={`text-[13px] font-semibold ${isActive ? 'text-white' : 'text-slate-400'}`}>
                    {item.name}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* FOOTER / SIGN OUT */}
      <div className="mt-auto p-4 border-t border-slate-900/50">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 p-3 rounded-xl text-slate-500 hover:text-rose-500 hover:bg-rose-500/5 transition-all group"
        >
          <LogOut size={20} className="group-hover:-translate-x-0.5 transition-transform" />
          {!collapsed && <span className="text-sm font-bold">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;