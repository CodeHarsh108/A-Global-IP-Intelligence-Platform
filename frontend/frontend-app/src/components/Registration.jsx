import React, { useState } from "react";
import "../styles/Registration.css";

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required.";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email address.";
    }
    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setSubmitted(true);
  };

  const getPasswordStrength = () => {
    const p = formData.password;
    if (!p) return { label: "", level: 0 };
    if (p.length < 6) return { label: "Weak", level: 1 };
    if (p.length < 10 || !/[A-Z]/.test(p) || !/[0-9]/.test(p))
      return { label: "Fair", level: 2 };
    if (/[!@#$%^&*]/.test(p)) return { label: "Strong", level: 4 };
    return { label: "Good", level: 3 };
  };

  const strength = getPasswordStrength();

  if (submitted) {
    return (
      <div className="rg-wrapper">
        <div className="rg-card rg-success-card">
          <div className="rg-success-icon">✓</div>
          <h2 className="rg-success-title">You're in!</h2>
          <p className="rg-success-msg">
            Welcome, <strong>{formData.fullName}</strong>. Your account has been
            created successfully.
          </p>
          <button
            className="rg-btn"
            onClick={() => {
              setSubmitted(false);
              setFormData({ fullName: "", email: "", password: "", confirmPassword: "" });
            }}
          >
            Back to Register
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rg-wrapper">
      {/* Decorative blobs */}
      <div className="rg-blob rg-blob-1" />
      <div className="rg-blob rg-blob-2" />

      <div className="rg-card">
        <div className="rg-header">
          <div className="rg-logo">✦</div>
          <h1 className="rg-title">Create Account</h1>
          <p className="rg-subtitle">Join us — it only takes a minute.</p>
        </div>

        <form className="rg-form" onSubmit={handleSubmit} noValidate>
          {/* Full Name */}
          <div className={`rg-field ${errors.fullName ? "rg-field--error" : ""}`}>
            <label className="rg-label" htmlFor="fullName">
              Full Name
            </label>
            <div className="rg-input-wrap">
              <span className="rg-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </span>
              <input
                id="fullName"
                name="fullName"
                type="text"
                className="rg-input"
                placeholder="Jane Doe"
                value={formData.fullName}
                onChange={handleChange}
                autoComplete="name"
              />
            </div>
            {errors.fullName && <span className="rg-error">{errors.fullName}</span>}
          </div>

          {/* Email */}
          <div className={`rg-field ${errors.email ? "rg-field--error" : ""}`}>
            <label className="rg-label" htmlFor="email">
              Email Address
            </label>
            <div className="rg-input-wrap">
              <span className="rg-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
              </span>
              <input
                id="email"
                name="email"
                type="email"
                className="rg-input"
                placeholder="jane@example.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>
            {errors.email && <span className="rg-error">{errors.email}</span>}
          </div>

          {/* Password */}
          <div className={`rg-field ${errors.password ? "rg-field--error" : ""}`}>
            <label className="rg-label" htmlFor="password">
              Password
            </label>
            <div className="rg-input-wrap">
              <span className="rg-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                className="rg-input"
                placeholder="Min. 8 characters"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="rg-toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
            {formData.password && (
              <div className="rg-strength">
                <div className="rg-strength-bars">
                  {[1, 2, 3, 4].map((n) => (
                    <span
                      key={n}
                      className={`rg-strength-bar rg-strength-bar--${strength.level >= n ? strength.label.toLowerCase() : "empty"}`}
                    />
                  ))}
                </div>
                <span className={`rg-strength-label rg-strength-label--${strength.label.toLowerCase()}`}>
                  {strength.label}
                </span>
              </div>
            )}
            {errors.password && <span className="rg-error">{errors.password}</span>}
          </div>

          {/* Confirm Password */}
          <div className={`rg-field ${errors.confirmPassword ? "rg-field--error" : ""}`}>
            <label className="rg-label" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <div className="rg-input-wrap">
              <span className="rg-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 11 12 14 22 4"/>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                </svg>
              </span>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirm ? "text" : "password"}
                className="rg-input"
                placeholder="Repeat password"
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="rg-toggle"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label="Toggle confirm password visibility"
              >
                {showConfirm ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
            {errors.confirmPassword && <span className="rg-error">{errors.confirmPassword}</span>}
          </div>

          <button type="submit" className="rg-btn rg-btn--full">
            Create Account
          </button>
        </form>

        <p className="rg-footer">
          Already have an account?{" "}
          <a href="/login" className="rg-link">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;
