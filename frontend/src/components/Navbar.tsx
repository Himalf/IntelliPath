import { FaBars } from "react-icons/fa";
import { useAuth } from "../features/auth/AuthContext";

export default function Navbar({
  toggleSidebar,
}: {
  toggleSidebar: () => void;
}) {
  const { user } = useAuth();

  return (
    <header className="bg-white shadow px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          className="sm:hidden text-gray-600 hover:text-indigo-600"
          onClick={toggleSidebar}
        >
          <FaBars className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-semibold text-gray-800">IntelliPath AI</h1>
      </div>
      <div className="text-sm text-gray-500">
        Welcome Back{" "}
        <span className="font-bold text-black ml-1">{user?.fullName}</span>
      </div>
    </header>
  );
}
