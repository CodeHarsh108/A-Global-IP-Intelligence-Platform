import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext(null);

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 ${config.method.toUpperCase()} request to ${config.url}`, config.data);
    const token = localStorage.getItem("accessToken");
    if (token && !config.url.includes("/auth/login") && !config.url.includes("/auth/register")) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("❌ Request error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log(`✅ Response from ${response.config.url}:`, response.status, response.data);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error(`❌ Error response from ${error.config?.url}:`, error.response.status, error.response.data);
    } else if (error.request) {
      console.error("❌ No response received:", error.request);
    } else {
      console.error("❌ Error:", error.message);
    }
    return Promise.reject(error);
  }
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for stored token on initial load
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem("accessToken");
        const storedUser = localStorage.getItem("user");

        if (token && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          console.log("✅ Restored user from storage:", parsedUser.email);
        }
      } catch (err) {
        console.error("❌ Error restoring auth state:", err);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("tokenType");
        localStorage.removeItem("user");
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const register = async (userData) => {
    setError(null);
    try {
      // Format the data exactly as backend expects
      const registerData = {
        username: `${userData.firstName} ${userData.lastName}`.trim(),
        email: userData.email.toLowerCase().trim(),
        password: userData.password,
        role: userData.role.toUpperCase()
      };

      console.log("📤 Sending registration data:", registerData);

      const response = await api.post("/auth/register", registerData);

      console.log("✅ Registration successful:", response.data);

      return {
        success: true,
        data: response.data,
        message: "Registration successful! Please login."
      };
    } catch (err) {
      console.error("❌ Registration error:", err);

      let errorMessage = "Registration failed. ";

      if (err.response) {
        // Server responded with error
        if (typeof err.response.data === 'string') {
          errorMessage += err.response.data;
        } else if (err.response.data.error) {
          errorMessage += err.response.data.error;
        } else if (err.response.data.message) {
          errorMessage += err.response.data.message;
        } else {
          errorMessage += `Server error: ${err.response.status}`;
        }
      } else if (err.request) {
        errorMessage += "Cannot connect to server. Make sure backend is running on port 8080.";
      } else {
        errorMessage += err.message;
      }

      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    }
  };

  const login = async (email, password) => {
    setError(null);
    try {
      const loginData = {
        email: email.toLowerCase().trim(),
        password: password
      };

      console.log("📤 Sending login request:", loginData);

      const response = await api.post("/auth/login", loginData);

      console.log("✅ Login response:", response.data);

      const { accessToken, tokenType, user } = response.data;

      if (!accessToken) {
        throw new Error("No access token received from server");
      }

      if (!user) {
        throw new Error("No user data received from server");
      }

      // Store in localStorage
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("tokenType", tokenType || "Bearer");
      localStorage.setItem("user", JSON.stringify(user));

      // Set default auth header for future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

      setUser(user);

      console.log("✅ Login successful for:", user.email);

      return {
        success: true,
        user
      };
    } catch (err) {
      console.error("❌ Login error:", err);

      let errorMessage = "Login failed. ";

      if (err.response) {
        // Server responded with error
        if (err.response.status === 401) {
          errorMessage = "Invalid email or password. Please try again.";
        } else if (err.response.data) {
          if (typeof err.response.data === 'string') {
            errorMessage = err.response.data;
          } else if (err.response.data.error) {
            errorMessage = err.response.data.error;
          } else if (err.response.data.message) {
            errorMessage = err.response.data.message;
          } else {
            errorMessage = `Server error: ${err.response.status}`;
          }
        }
      } else if (err.request) {
        errorMessage = "Cannot connect to server. Please make sure the backend is running on port 8080.";
      } else {
        errorMessage = err.message;
      }

      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("tokenType");
    localStorage.removeItem("user");
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setError(null);
    console.log("✅ Logged out successfully");
  };

  const hasRole = (requiredRole) => {
  if (!user || !user.role) return false;

  // This performs a strict 1:1 match
  return user.role.toUpperCase() === requiredRole.toUpperCase();
};

  const getDashboardPath = () => {
    if (!user) return "/login";

    const rolePath = {
      'ADMIN': '/admin-dashboard',
      'ANALYST': '/analyst-dashboard',
      'USER': '/user-dashboard'
    };

    return rolePath[user.role] || "/";
  };

  const fetchProfile = async () => {
    try {
      const response = await api.get("/auth/profile");
      setUser(response.data);
      localStorage.setItem("user", JSON.stringify(response.data));
      console.log("✅ Profile fetched successfully:", response.data.email);
      return { success: true, user: response.data };
    } catch (err) {
      console.error("❌ Profile fetch error:", err);
      return { success: false, error: err.message };
    }
  };

  const value = {
    user,
    setUser,
    loading,
    error,
    register,
    login,
    logout,
    hasRole,
    getDashboardPath,
    fetchProfile,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};