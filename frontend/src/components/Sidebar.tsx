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
        className={`fixed top-0 left-0 h-full z-50 bg-white border-r shadow-md transform transition-transform duration-300 delay-200 ease-in-out ${
          isMobile
            ? sidebarOpen
              ? "translate-x-0 ease-in-out duration-200 delay-100"
              : "-translate-x-full ease-in-out duration-200 delay-100"
            : "translate-x-0 w-64"
        }`}
        style={{ width: isMobile ? "50%" : "256px" }}
      >
        <div className="px-4 py-6 flex items-center justify-between border-b">
          <h2 className="text-lg font-bold text-indigo-600">IntelliPath AI</h2>
          {isMobile && (
            <button onClick={() => setSidebarOpen(false)} className="text-xl">
              ×
            </button>
          )}
        </div>

        <nav className="p-2 space-y-1">
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => isMobile && setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-lg text-gray-700 hover:bg-indigo-50 transition ${
                  isActive ? "bg-indigo-100 font-semibold text-indigo-600" : ""
                }`
              }
            >
              <span className="mr-3">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto px-4 py-4">
          <button
            onClick={logout}
            className="w-full flex items-center text-red-600 hover:bg-red-50 px-4 py-3 rounded-lg"
          >
            <FaSignOutAlt className="mr-2" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
