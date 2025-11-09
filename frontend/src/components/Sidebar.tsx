import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaUsersCog,
  FaBook,
  FaFileAlt,
  FaBriefcase,
  FaBrain,
  FaUser,
  FaSignOutAlt,
} from "react-icons/fa";
import { useAuth } from "../features/auth/AuthContext";

interface SidebarProps {
  isMobile: boolean;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Sidebar({
  isMobile,
  sidebarOpen,
  setSidebarOpen,
}: SidebarProps) {
  const { logout, user } = useAuth();
  const role = user?.role;

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
      roles: ["ADMIN", "SUPERADMIN"],
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

  return (
    <>
      {/* Mobile overlay background */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full z-50 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
          isMobile
            ? sidebarOpen
              ? "translate-x-0 w-72"
              : "-translate-x-full w-0"
            : "translate-x-0 w-64"
        }`}
      >
        {/* Header */}
        <div className="px-6 py-6 flex items-center justify-between border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">IP</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">IntelliPath</h2>
          </div>
          {isMobile && (
            <button 
              onClick={() => setSidebarOpen(false)} 
              className="text-slate-400 hover:text-white transition-colors text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-700/50"
            >
              ×
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => isMobile && setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30"
                    : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                }`
              }
            >
              <span className="mr-3 text-base flex-shrink-0">
                {item.icon}
              </span>
              <span className="flex-1">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="px-3 py-4 border-t border-slate-700/50 space-y-2">
          {user && (
            <div className="px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <p className="text-xs text-slate-400 mb-1">Signed in as</p>
              <p className="text-sm font-semibold text-white capitalize truncate">
                {user.fullName || user.email?.split("@")[0] || "User"}
              </p>
              <p className="text-xs text-slate-500 mt-1 capitalize">
                {user.role?.toLowerCase() || "user"}
              </p>
            </div>
          )}
          <button
            onClick={logout}
            className="w-full flex items-center justify-center text-red-400 hover:text-red-300 hover:bg-red-500/10 px-4 py-3 rounded-lg border border-red-500/20 hover:border-red-500/40 transition-all duration-200 font-medium text-sm"
          >
            <FaSignOutAlt className="mr-2" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
