import { useState, useEffect } from "react";
import { FaEllipsisV, FaPlus, FaSearch } from "react-icons/fa";
import userService, { User } from "../../services/userService";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { Edit, Trash2, View } from "lucide-react";
import UserModal from "./UserModal";
import { format } from "date-fns";
import ViewUserDetailsModal from "./ViewDetailsModal";
import { Pagination } from "@/components/Pagination";

export default function UserManagementTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [viewUserModalOpen, setViewUserModalOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  // Sorting state
  const [sortColumn, setSortColumn] = useState<string>("fullName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await userService.deleteUser(id);
      setUsers(users.filter((u) => u._id !== id));
    } catch {
      alert("Delete failed.");
    }
  };

  const handleViewUser = (user: User) => {
    setViewingUser(user);
    setViewUserModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedUser(null);
    setModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-blue-100 text-blue-700";
      case "superadmin":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let aValue = a[sortColumn as keyof User];
    let bValue = b[sortColumn as keyof User];

    if (sortColumn === "createdAt") {
      aValue = aValue ? new Date(aValue as any).getTime().toString() : "0";
      bValue = bValue ? new Date(bValue).getTime().toString() : "0";
    }

    if ((aValue ?? "") < (bValue ?? ""))
      return sortDirection === "asc" ? -1 : 1;
    if ((aValue ?? "") > (bValue ?? ""))
      return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedUsers.length / usersPerPage);
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = sortedUsers.slice(indexOfFirstUser, indexOfLastUser);

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-3">
        <h2 className="text-xl sm:text-2xl font-bold">User Management</h2>
        <button
          onClick={handleAdd}
          className="bg-black hover:bg-gray-900 text-white px-4 py-2 rounded-md flex items-center gap-2"
        >
          <FaPlus size={14} /> Add User
        </button>
      </div>

      <div className="relative mb-6 w-full max-w-xs">
        <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
          <span className="pl-3 text-gray-400">
            <FaSearch />
          </span>
          <input
            className="w-full p-2 pl-8 text-sm outline-none"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto text-sm">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
              <tr>
                <th
                  onClick={() => handleSort("fullName")}
                  className="p-3 cursor-pointer text-left"
                >
                  Name
                </th>
                <th
                  onClick={() => handleSort("email")}
                  className="p-3 cursor-pointer text-left hidden sm:table-cell"
                >
                  Email
                </th>
                <th
                  onClick={() => handleSort("role")}
                  className="p-3 cursor-pointer text-left hidden md:table-cell"
                >
                  Role
                </th>
                <th
                  onClick={() => handleSort("skills")}
                  className="p-3 cursor-pointer text-left hidden md:table-cell"
                >
                  Skills
                </th>
                <th
                  onClick={() => handleSort("createdAt")}
                  className="p-3 cursor-pointer text-left hidden lg:table-cell"
                >
                  Created
                </th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-gray-400">
                    No users found.
                  </td>
                </tr>
              ) : (
                currentUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition">
                    <td className="p-3">{user.fullName}</td>
                    <td className="p-3 hidden sm:table-cell">{user.email}</td>
                    <td className="p-3 hidden md:table-cell">
                      <span
                        className={`px-2 py-1 rounded text-xs ${getRoleBadgeClass(
                          user.role
                        )}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="p-3 hidden md:table-cell">
                      {user.skills ?? "—"}
                    </td>
                    <td className="p-3 hidden lg:table-cell">
                      {user.createdAt
                        ? format(new Date(user.createdAt), "yyyy-MM-dd")
                        : "N/A"}
                    </td>
                    <td className="p-3 flex justify-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="text-gray-500 hover:text-gray-700">
                            <FaEllipsisV />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="bg-white rounded-md shadow-lg py-1 z-50 w-32"
                        >
                          <DropdownMenuItem
                            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 text-sm cursor-pointer"
                            onClick={() => handleViewUser(user)}
                          >
                            <View size={16} /> View
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 text-sm cursor-pointer"
                            onClick={() => handleEdit(user)}
                          >
                            <Edit size={16} /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 text-sm text-red-600 cursor-pointer"
                            onClick={() => handleDeleteUser(user._id)}
                          >
                            <Trash2 size={16} /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {filteredUsers.length > 0 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      )}

      <ViewUserDetailsModal
        isOpen={viewUserModalOpen}
        onClose={() => setViewUserModalOpen(false)}
        user={viewingUser}
      />

      <UserModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        user={selectedUser}
        refreshUsers={fetchUsers}
      />
    </div>
  );
}
