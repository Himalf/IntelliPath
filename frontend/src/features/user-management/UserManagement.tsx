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

  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

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
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-blue-100 text-blue-800";
      case "SUPERADMIN":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <h2 className="text-xl sm:text-2xl font-bold">User Management</h2>
        <button
          onClick={handleAdd}
          className="bg-black text-white px-4 py-2 rounded flex items-center gap-2 text-sm hover:bg-gray-800"
        >
          <FaPlus size={14} /> Add User
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4 w-full sm:w-96">
        <span className="absolute top-3 left-3 text-gray-400">
          <FaSearch />
        </span>
        <input
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md outline-none text-sm"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded shadow-xs">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th
                  onClick={() => handleSort("fullName")}
                  className="px-4 py-3 text-left cursor-pointer"
                >
                  Name
                </th>
                <th
                  onClick={() => handleSort("email")}
                  className="px-4 py-3 text-left cursor-pointer hidden md:table-cell"
                >
                  Email
                </th>
                <th
                  onClick={() => handleSort("role")}
                  className="px-4 py-3 text-left cursor-pointer hidden sm:table-cell"
                >
                  Role
                </th>
                <th
                  onClick={() => handleSort("skills")}
                  className="px-4 py-3 text-left cursor-pointer hidden md:table-cell"
                >
                  Skills
                </th>
                <th
                  onClick={() => handleSort("createdAt")}
                  className="px-4 py-3 text-left cursor-pointer hidden md:table-cell"
                >
                  Created
                </th>
                <th className="px-4 py-3 text-center">Actions</th>
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
                  <tr key={user._id} className="   hover:bg-gray-50">
                    <td className="px-4 py-3">{user.fullName}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {user.email}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span
                        className={`px-2 py-1 rounded text-xs ${getRoleBadgeClass(
                          user.role
                        )}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {user.skills ? `${user.skills} +1` : "—"}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {user.createdAt
                        ? formatDate(new Date(user.createdAt), "yyyy-MM-dd")
                        : "N/A"}
                    </td>
                    <td className="px-4 py-3 flex justify-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-2 rounded-full hover:bg-gray-200">
                            <FaEllipsisV />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="bg-white rounded shadow-md p-1"
                        >
                          <DropdownMenuItem
                            onClick={() => handleViewUser(user)}
                            className="flex items-center gap-2 p-2 text-sm hover:bg-gray-100 rounded"
                          >
                            <View size={16} /> View
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEdit(user)}
                            className="flex items-center gap-2 p-2 text-sm hover:bg-gray-100 rounded"
                          >
                            <Edit size={16} /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteUser(user._id)}
                            className="flex items-center gap-2 p-2 text-sm text-red-600 hover:bg-gray-100 rounded"
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

          {/* Pagination */}
          {filteredUsers.length > 0 && (
            <div className="py-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      )}

      {/* Modals */}
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
