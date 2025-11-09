import { FaBars } from "react-icons/fa";
import { useAuth } from "../features/auth/AuthContext";
import { Bell, Search } from "lucide-react";

export default function Navbar({
  toggleSidebar,
}: {
  toggleSidebar: () => void;
}) {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between sticky top-0 z-30 backdrop-blur-sm bg-white/95">
      <div className="flex items-center gap-4 flex-1">
        <button
          className="lg:hidden text-gray-600 hover:text-indigo-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <FaBars className="w-5 h-5" />
        </button>
        
        {/* Search Bar - Hidden on mobile */}
        <div className="hidden md:flex flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-gray-50 hover:bg-white transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Notifications - Hidden on mobile */}
        <button className="hidden sm:flex relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        {/* User Info */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-gray-900 capitalize">
              {user?.fullName || user?.email?.split("@")[0] || "User"}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {user?.role?.toLowerCase() || "user"}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md ring-2 ring-white">
            <span className="text-white font-semibold text-sm">
              {user?.fullName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
