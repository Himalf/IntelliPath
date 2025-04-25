import { useAuth } from "../features/auth/AuthContext";
export default function Navbar() {
  const { user } = useAuth();
  return (
    <header className="w-full bg-white shadow px-6 py-6 flex items-center justify-between  sticky top-0 ">
      <h1 className="text-xl font-semibold text-gray-800"></h1>
      <div className="text-sm text-gray-500">
        Welcome Back
        <span className="font-bold text-black"> {user?.fullName}</span>
      </div>
    </header>
  );
}
