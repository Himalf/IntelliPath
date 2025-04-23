import { useAuth } from "../features/auth/AuthContext";

export default function Navbar() {
  const { user } = useAuth();
  return (
    <header className="w-full bg-white shadow px-6 py-4 flex items-center justify-between">
      <h1 className="text-xl font-semibold text-gray-800">IntelliPath</h1>
      <div className="text-sm text-gray-500">
        Welcome Back{" "}
        <span className="font-bold text-black"> {user?.fullName}</span>
      </div>
    </header>
  );
}
