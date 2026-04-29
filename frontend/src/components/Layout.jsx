import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useUserContext } from "../context/UserContext.jsx";
import Footer from "./Footer.jsx";
import api from "../utils/api";

export default function Layout() {
  const { user, isAuthenticated, logout } = useUserContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [membershipStatus, setMembershipStatus] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated()) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // Auto-close the mobile drawer on route change
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const fetchMembershipStatus = async () => {
      if (user && user.role === "Student") {
        try {
          const res = await api.get("/teams/my-membership-status");
          setMembershipStatus(res.data.status);
        } catch {
          setMembershipStatus(null);
        }
      }
    };
    fetchMembershipStatus();
  }, [user]);

  // If not authenticated, don't render anything while redirecting
  if (!isAuthenticated()) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavClick = () => {
    setSidebarOpen(false);
  };

  // Role-based navigation
  const navItems = [
    { name: "Dashboard", path: "/dashboard" },
    ...(user?.role === "Owner"
      ? [
          { name: "Students Records", path: "/dashboard/listAll" },
          { name: "Teams", path: "/dashboard/teams" },
          { name: "Attendance", path: "/dashboard/attendance" },
          { name: "Approvals", path: "/dashboard/approvals" },
        ]
      : []),
    ...(user?.role === "Student"
      ? [
          { name: "Student Dashboard", path: "/dashboard/student" },
          ...(membershipStatus === "Approved"
            ? [{ name: "Attendance", path: "/dashboard/attendance" }]
            : []),
        ]
      : []),
    { name: "About", path: "/dashboard/about" },
  ];

  return (
    <div className="flex h-dvh bg-gray-100">
      {/* Mobile backdrop */}
      <button
        type="button"
        aria-label="Close navigation"
        onClick={() => setSidebarOpen(false)}
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden ${
          sidebarOpen ? "block" : "hidden"
        }`}
      />

      {/* Sidebar (desktop static, mobile drawer) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-black text-white flex flex-col py-6 px-4 shadow-lg transform transition-transform duration-200 md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:flex`}
      >
        <div className="text-2xl font-bold text-orange-500 mb-8 tracking-wide">ThinkCode</div>
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              onClick={handleNavClick}
              className="block py-2 px-4 rounded-lg transition-all duration-200 hover:bg-orange-500 hover:text-black"
            >
              {item.name}
            </Link>
          ))}
          <button
            onClick={() => {
              handleNavClick();
              handleLogout();
            }}
            className="block w-full text-left py-2 px-4 rounded-lg transition-all duration-200 hover:bg-orange-500 hover:text-black"
          >
            Logout
          </button>
        </nav>
      </aside>
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-black text-orange-500 py-4 px-8 shadow flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Open navigation"
              onClick={() => setSidebarOpen(true)}
              className="md:hidden inline-flex items-center justify-center rounded-lg border border-orange-500/40 px-3 py-2 text-orange-500 hover:bg-orange-500 hover:text-black transition"
            >
              <span className="text-lg leading-none">☰</span>
            </button>
            <div className="text-xl font-semibold">Attendance System</div>
          </div>
          <div className="text-white">
            {user ? `Welcome, ${user.username || user.email}` : "Welcome"}
          </div>
        </header>
        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
} 