import { X } from "lucide-react";
import { Course } from "@/services/CourseService";

interface CourseViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course | null;
}

export default function CourseViewModal({
  isOpen,
  onClose,
  course,
}: CourseViewModalProps) {
  if (!isOpen || !course) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white max-w-xl w-full max-h-[90vh] rounded-lg shadow-lg relative p-6 overflow-y-auto animate-fade-in-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <X />
        </button>
        <h2 className="text-xl font-semibold mb-4">{course.title}</h2>
        <p className="mb-3 text-sm text-gray-600">{course.description}</p>

        {course.url && (
          <p className="mb-2">
            <span className="font-medium">URL: </span>
            <a
              href={course.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              {course.url}
            </a>
          </p>
        )}

        {(course.tags ?? []).length > 0 && (
          <div className="mb-3">
            <span className="font-medium">Tags: </span>
            <div className="flex flex-wrap gap-2 mt-1">
              {(course.tags ?? []).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {course.createdAt && (
          <p className="text-sm text-gray-500 mt-2">
            <span className="font-medium">Created At: </span>
            {new Date(course.createdAt).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
}
