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
import { formatDate } from "date-fns";
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
    if (!confirm("Are you sure?")) return;
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
      // Toggle direction if same column
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Set new column and default to ascending
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-blue-100 text-blue-800";
      case "superadmin":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(
    (user) =>
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort users
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let aValue = a[sortColumn as keyof User];
    let bValue = b[sortColumn as keyof User];

    // Handle date comparison
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

  // Calculate pagination
  const totalPages = Math.ceil(sortedUsers.length / usersPerPage);
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = sortedUsers.slice(indexOfFirstUser, indexOfLastUser);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">User Management</h2>
        <button
          onClick={handleAdd}
          className="bg-black text-white px-4 py-2 rounded flex items-center gap-2 cursor-pointer"
        >
          <FaPlus size={14} /> Add User
        </button>
      </div>

      <div className="relative mb-4 flex items-center border border-gray-300 rounded-md w-fit">
        <span className="text-gray-400 items-center ml-3">
          <FaSearch />
        </span>
        <input
          className="w-full outline-none p-2 px-8 border-none text-sm"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase">
              <tr>
                <th
                  onClick={() => handleSort("fullName")}
                  className="cursor-pointer px-4 py-3 text-xs font-semibold text-gray-500"
                >
                  Name
                </th>
                <th
                  onClick={() => handleSort("email")}
                  className="cursor-pointer px-4 py-3 text-xs font-semibold text-gray-500"
                >
                  Email
                </th>
                <th
                  onClick={() => handleSort("role")}
                  className="cursor-pointer px-4 py-3 text-xs font-semibold text-gray-500 hidden sm:table-cell"
                >
                  Role
                </th>
                <th
                  onClick={() => handleSort("skills")}
                  className="cursor-pointer px-4 py-3 text-xs font-semibold text-gray-500 hidden md:table-cell"
                >
                  Skills
                </th>
                <th
                  onClick={() => handleSort("createdAt")}
                  className="cursor-pointer px-4 py-3 text-xs font-semibold text-gray-500 hidden md:table-cell"
                >
                  Created
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-gray-400">
                    No users found.
                  </td>
                </tr>
              ) : (
                currentUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-gray-50 border-b border-gray-100"
                  >
                    <td className="px-4 py-3">{user.fullName}</td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs hidden sm:table-cell ${getRoleBadgeClass(
                          user.role
                        )}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {user.skills ? (
                        <>
                          {user.skills}{" "}
                          <span className="text-blue-500">+1</span>
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {user.createdAt
                        ? formatDate(new Date(user.createdAt), "yyyy-MM-dd")
                        : "N/A"}
                    </td>
                    <td className="px-4 py-3 text-center justify-center flex">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="text-gray-500 hover:text-gray-800 cursor-pointer">
                            <FaEllipsisV />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          className="bg-white shadow-lg rounded p-1 cursor-pointer"
                          align="end"
                        >
                          <DropdownMenuItem
                            className="flex items-center gap-2 p-2 text-sm hover:bg-gray-100 rounded"
                            onClick={() => handleViewUser(user)}
                          >
                            <View className="w-4 h-4" /> View
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="flex items-center gap-2 p-2 text-sm hover:bg-gray-100 rounded"
                            onClick={() => handleEdit(user)}
                          >
                            <Edit className="w-4 h-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="my-1 h-px bg-gray-200" />
                          <DropdownMenuItem
                            className="flex items-center gap-2 p-2 text-sm text-red-600 hover:bg-gray-100 rounded"
                            onClick={() => handleDeleteUser(user._id)}
                          >
                            <Trash2 className="w-4 h-4" /> Delete
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
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
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
