import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Upload, Loader2, CheckCircle, XCircle, FileText, Info, Eye, EyeOff, ChevronRight, ChevronLeft, Shield, Briefcase, GraduationCap } from "lucide-react";
import axios from "axios";

const AnalystRegistration = () => {
  const navigate = useNavigate();

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080/api";

  
  // Form data
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    credentialType: "PATENT_AGENT",
    credentialNumber: "",
  });

  // File uploads
  const [files, setFiles] = useState({
    patentAgentLicense: null,
    lawCouncilId: null,
    companyProof: null,
    researchInstitutionProof: null,
  });

  // UI state
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: "", color: "" });

  // Credential types
  const credentialTypes = [
    { value: "PATENT_AGENT", label: "Patent Agent", requires: "patentAgentLicense", icon: <Shield size={16} />, help: "Upload your patent agent license certificate." },
    { value: "LAW_COUNCIL", label: "Law Council Member", requires: "lawCouncilId", icon: <Briefcase size={16} />, help: "Provide your law council membership ID." },
    { value: "COMPANY", label: "Company Employee", requires: "companyProof", icon: <Briefcase size={16} />, help: "Upload employment letter or ID card." },
    { value: "RESEARCH_INSTITUTION", label: "Research Institution", requires: "researchInstitutionProof", icon: <GraduationCap size={16} />, help: "Upload affiliation proof (e.g., university ID)." },
  ];

  // Steps definition
  const steps = [
    { title: "Personal", fields: ["firstName", "lastName", "email"] },
    { title: "Security", fields: ["password", "confirmPassword"] },
    { title: "Professional", fields: ["credentialType", "credentialNumber"] },
    { title: "Documents", fields: credentialTypes.map(t => t.requires) },
    { title: "Review", fields: [] },
  ];

  // Password strength calculator
  useEffect(() => {
    const pwd = formData.password;
    if (!pwd) {
      setPasswordStrength({ score: 0, label: "", color: "bg-gray-200" });
      return;
    }
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;
    const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
    const colors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"];
    setPasswordStrength({
      score: strength,
      label: labels[strength] || "",
      color: colors[strength] || "bg-gray-200",
      width: `${(strength / 4) * 100}%`,
    });
  }, [formData.password]);

  // Validate a single field on blur
  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "firstName":
        if (!value.trim()) error = "First name is required";
        break;
      case "lastName":
        if (!value.trim()) error = "Last name is required";
        break;
      case "email":
        if (!value.trim()) error = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(value)) error = "Enter a valid email address";
        break;
      case "password":
        if (!value) error = "Password is required";
        else if (value.length < 8) error = "Password must be at least 8 characters";
        break;
      case "confirmPassword":
        if (!value) error = "Please confirm your password";
        else if (value !== formData.password) error = "Passwords do not match";
        break;
      case "credentialNumber":
        if (!value.trim()) error = "Credential number is required";
        break;
      default:
        // For file fields, check later
        break;
    }
    return error;
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      // Validate size and type
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, [fieldName]: "File size must be less than 10MB" }));
        return;
      }
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, [fieldName]: "Only PDF, JPEG, and PNG files are allowed" }));
        return;
      }
      setFiles(prev => ({ ...prev, [fieldName]: file }));
      if (errors[fieldName]) {
        setErrors(prev => ({ ...prev, [fieldName]: "" }));
      }
    }
  };

  // Check if current step is valid
  const isStepValid = () => {
    const currentFields = steps[currentStep].fields;
    for (const field of currentFields) {
      if (field === "credentialType") continue; // Always valid
      if (field === "confirmPassword") continue; // Check later
      if (field.startsWith("patentAgentLicense") || field.startsWith("lawCouncilId") || field.startsWith("companyProof") || field.startsWith("researchInstitutionProof")) {
        // Check required document based on credential type
        const selectedType = credentialTypes.find(t => t.value === formData.credentialType);
        if (selectedType && selectedType.requires === field) {
          if (!files[field]) {
            return false;
          }
        }
        continue;
      }
      const value = formData[field];
      if (!value || (field === "password" && value.length < 8) || (field === "confirmPassword" && value !== formData.password)) {
        return false;
      }
      if (field === "email" && !/\S+@\S+\.\S+/.test(value)) return false;
    }
    return true;
  };

  const nextStep = () => {
    if (isStepValid()) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    } else {
      // Highlight errors
      const currentFields = steps[currentStep].fields;
      const newTouched = { ...touched };
      for (const field of currentFields) {
        if (field !== "credentialType") newTouched[field] = true;
      }
      setTouched(newTouched);
      // Trigger validation for all fields in this step
      const newErrors = {};
      for (const field of currentFields) {
        if (field !== "credentialType") {
          const error = validateField(field, formData[field]);
          if (error) newErrors[field] = error;
        }
      }
      setErrors(prev => ({ ...prev, ...newErrors }));
    }
  };

  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  const handleFinalSubmit = async () => {
    // Final validation of all fields
    const allErrors = {};
    for (const field of ["firstName", "lastName", "email", "password", "confirmPassword", "credentialNumber"]) {
      const error = validateField(field, formData[field]);
      if (error) allErrors[field] = error;
    }
    // Check required document
    const selectedType = credentialTypes.find(t => t.value === formData.credentialType);
    if (selectedType && !files[selectedType.requires]) {
      allErrors[selectedType.requires] = "This document is required";
    }
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      setCurrentStep(0);
      return;
    }

    setLoading(true);
    setErrorMessage("");

    const formDataToSend = new FormData();
    formDataToSend.append("firstName", formData.firstName);
    formDataToSend.append("lastName", formData.lastName);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("password", formData.password);
    formDataToSend.append("credentialType", formData.credentialType);
    formDataToSend.append("credentialNumber", formData.credentialNumber);

    if (files.patentAgentLicense) formDataToSend.append("patentAgentLicense", files.patentAgentLicense);
    if (files.lawCouncilId) formDataToSend.append("lawCouncilId", files.lawCouncilId);
    if (files.companyProof) formDataToSend.append("companyProof", files.companyProof);
    if (files.researchInstitutionProof) formDataToSend.append("researchInstitutionProof", files.researchInstitutionProof);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/analyst-registration/submit`,
        formDataToSend,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setSuccessMessage(response.data.message || "Request submitted successfully!");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      setTimeout(() => {
        navigate("/login", { state: { message: "Your analyst registration request has been submitted!", fromRegistration: true }, replace: true });
      }, 3000);
    } catch (error) {
      console.error("Submission error:", error);
  const errorMsg = error.response?.data?.error || 
                   error.response?.data || 
                   error.message || 
                   "Submission failed. Please try again.";
  setErrorMessage(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (fileName) => {
    if (!fileName) return null;
    const ext = fileName.split('.').pop().toLowerCase();
    if (ext === 'pdf') return <FileText className="text-red-500" size={20} />;
    return <FileText className="text-blue-500" size={20} />;
  };

  const renderStepContent = () => {
    const selectedType = credentialTypes.find(t => t.value === formData.credentialType);
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-2 rounded-lg border ${errors.firstName && touched.firstName ? "border-red-500 bg-red-50" : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"} focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white`}
                />
                {touched.firstName && errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-2 rounded-lg border ${errors.lastName && touched.lastName ? "border-red-500 bg-red-50" : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"} focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white`}
                />
                {touched.lastName && errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Work Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`w-full px-4 py-2 rounded-lg border ${errors.email && touched.email ? "border-red-500 bg-red-50" : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"} focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white`}
              />
              {touched.email && errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-2 rounded-lg border pr-10 ${errors.password && touched.password ? "border-red-500 bg-red-50" : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"} focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white`}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-2.5 text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {formData.password && (
                  <div className="mt-2">
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className={`h-full ${passwordStrength.color}`} style={{ width: passwordStrength.width }} />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{passwordStrength.label}</p>
                  </div>
                )}
                {touched.password && errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Confirm Password *</label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-2 rounded-lg border pr-10 ${errors.confirmPassword && touched.confirmPassword ? "border-red-500 bg-red-50" : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"} focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white`}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-2.5 text-gray-500"
                    onClick={() => setShowConfirm(!showConfirm)}
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {touched.confirmPassword && errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Credential Type *</label>
              <select
                name="credentialType"
                value={formData.credentialType}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
              >
                {credentialTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">{selectedType?.help}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Credential Number / License ID *</label>
              <input
                type="text"
                name="credentialNumber"
                value={formData.credentialNumber}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`w-full px-4 py-2 rounded-lg border ${errors.credentialNumber && touched.credentialNumber ? "border-red-500 bg-red-50" : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"} focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white`}
              />
              {touched.credentialNumber && errors.credentialNumber && <p className="text-red-500 text-xs mt-1">{errors.credentialNumber}</p>}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            {selectedType && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {selectedType.label} Document <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 transition">
                    <Upload size={20} className="text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {files[selectedType.requires]?.name || "Upload PDF/JPEG/PNG (Max 10MB)"}
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(e, selectedType.requires)}
                    />
                  </label>
                  {files[selectedType.requires] && getFileIcon(files[selectedType.requires].name)}
                </div>
                {errors[selectedType.requires] && <p className="text-red-500 text-xs mt-1">{errors[selectedType.requires]}</p>}
              </div>
            )}
            <p className="text-xs text-gray-400">Only PDF, JPEG, or PNG files under 10MB are accepted.</p>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4 text-cyan-50">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-cyan-50">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Review your details</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Name:</span>
                <span className="font-medium">{formData.firstName} {formData.lastName}</span>
                <span className="text-gray-500">Email:</span>
                <span>{formData.email}</span>
                <span className="text-gray-500">Credential Type:</span>
                <span>{selectedType?.label}</span>
                <span className="text-gray-500">Credential Number:</span>
                <span>{formData.credentialNumber}</span>
                <span className="text-gray-500">Document:</span>
                <span>{files[selectedType.requires]?.name || "Not uploaded"}</span>
              </div>
            </div>
            <p className="text-sm text-gray-500">Please verify all details before submitting.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Analyst Registration</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Submit your credentials for admin approval</p>
        </div>

        {/* Messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-2">
            <CheckCircle size={20} />
            <p>{successMessage}</p>
          </div>
        )}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
            <XCircle size={20} />
            <p>{errorMessage}</p>
          </div>
        )}

        {/* Stepper */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {steps.map((step, idx) => (
              <div key={idx} className="flex-1 text-center">
                <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-sm font-bold ${idx <= currentStep ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-500"}`}>
                  {idx + 1}
                </div>
                <p className={`text-xs mt-2 ${idx <= currentStep ? "text-blue-600" : "text-gray-500"}`}>{step.title}</p>
              </div>
            ))}
          </div>
          <div className="relative mt-2">
            <div className="absolute top-0 left-0 h-1 bg-gray-200 dark:bg-gray-700 w-full rounded-full"></div>
            <div className="absolute top-0 left-0 h-1 bg-blue-600 rounded-full transition-all" style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}></div>
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); if (currentStep === steps.length - 1) setShowConfirmModal(true); else nextStep(); }} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6">
          {renderStepContent()}

          {/* Navigation buttons */}
          <div className="flex justify-between pt-4 text-cyan-50">
            {currentStep > 0 && (
              <button type="button" onClick={prevStep} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-1">
                <ChevronLeft size={16}  c/> Back
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className={`ml-auto px-6 py-2 rounded-lg font-semibold text-white transition flex items-center gap-2 ${loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
            >
              {currentStep === steps.length - 1 ? (loading ? "Submitting..." : "Submit Request") : "Next"}
              {currentStep !== steps.length - 1 && <ChevronRight size={16} />}
            </button>
          </div>
        </form>

        <p className="text-sm text-center text-gray-500 dark:text-gray-400 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">Sign In</Link>
        </p>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Confirm Submission</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">Are you sure you want to submit your analyst registration request? Your application will be reviewed by an admin.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowConfirmModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-cyan-50">Cancel</button>
              <button onClick={() => { setShowConfirmModal(false); handleFinalSubmit(); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalystRegistration;