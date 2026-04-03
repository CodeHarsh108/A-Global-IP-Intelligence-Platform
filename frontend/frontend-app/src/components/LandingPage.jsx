import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // adjust path if needed
import {
  Search,
  BarChart3,
  Bell,
  Globe,
  Shield,
  TrendingUp,
  ArrowRight
} from "lucide-react";

const LandingPage = () => {
  const { isAuthenticated, getDashboardPath } = useAuth();

  return (
    <div className="bg-white dark:bg-gray-950 text-gray-900 dark:text-white">

      {/* ================= NAVBAR ================= */}
      <header className="fixed w-full z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

          <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
            Global IP Intelligence
          </h1>

          <nav className="hidden md:flex gap-8 text-sm font-medium">
            <a href="#features" className="hover:text-blue-600 transition">Features</a>
            <Link
              to={isAuthenticated ? getDashboardPath() : "/register"}
              className="hover:text-blue-600 transition"
            >
              Platform
            </Link>
            <a href="#usecases" className="hover:text-blue-600 transition">Use Cases</a>
          </nav>

          <div className="hidden md:flex gap-4">
            <Link
              to="/login"
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
            >
              Get Started
            </Link>
          </div>

        </div>
      </header>

      {/* ================= HERO ================= */}
      <section className="pt-40 pb-28 px-6 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="max-w-6xl mx-auto text-center">

          <span className="inline-block mb-6 px-4 py-1 text-sm bg-blue-100 text-blue-700 rounded-full">
            Enterprise IP Monitoring Platform
          </span>

          <h2 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            Make Smarter Decisions with <br />
            <span className="text-blue-600">Global IP Intelligence</span>
          </h2>

          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-10">
            Monitor patents and trademarks worldwide, analyze competitor filings,
            track legal status changes, and visualize IP landscapes — all in one unified platform.
          </p>

          

        </div>
      </section>

      {/* ================= STATS SECTION ================= */}
      <section className="py-20 px-6 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-10 text-center">
          {[
            { value: "100+", label: "Global Jurisdictions" },
            { value: "1M+", label: "Patent Records Indexed" },
            { value: "24/7", label: "Monitoring & Alerts" },
            { value: "Enterprise", label: "Security Standards" }
          ].map((stat, i) => (
            <div key={i}>
              <h3 className="text-3xl font-bold text-blue-600">{stat.value}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section id="features" className="py-24 bg-gray-50 dark:bg-gray-900 px-6">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <h3 className="text-4xl font-bold mb-4">Core Capabilities</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Everything required to manage and analyze intellectual property activity.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {[
            {
              icon: <Search size={28} />,
              title: "Advanced Search",
              desc: "Search patents and trademarks by keyword, assignee, inventor, jurisdiction, or classification."
            },
            {
              icon: <TrendingUp size={28} />,
              title: "Competitor Monitoring",
              desc: "Track competitor filings and receive alerts on new IP activity."
            },
            {
              icon: <BarChart3 size={28} />,
              title: "IP Landscape Analytics",
              desc: "Interactive dashboards to analyze filing trends and legal status."
            },
            {
              icon: <Bell size={28} />,
              title: "Real-Time Alerts",
              desc: "Custom notifications for filing updates and legal status changes."
            },
            {
              icon: <Globe size={28} />,
              title: "Global Coverage",
              desc: "Integrated international IP databases for comprehensive research."
            },
            {
              icon: <Shield size={28} />,
              title: "Secure Access",
              desc: "Enterprise-grade authentication and secure data management."
            }
          ].map((feature, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 hover:shadow-xl transition duration-300"
            >
              <div className="text-blue-600 mb-4">{feature.icon}</div>
              <h4 className="font-semibold text-lg mb-3">{feature.title}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= USE CASES ================= */}
      <section id="usecases" className="py-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h3 className="text-4xl font-bold mb-6">Who Benefits?</h3>
          <div className="grid md:grid-cols-3 gap-10 text-left mt-12">
            <div>
              <h4 className="font-semibold text-lg mb-2">Innovators & Startups</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Protect inventions and monitor competitive patent landscapes.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-2">Law Firms</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Conduct structured patent research and track legal developments.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-2">R&D Teams</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Identify technology trends and strategic innovation opportunities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900 text-center px-6">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-4xl font-bold mb-6">Ready to Unlock Global IP Insights?</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Start monitoring patents, trademarks, and competitor filings in real time.
          </p>
          <button className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition" onClick={() => window.location.href = isAuthenticated ? getDashboardPath() : "/register"}>
            Get Started Today
          </button>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="py-10 text-center border-t border-gray-200 dark:border-gray-800">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          © 2026 Global IP Intelligence Platform. All rights reserved.
        </p>
      </footer>

    </div>
  );
};

export default LandingPage;