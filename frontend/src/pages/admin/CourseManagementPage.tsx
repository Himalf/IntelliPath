import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import courseService, { Course } from "@/services/CourseService";
import CourseTable from "@/components/admin/CourseTable";
import CourseModal from "@/components/admin/CourseModal";

export default function CourseManagementPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const fetchCourses = async () => {
    const res = await courseService.getAll();
    setCourses(res);
  };

  const handleEdit = (course: Course) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    setSelectedCourse(null);
    fetchCourses();
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <div className="p-6  mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Manage Courses</h1>
        <Button onClick={() => setIsModalOpen(true)}>Add Course</Button>
      </div>

      <CourseTable
        courses={courses}
        onEdit={handleEdit}
        onDelete={fetchCourses}
      />

      <CourseModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCourse(null);
        }}
        course={selectedCourse}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
