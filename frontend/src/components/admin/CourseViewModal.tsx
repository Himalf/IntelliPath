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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl max-h-[90vh] rounded-lg shadow-lg relative p-4 sm:p-6 overflow-y-auto animate-fade-in-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <h2 className="text-lg sm:text-xl font-semibold mb-3">
          {course.title}
        </h2>

        {/* Description */}
        <p className="mb-3 text-sm sm:text-base text-gray-600">
          {course.description}
        </p>

        {/* URL */}
        {course.url && (
          <p className="mb-3 text-sm sm:text-base">
            <span className="font-medium">URL: </span>
            <a
              href={course.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline break-words"
            >
              {course.url}
            </a>
          </p>
        )}

        {/* Tags */}
        {(course.tags ?? []).length > 0 && (
          <div className="mb-4">
            <span className="font-medium">Tags:</span>
            <div className="flex flex-wrap gap-2 mt-2">
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

        {/* Created At */}
        {course.createdAt && (
          <p className="text-xs sm:text-sm text-gray-500 mt-2">
            <span className="font-medium">Created At: </span>
            {new Date(course.createdAt).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
}
