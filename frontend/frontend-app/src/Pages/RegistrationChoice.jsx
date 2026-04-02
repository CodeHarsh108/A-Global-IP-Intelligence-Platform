// src/Pages/RegistrationChoice.jsx
import React from "react";
import { Link } from "react-router-dom";
import { User, Briefcase, ArrowRight } from "lucide-react";

const RegistrationChoice = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 flex items-center justify-center px-4">
      <div className="max-w-4xl w-full">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
            Join Global IP Intelligence
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Choose your account type to get started
          </p>
        </div>

        {/* Registration Options */}
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* User Registration Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 hover:shadow-2xl transition transform hover:-translate-y-1 border-2 border-blue-200 dark:border-blue-900">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-6 mx-auto">
              <User size={32} className="text-blue-600 dark:text-blue-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white text-center mb-3">
              Regular User
            </h2>
            
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
              Basic access to search and monitor patents & trademarks
            </p>
            
            <ul className="space-y-3 mb-8 text-gray-600 dark:text-gray-400">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Search patents and trademarks
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Subscribe to updates
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Basic alerts
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-gray-400">All Regular User Features</span>
              </li>
            </ul>
            
            <Link
              to="/register/user"
              className="block w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-center rounded-lg font-semibold transition flex items-center justify-center gap-2"
            >
              Register as User
              <ArrowRight size={18} />
            </Link>
            
            <p className="text-xs text-gray-400 text-center mt-4">
              Instant access upon registration
            </p>
          </div>

          {/* Analyst Registration Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border-2 border-purple-200 dark:border-purple-900 hover:shadow-2xl transition transform hover:-translate-y-1">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-6 mx-auto">
              <Briefcase size={32} className="text-purple-600 dark:text-purple-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white text-center mb-3">
              Analyst
            </h2>
            
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
              Advanced features for professionals and organizations
            </p>
            
            <ul className="space-y-3 mb-8 text-gray-600 dark:text-gray-400">
              <li className="flex items-center gap-2">
                <span className="text-purple-500">✓</span>
                All User features
              </li>
              <li className="flex items-center gap-2">
                <span className="text-purple-500">✓</span>
                Advanced analytics & trends
              </li>
              <li className="flex items-center gap-2">
                <span className="text-purple-500">✓</span>
                Data export & reports
              </li>
              <li className="flex items-center gap-2">
                <span className="text-purple-500">✓</span>
                Competitor tracking
              </li>
            </ul>
            
            <Link
              to="/register/analyst"
              className="block w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white text-center rounded-lg font-semibold transition flex items-center justify-center gap-2"
            >
              Register as Analyst
              <ArrowRight size={18} />
            </Link>
            
            <p className="text-xs text-gray-400 text-center mt-4">
              Requires admin approval (24-48 hours)
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-sm text-center text-gray-500 dark:text-gray-400 mt-12">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline font-medium">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegistrationChoice;