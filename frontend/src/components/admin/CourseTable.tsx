import { Button } from "@/components/ui/button";
import courseService, { Course } from "@/services/CourseService";

interface Props {
  courses: Course[];
  onEdit: (course: Course) => void;
  onDelete: () => void;
}

export default function CourseTable({ courses, onEdit, onDelete }: Props) {
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this course?")) {
      await courseService.delete(id);
      onDelete();
    }
  };

  return (
    <div className="bg-white rounded-md border">
      <table className="w-full text-sm">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="text-left p-2">Title</th>
            <th className="text-left p-2">Description</th>
            <th className="text-left p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => (
            <tr key={course._id} className="border-t">
              <td className="p-2 font-medium">{course.title}</td>
              <td className="p-2">{course.description}</td>
              <td className="p-2 space-x-2">
                <Button
                  onClick={() => onEdit(course)}
                  variant="outline"
                  size="sm"
                >
                  Edit
                </Button>
                <Button
                  onClick={() => handleDelete(course._id)}
                  variant="destructive"
                  size="sm"
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
