import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff, Loader2, CheckCircle, XCircle } from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const { register, error: authError, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "USER",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    hasLower: false,
    hasUpper: false,
    hasNumber: false,
    hasSpecial: false,
    minLength: false
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/user-dashboard");
    }
  }, [isAuthenticated, navigate]);

  // Check password strength
  useEffect(() => {
    const password = formData.password;
    setPasswordStrength({
      score: password.length,
      hasLower: /[a-z]/.test(password),
      hasUpper: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*]/.test(password),
      minLength: password.length >= 6
    });
  }, [formData.password]);

  const validate = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setRegisterError("");
    setSuccessMessage("");

    const result = await register(formData);

    if (result.success) {
      setSuccessMessage(result.message || "Registration successful! Redirecting to login...");
      // Clear form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "USER",
      });
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login", { 
          state: { message: "Registration successful! Please login with your credentials." }
        });
      }, 2000);
    } else {
      setRegisterError(result.error);
    }

    setLoading(false);
  };

  const getPasswordStrengthColor = () => {
    const { hasLower, hasUpper, hasNumber, hasSpecial, minLength } = passwordStrength;
    const checks = [hasLower, hasUpper, hasNumber, hasSpecial, minLength].filter(Boolean).length;
    
    if (checks <= 2) return "bg-red-500";
    if (checks <= 4) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 px-4 py-8">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl rounded-2xl p-6 md:p-8 transition-all">

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Global IP Intelligence
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
            Create a new account
          </p>
        </div>

        {/* Error Message */}
        {(registerError || authError) && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            <p className="font-medium mb-1">Registration Failed:</p>
            <p>{registerError || authError}</p>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm flex items-start gap-2">
            <CheckCircle size={18} className="flex-shrink-0 mt-0.5" />
            <p>{successMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>

          {/* First & Last Name */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium mb-2 text-gray-600 dark:text-gray-300">
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                name="firstName"
                placeholder="John"
                value={formData.firstName}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border transition-all ${
                  errors.firstName
                    ? "border-red-500 focus:ring-red-500 bg-red-50"
                    : "border-gray-300 dark:border-gray-700 focus:ring-blue-500 bg-gray-50 dark:bg-gray-800"
                } focus:ring-2 focus:outline-none dark:text-white`}
                disabled={loading}
                autoComplete="given-name"
              />
              {errors.firstName && (
                <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
              )}
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium mb-2 text-gray-600 dark:text-gray-300">
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                name="lastName"
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border transition-all ${
                  errors.lastName
                    ? "border-red-500 focus:ring-red-500 bg-red-50"
                    : "border-gray-300 dark:border-gray-700 focus:ring-blue-500 bg-gray-50 dark:bg-gray-800"
                } focus:ring-2 focus:outline-none dark:text-white`}
                disabled={loading}
                autoComplete="family-name"
              />
              {errors.lastName && (
                <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2 text-gray-600 dark:text-gray-300">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="john.doe@example.com"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg border transition-all ${
                errors.email
                  ? "border-red-500 focus:ring-red-500 bg-red-50"
                  : "border-gray-300 dark:border-gray-700 focus:ring-blue-500 bg-gray-50 dark:bg-gray-800"
              } focus:ring-2 focus:outline-none dark:text-white`}
              disabled={loading}
              autoComplete="email"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2 text-gray-600 dark:text-gray-300">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border transition-all pr-12 ${
                  errors.password
                    ? "border-red-500 focus:ring-red-500 bg-red-50"
                    : "border-gray-300 dark:border-gray-700 focus:ring-blue-500 bg-gray-50 dark:bg-gray-800"
                } focus:ring-2 focus:outline-none dark:text-white`}
                disabled={loading}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="mt-2 space-y-2">
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${getPasswordStrengthColor()} transition-all duration-300`}
                    style={{ width: `${(Object.values(passwordStrength).filter(v => v === true).length / 6) * 100}%` }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <div className="flex items-center gap-1">
                    {passwordStrength.minLength ? 
                      <CheckCircle size={12} className="text-green-500" /> : 
                      <XCircle size={12} className="text-gray-300" />}
                    <span className="text-gray-600 dark:text-gray-400">Min 6 chars</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {passwordStrength.hasLower ? 
                      <CheckCircle size={12} className="text-green-500" /> : 
                      <XCircle size={12} className="text-gray-300" />}
                    <span className="text-gray-600 dark:text-gray-400">Lowercase</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {passwordStrength.hasUpper ? 
                      <CheckCircle size={12} className="text-green-500" /> : 
                      <XCircle size={12} className="text-gray-300" />}
                    <span className="text-gray-600 dark:text-gray-400">Uppercase</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {passwordStrength.hasNumber ? 
                      <CheckCircle size={12} className="text-green-500" /> : 
                      <XCircle size={12} className="text-gray-300" />}
                    <span className="text-gray-600 dark:text-gray-400">Number</span>
                  </div>
                </div>
              </div>
            )}
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2 text-gray-600 dark:text-gray-300">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border transition-all pr-12 ${
                  errors.confirmPassword
                    ? "border-red-500 focus:ring-red-500 bg-red-50"
                    : "border-gray-300 dark:border-gray-700 focus:ring-blue-500 bg-gray-50 dark:bg-gray-800"
                } focus:ring-2 focus:outline-none dark:text-white`}
                disabled={loading}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                onClick={() => setShowConfirm(!showConfirm)}
                tabIndex="-1"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
            )}
          </div>

         
          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 font-semibold rounded-lg transition duration-300 flex items-center justify-center gap-2 ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white shadow-lg hover:shadow-xl mt-6`}
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-sm text-center text-gray-500 dark:text-gray-400 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline font-medium">
            Sign In
          </Link>
        </p>

        {/* Info Box */}
        <div className="mt-6 text-xs text-gray-400 text-center bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="font-medium mb-1">🔐 Password Requirements:</p>
          <p>Minimum 6 characters with mix of letters and numbers</p>
        </div>

      </div>
    </div>
  );
};

export default Register;