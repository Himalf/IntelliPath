import { useState, useEffect } from "react";
import { FaEllipsisV, FaSearch } from "react-icons/fa";
import courseService, { Course } from "@/services/CourseService";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { Edit, Trash2, View } from "lucide-react";
import { format } from "date-fns";
import { Pagination } from "../Pagination";
import CourseViewModal from "./CourseViewModal";

// Sortable Table Header component
interface SortableTableHeaderProps {
  label: string;
  column: string;
  sortColumn: string;
  sortDirection: "asc" | "desc";
  className?: string;
  onSort: (column: string) => void;
}

function SortableTableHeader({
  label,
  column,
  sortColumn,
  sortDirection,
  className = "",
  onSort,
}: SortableTableHeaderProps) {
  return (
    <th
      className={`px-4 py-3 cursor-pointer text-left text-xs uppercase ${className} ${
        sortColumn === column ? "text-blue-600 font-semibold" : "text-gray-500"
      }`}
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

interface Props {
  courses: Course[];
  onEdit: (course: Course) => void;
  onDelete: () => void;
}

export default function CourseTable({
  courses: initialCourses,
  onEdit,
  onDelete,
}: Props) {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 5;
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Sorting state
  const [sortColumn, setSortColumn] = useState<string>("title");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    setCourses(initialCourses);
  }, [initialCourses]);

  const handleDeleteCourse = async (id: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;
    try {
      await courseService.delete(id);
      onDelete();
    } catch {
      alert("Delete failed.");
    }
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

  // Filter courses based on search term
  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.tags ?? []).some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  // Sort courses
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    let aValue = a[sortColumn as keyof Course];
    let bValue = b[sortColumn as keyof Course];

    // Handle date comparison
    if (sortColumn === "createdAt") {
      aValue = aValue ? new Date(aValue as string).getTime().toString() : "0";
      bValue = bValue ? new Date(bValue as string).getTime().toString() : "0";
    }

    // Handle tags comparison
    if (sortColumn === "tags") {
      aValue = a.tags && a.tags.length > 0 ? a.tags[0] : "";
      bValue = b.tags && b.tags.length > 0 ? b.tags[0] : "";
    }

    if ((aValue ?? "") < (bValue ?? ""))
      return sortDirection === "asc" ? -1 : 1;
    if ((aValue ?? "") > (bValue ?? ""))
      return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // Calculate pagination
  const totalPages = Math.ceil(sortedCourses.length / coursesPerPage);
  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = sortedCourses.slice(
    indexOfFirstCourse,
    indexOfLastCourse
  );

  return (
    <div>
      {/* <div className="relative mb-4 flex items-center border border-gray-300 rounded-lg w-full sm:w-1/2 lg:w-1/3">
        <span className="absolute left-4 text-gray-500">
          <FaSearch />
        </span>
        <input
          className="w-full pl-12 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out"
          placeholder="Search courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div> */}

      <div className="overflow-auto">
        <table className="w-full table-auto text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase">
            <tr>
              <SortableTableHeader
                label="S.N."
                column="index"
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
              <SortableTableHeader
                label="Title"
                column="title"
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
              <SortableTableHeader
                label="Description"
                column="description"
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={handleSort}
                className="hidden lg:table-cell"
              />
              <SortableTableHeader
                label="Tags"
                column="tags"
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={handleSort}
                className="hidden md:table-cell"
              />
              <SortableTableHeader
                label="Created At"
                column="createdAt"
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={handleSort}
                className="hidden lg:table-cell"
              />
              <th className="px-4 py-3 text-center text-xs uppercase text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {currentCourses.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-400">
                  No courses found.
                </td>
              </tr>
            ) : (
              currentCourses.map((course, index) => (
                <tr
                  key={course._id}
                  className="hover:bg-gray-50 border-b border-gray-100"
                >
                  <td className="px-4 py-3">
                    {indexOfFirstCourse + index + 1}
                  </td>
                  <td className="px-4 py-3 font-medium">{course.title}</td>
                  <td className="px-4 py-3 max-w-md truncate hidden lg:table-cell">
                    {course.description}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {(course.tags ?? []).slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800"
                        >
                          {tag}
                        </span>
                      ))}
                      {(course.tags ?? []).length > 2 && (
                        <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">
                          +{(course.tags ?? []).length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {course.createdAt
                      ? format(new Date(course.createdAt), "yyyy-MM-dd")
                      : "N/A"}
                  </td>
                  <td className="px-4 py-3 text-center">
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
                          onClick={() => {
                            setSelectedCourse(course);
                            setIsViewModalOpen(true);
                          }}
                        >
                          <View className="w-4 h-4" /> View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center gap-2 p-2 text-sm hover:bg-gray-100 rounded"
                          onClick={() => onEdit(course)}
                        >
                          <Edit className="w-4 h-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="my-1 h-px bg-gray-200" />
                        <DropdownMenuItem
                          className="flex items-center gap-2 p-2 text-sm text-red-600 hover:bg-gray-100 rounded"
                          onClick={() => handleDeleteCourse(course._id)}
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
        <CourseViewModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          course={selectedCourse}
        />

        {filteredCourses.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
}
