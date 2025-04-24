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
  const { logout, user } = useAuth(); // assume user has role
  const role = user?.role;

  const navItems = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: <FaHome className="w-5 h-5" />,
      roles: ["STUDENT", "EXPERT", "ADMIN", "SUPERADMIN"],
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
      roles: ["STUDENT", "EXPERT", "ADMIN", "SUPERADMIN"],
    },
    {
      path: "/dashboard/resume",
      label: "Resume Analysis",
      icon: <FaFileAlt className="w-5 h-5" />,
      roles: ["STUDENT", "EXPERT", "SUPERADMIN"],
    },
    {
      path: "/dashboard/career",
      label: "Career Suggestions",
      icon: <FaBriefcase className="w-5 h-5" />,
      roles: ["STUDENT", "EXPERT", "ADMIN", "SUPERADMIN"],
    },

    {
      path: "/dashboard/assistant",
      label: "AI Assistant",
      icon: <FaBrain className="w-5 h-5" />,
      roles: ["STUDENT", "EXPERT", "ADMIN", "SUPERADMIN"],
    },
    {
      path: "/dashboard/feedback",
      label: "Feedback",
      icon: <FaUser className="w-5 h-5" />,
      roles: ["STUDENT", "EXPERT", "ADMIN", "SUPERADMIN"],
    },
  ];

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col py-6 px-4 font-sans">
      {/* Logo */}
      <div className="flex items-center justify-center mb-10 animate-fade-in-up">
        <FaBrain className="w-8 h-8 text-gray-900 mr-2" />
        <h2 className="text-2xl font-bold text-gray-900">IntelliPath AI</h2>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navItems
          .filter((item) => role && item.roles.includes(role)) // only show items allowed for this role
          .map((item, index) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-lg text-gray-900 hover:bg-gray-100 transition-transform hover:scale-105 ${
                  isActive ? "bg-gray-200 shadow-sm" : ""
                } animate-fade-in-up`
              }
              style={{ animationDelay: `${(index + 1) * 100}ms` }}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
      </nav>

      {/* Logout */}
      <button
        onClick={logout}
        className="flex items-center gap-2 mt-auto px-4 py-2 rounded-lg bg-gradient-to-r from-red-600 to-red-700 text-white font-medium hover:from-red-700 hover:to-red-800 transition-transform hover:scale-105 shadow-sm animate-fade-in-up"
        style={{ animationDelay: "800ms" }}
      >
        <FaSignOutAlt className="w-5 h-5" />
        Logout
      </button>
    </aside>
  );
}
