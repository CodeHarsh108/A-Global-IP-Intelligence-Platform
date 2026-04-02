import { Routes, Route } from "react-router-dom";
import LandingPage from "../components/LandingPage";
import Login from "../Pages/Login";
import Register from "../Pages/Register";
import UserDashboard from "../Pages/UserDashboard";
import AdminDashboard from "../Pages/AdminDashboard";
import AnalystDashboard from "../Pages/AnalystDashboard";
import ProtectedRoute from "./ProtectedRoute";
import IPDetails from "../Pages/IPDetails";
import Alerts from "../Pages/Alerts";
import Analytics from "../Pages/Analytics";
import RegistrationChoice from "../Pages/RegistrationChoice";
import AnalystRegistration from "../Pages/AnalystRegistration";
import AdminRequestManagement from "../Pages/AdminRequestManagement";
import Profile from "../Pages/Profile.jsx";
import EditProfile from "../Pages/EditProfile.jsx";
import UpdatePassword from "../Pages/UpdatePassword.jsx";
import OAuth2Success from "../Pages/OAuth2Success";

import SearchPage from "../Pages/SearchPage";
import StatusDashboard from "../Pages/StatusDashboard";
import Subscriptions from "../Pages/Subscriptions.jsx";
import ApiMonitoring from "../Pages/APIMonitoring.jsx";
import ApiLogs from "../Pages/ApiLogs.jsx";
import SystemLogs from "../Pages/SystemLogs.jsx";
import MyAssets from "../Pages/MyAssets.jsx";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<RegistrationChoice />} />
      <Route path="/oauth2-success" element={<OAuth2Success />} />

      <Route path="/register/user" element={<Register />} />
      <Route path="/register/analyst" element={<AnalystRegistration />} />

      {/* Protected Routes */}
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/profile/edit" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
      <Route path="/profile/update-password" element={<ProtectedRoute><UpdatePassword /></ProtectedRoute>} />

      <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
      <Route path="/ip/:id" element={<ProtectedRoute><IPDetails /></ProtectedRoute>} />
      <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />

      {/* Role-specific dashboards */}
      <Route path="/user-dashboard" element={<ProtectedRoute role="USER"><UserDashboard /></ProtectedRoute>} />
      <Route path="/analyst-dashboard" element={<ProtectedRoute role="ANALYST"><AnalystDashboard /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute role="ANALYST"><Analytics /></ProtectedRoute>} />

      {/* Admin Dashboard – merged user management & logs */}
      <Route path="/admin-dashboard" element={<ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute>} />

      {/* Redirect old /admin/users and /admin/logs to the new dashboard (optional) */}
      <Route path="/admin/users" element={<ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute>} />
<Route
    path="/admin/logs"
    element={
        <ProtectedRoute role="ADMIN">
            <SystemLogs />
        </ProtectedRoute>
    }
/>
      {/* Admin tools */}
      <Route path="/admin/apihealth" element={<ProtectedRoute role="ADMIN"><ApiMonitoring /></ProtectedRoute>} />
      <Route path="/admin/apilogs" element={<ProtectedRoute role="ADMIN"><ApiLogs /></ProtectedRoute>} />
      <Route path="/admin/analyst-requests" element={<ProtectedRoute role="ADMIN"><AdminRequestManagement /></ProtectedRoute>} />

      {/* User features */}
      <Route path="/subscriptions" element={<ProtectedRoute><Subscriptions /></ProtectedRoute>} />
      <Route path="/status-dashboard" element={<ProtectedRoute><StatusDashboard /></ProtectedRoute>} />

      <Route path="*" element={<div>404 - Page Not Found</div>} />


      <Route
    path="/my-assets"
    element={
        <ProtectedRoute>
            <MyAssets />
        </ProtectedRoute>
    }
/>
    </Routes>
  );
};

export default AppRoutes;