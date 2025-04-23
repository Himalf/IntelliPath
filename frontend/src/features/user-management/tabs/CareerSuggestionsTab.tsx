import { CareerSuggestion } from "@/services/careerSuggestionService";
import { BookOpen } from "lucide-react";

export default function CareerSuggestionsTab({
  suggestion,
}: {
  suggestion: CareerSuggestion | null;
}) {
  if (!suggestion) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <svg
          className="w-12 h-12 mb-4 text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9.75 3.104V5.25h4.5V3.104c0-.703-.226-1.385-.647-1.954L12 0l-1.603 1.15a3.49 3.49 0 00-.647 1.954zm-4.5 0V5.25h-1.5c-1.5 0-2.25.75-2.25 2.25v11.25c0 1.5.75 2.25 2.25 2.25h16.5c1.5 0 2.25-.75 2.25-2.25V7.5c0-1.5-.75-2.25-2.25-2.25h-1.5V3.104c0-1.178-.379-2.325-1.08-3.274L15.44 0l-1.209.866A5.47 5.47 0 0014.25 3.104v2.146h-4.5V3.104c0-.703.226-1.385.647-1.954L12 0l1.603 1.15a3.49 3.49 0 01.647 1.954V5.25h1.5c.75 0 .75.75.75 1.5v10.5c0 .75 0 1.5-.75 1.5h-10.5c-.75 0-.75-.75-.75-1.5V6.75c0-.75 0-1.5.75-1.5h1.5V3.104z"
          />
        </svg>
        <p className="text-lg">No career suggestions available</p>
        <p className="mt-2 text-sm">
          User hasn't received career recommendations yet
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="bg-blue-50 p-6 rounded-lg border border-blue-100">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">
          Suggested Career Paths
        </h3>
        <p className="text-gray-700 leading-relaxed">
          {suggestion.suggestedCareers}
        </p>
      </section>

      <section className="bg-amber-50 p-6 rounded-lg border border-amber-100">
        <h3 className="text-lg font-semibold text-amber-800 mb-3">
          Skill Gap Analysis
        </h3>
        <p className="text-gray-700 leading-relaxed">
          {suggestion.skillGapAnalysis}
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <BookOpen className="w-5 h-5 mr-2 text-green-600" />
          Recommended Courses
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suggestion.recommended_courses.map((course) => (
            <div
              key={course._id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <a
                href={course.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 font-medium block mb-2"
              >
                {course.title}
              </a>
              <p className="text-sm text-gray-600 line-clamp-3">
                {course.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
