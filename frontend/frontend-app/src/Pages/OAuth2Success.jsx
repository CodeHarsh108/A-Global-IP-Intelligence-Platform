import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

const OAuth2Success = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { fetchProfile } = useAuth();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get("token");

        if (token) {
            console.log("✅ OAuth2 token received");
            localStorage.setItem("accessToken", token);
            localStorage.setItem("tokenType", "Bearer");

            const handleSuccess = async () => {
                try {
                    const result = await fetchProfile();
                    if (result.success) {
                        const rolePath = {
                            'ADMIN': '/admin-dashboard',
                            'ANALYST': '/analyst-dashboard',
                            'USER': '/user-dashboard'
                        };
                        const targetPath = rolePath[result.user.role] || "/user-dashboard";
                        console.log("🚀 Redirecting to:", targetPath);
                        navigate(targetPath);
                    } else {
                        console.error("❌ Profile fetch failed:", result.error);
                        navigate("/login", { state: { error: "Failed to fetch user profile: " + result.error } });
                    }
                } catch (err) {
                    console.error("❌ OAuth2 Error:", err);
                    navigate("/login", { state: { error: "An error occurred during social login." } });
                }
            };

            handleSuccess();
        } else {
            console.error("❌ No token found in OAuth2 redirect");
            navigate("/login", { state: { error: "Social login failed. No token received." } });
        }
    }, [location, navigate, fetchProfile]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                Completing social login...
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
                Please wait while we redirect you.
            </p>
        </div>
    );
};

export default OAuth2Success;
