import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, role, feature }) => {
  const { user, hasRole, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check role if specified
  if (role && !hasRole(role)) {
    const rolePath = {
      'ADMIN': '/admin-dashboard',
      'ANALYST': '/analyst-dashboard',
      'USER': '/user-dashboard'
    };
    return <Navigate to={rolePath[user.role] || "/"} replace />;
  }

  return children;
};

export default ProtectedRoute;