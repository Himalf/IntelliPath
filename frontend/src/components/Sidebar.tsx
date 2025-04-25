import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  FaBrain,
  FaHome,
  FaUser,
  FaFileAlt,
  FaBriefcase,
  FaBook,
  FaSignOutAlt,
  FaUsersCog,
  FaBars,
  FaChevronLeft,
} from "react-icons/fa";
import { useAuth } from "../features/auth/AuthContext";

export default function Sidebar() {
  const { logout, user } = useAuth();
  const role = user?.role;
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle window resize with proper state management
  useEffect(() => {
    const handleResize = () => {
      const mobileView = window.innerWidth < 768;
      setIsMobile(mobileView);

      // Only auto-collapse on initial mobile detection
      // Don't auto-expand when returning to desktop
      if (mobileView) {
        setCollapsed(true);
      }
    };

    handleResize(); // Check on initial render
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navItems = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: <FaHome className="w-5 h-5" />,
      roles: ["ADMIN", "SUPERADMIN", "USER"],
    },
    {
      path: "/dashboard/user-management",
      label: "User Management",
      icon: <FaUsersCog className="w-5 h-5" />,
      roles: ["SUPERADMIN"],
    },
    {
      path: "/dashboard/course",
      label: "Courses",
      icon: <FaBook className="w-5 h-5" />,
      roles: ["ADMIN", "SUPERADMIN"],
    },
    {
      path: "/dashboard/resume",
      label: "Resume Analysis",
      icon: <FaFileAlt className="w-5 h-5" />,
      roles: ["USER", "EXPERT", "SUPERADMIN"],
    },
    {
      path: "/dashboard/career",
      label: "Career Suggestions",
      icon: <FaBriefcase className="w-5 h-5" />,
      roles: ["USER", "EXPERT", "ADMIN", "SUPERADMIN"],
    },
    {
      path: "/dashboard/assistant",
      label: "AI Assistant",
      icon: <FaBrain className="w-5 h-5" />,
      roles: ["USER", "EXPERT", "ADMIN", "SUPERADMIN"],
    },
    {
      path: "/dashboard/feedback",
      label: "Feedback",
      icon: <FaUser className="w-5 h-5" />,
      roles: ["USER", "EXPERT"],
    },
  ];

  // Filter items based on user role
  const filteredNavItems = navItems.filter(
    (item) => role && item.roles.includes(role)
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && !collapsed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => setCollapsed(true)}
        />
      )}

      {/* Mobile Toggle Button */}
      {isMobile && collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="fixed top-4 left-4 z-30 p-2 rounded-md bg-gray-100 text-gray-800 shadow-md hover:bg-gray-200"
        >
          <FaBars className="w-5 h-5" />
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={`${
          collapsed
            ? isMobile
              ? "hidden"
              : "w-20"
            : isMobile
            ? "w-64 fixed left-0 top-0"
            : "w-64"
        } h-screen bg-white border-r border-gray-200 flex flex-col py-6 px-4 font-sans transition-all duration-300 ease-in-out z-30 shadow-lg`}
      >
        {/* Desktop Collapse Toggle Button */}
        {!isMobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-all"
          >
            <FaChevronLeft
              className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${
                collapsed ? "rotate-180" : ""
              }`}
            />
          </button>
        )}

        {/* Logo */}
        <div
          className={`flex items-center ${
            collapsed && !isMobile
              ? "justify-center"
              : "justify-center md:justify-start"
          } mb-10 animate-fade-in-up`}
        >
          <FaBrain className="w-8 h-8 text-blue-600 mr-2" />
          {!collapsed && (
            <h2 className="text-2xl font-bold text-gray-900">IntelliPath AI</h2>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 overflow-y-auto">
          {filteredNavItems.map((item, index) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center ${
                  collapsed && !isMobile ? "justify-center" : "gap-3 px-4"
                } py-3 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 ${
                  isActive
                    ? "bg-blue-50 text-blue-600 font-medium shadow-sm border-l-4 border-blue-600"
                    : ""
                } animate-fade-in-up`
              }
              style={{ animationDelay: `${(index + 1) * 75}ms` }}
              title={collapsed && !isMobile ? item.label : ""}
            >
              <div className={collapsed && !isMobile ? "mx-auto" : ""}>
                {item.icon}
              </div>
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <button
          onClick={logout}
          className={`flex items-center ${
            collapsed && !isMobile ? "justify-center" : "gap-2 px-4"
          } mt-auto py-3 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200 hover:shadow-md animate-fade-in-up`}
          style={{ animationDelay: "800ms" }}
          title={collapsed && !isMobile ? "Logout" : ""}
        >
          <FaSignOutAlt
            className={`w-5 h-5 ${collapsed && !isMobile ? "mx-auto" : ""}`}
          />
          {!collapsed && <span>Logout</span>}
        </button>
      </aside>
    </>
  );
}
