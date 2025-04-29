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
} from "react-icons/fa";
import { useAuth } from "../features/auth/AuthContext";

export default function Sidebar() {
  const { logout, user } = useAuth();
  const role = user?.role;
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setCollapsed(true);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navItems = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: <FaHome />,
      roles: ["ADMIN", "SUPERADMIN", "USER"],
    },
    {
      path: "/dashboard/user-management",
      label: "User Management",
      icon: <FaUsersCog />,
      roles: ["SUPERADMIN", "ADMIN"],
    },
    {
      path: "/dashboard/course",
      label: "Courses",
      icon: <FaBook />,
      roles: ["ADMIN", "SUPERADMIN"],
    },
    {
      path: "/dashboard/resume",
      label: "Resume Analysis",
      icon: <FaFileAlt />,
      roles: ["USER", "EXPERT", "ADMIN"],
    },
    {
      path: "/dashboard/career",
      label: "Career Suggestions",
      icon: <FaBriefcase />,
      roles: ["USER", "EXPERT", "ADMIN"],
    },
    {
      path: "/dashboard/assistant",
      label: "AI Assistant",
      icon: <FaBrain />,
      roles: ["USER", "EXPERT", "ADMIN", "SUPERADMIN"],
    },
    {
      path: "/dashboard/feedback",
      label: "Feedback",
      icon: <FaUser />,
      roles: ["USER", "EXPERT"],
    },
  ];

  const filteredNavItems = navItems.filter(
    (item) => role && item.roles.includes(role)
  );
  const sidebarWidth = collapsed ? (isMobile ? 0 : 72) : 256;

  return (
    <>
      {/* Overlay on Mobile */}
      {isMobile && !collapsed && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50"
          onClick={() => setCollapsed(true)}
        />
      )}
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full z-30 bg-white border-r border-gray-200 shadow-lg transition-all duration-300 ease-in-out`}
        style={{ width: `${sidebarWidth}px` }}
      >
        {/* Header */}
        <div
          className={`flex items-center px-4 py-6 ${
            collapsed ? "justify-center" : "justify-between"
          }`}
        >
          <div
            className="flex items-center cursor-pointer"
            onClick={() => setCollapsed(!collapsed)}
          >
            <FaBrain className="text-indigo-600 w-8 h-8 ml-2" />
            {!collapsed && (
              <h2 className="ml-2 text-xl font-bold text-gray-900">
                IntelliPath AI
              </h2>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col px-2 overflow-y-auto">
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center py-3 px-4 rounded-lg text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200 ${
                  collapsed ? "justify-center" : "gap-3"
                } ${isActive ? "bg-indigo-50 text-indigo-600 font-medium" : ""}`
              }
              title={collapsed ? item.label : ""}
            >
              <span className="">{item.icon}</span>
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="mt-10 px-2 pb-6">
          <button
            onClick={logout}
            className={`w-full flex items-center py-3 text-red-500 hover:bg-red-50 rounded-lg ${
              collapsed ? "justify-center" : "gap-2 px-4"
            }`}
            title={collapsed ? "Logout" : ""}
          >
            <FaSignOutAlt />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
