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

// Sortable Table Header component
interface SortableTableHeaderProps {
  label: string;
  column: string;
  sortColumn: string;
  sortDirection: "asc" | "desc";
  onSort: (column: string) => void;
  className?: string;
}

function SortableTableHeader({
  label,
  column,
  sortColumn,
  sortDirection,
  onSort,
  className = "",
}: SortableTableHeaderProps) {
  return (
    <th
      className={`px-2 py-2 cursor-pointer text-left text-xs uppercase ${
        sortColumn === column ? "text-blue-600 font-semibold" : "text-gray-500"
      } ${className}`}
      onClick={() => onSort(column)}
    >
      <div className="flex items-center gap-1">
        {label}
        {sortColumn === column ? (
          <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
        ) : null}
      </div>
    </th>
  );
}

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
    <div className="p-2 sm:p-4 md:p-6">
      {/* Header and controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <h2 className="text-xl sm:text-2xl font-bold">User Management</h2>
        <button
          onClick={handleAdd}
          className="bg-black text-white px-3 py-2 rounded flex items-center gap-2 text-sm cursor-pointer w-full sm:w-auto justify-center"
        >
          <FaPlus size={14} /> Add User
        </button>
      </div>

      {/* Search input */}
      <div className="relative mb-4 flex items-center border border-gray-300 rounded-md w-full sm:w-fit">
        <span className="text-gray-400 items-center ml-3">
          <FaSearch />
        </span>
        <input
          className="w-full sm:w-64 outline-none p-2 px-8 border-none text-sm"
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
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <SortableTableHeader
                      label="Name"
                      column="fullName"
                      sortColumn={sortColumn}
                      sortDirection={sortDirection}
                      onSort={handleSort}
                      className="font-medium"
                    />
                    <SortableTableHeader
                      label="Email"
                      column="email"
                      sortColumn={sortColumn}
                      sortDirection={sortDirection}
                      onSort={handleSort}
                      className="hidden sm:table-cell"
                    />
                    <SortableTableHeader
                      label="Role"
                      column="role"
                      sortColumn={sortColumn}
                      sortDirection={sortDirection}
                      onSort={handleSort}
                    />
                    <SortableTableHeader
                      label="Skills"
                      column="skills"
                      sortColumn={sortColumn}
                      sortDirection={sortDirection}
                      onSort={handleSort}
                      className="hidden md:table-cell"
                    />
                    <SortableTableHeader
                      label="Created"
                      column="createdAt"
                      sortColumn={sortColumn}
                      sortDirection={sortDirection}
                      onSort={handleSort}
                      className="hidden lg:table-cell"
                    />
                    <th className="px-2 py-2 text-center text-xs uppercase text-gray-500 relative">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentUsers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-4 text-gray-400"
                      >
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    currentUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-2 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {user.fullName}
                          </div>
                          <div className="text-xs text-gray-500 sm:hidden">
                            {user.email}
                          </div>
                        </td>
                        <td className="px-2 py-3 whitespace-nowrap hidden sm:table-cell">
                          <div className="text-sm text-gray-900">
                            {user.email}
                          </div>
                        </td>
                        <td className="px-2 py-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeClass(
                              user.role
                            )}`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-2 py-3 whitespace-nowrap hidden md:table-cell">
                          <div className="text-sm text-gray-900">
                            {user.skills ? (
                              <>
                                {user.skills}{" "}
                                <span className="text-blue-500">+1</span>
                              </>
                            ) : (
                              "—"
                            )}
                          </div>
                        </td>
                        <td className="px-2 py-3 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                          {user.createdAt
                            ? formatDate(new Date(user.createdAt), "yyyy-MM-dd")
                            : "N/A"}
                        </td>
                        <td className="px-2 py-3 whitespace-nowrap text-right text-sm font-medium">
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
            </div>
          </div>
        </div>
      )}

      {filteredUsers.length > 0 && (
        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
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
