import { useState, useEffect } from "react";
import careerSuggestionService, {
  CareerSuggestion,
} from "@/services/careerSuggestionService";
import { BookOpen, Trash2 } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function CareerSuggestionsTab({
  suggestions,
}: {
  suggestions: CareerSuggestion[];
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (suggestions.length > 0) {
      setSelectedId(suggestions[0]._id);
    }
  }, [suggestions]);

  const selected = suggestions.find((s) => s._id === selectedId) ?? null;

  if (suggestions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <p>No career suggestions available.</p>
      </div>
    );
  }

  const deleteSuggestions = async (id: string) => {
    await careerSuggestionService.deleteSuggestion(id);
  };

  const handleDeleteClick = (id: string) => {
    if (window.confirm("Are you sure you want to delete this suggestion?")) {
      deleteSuggestions(id);
    }
  };

  return (
    <div className="space-y-6 p-4">
      {suggestions.length > 1 && (
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">
            Choose Suggestion:
          </label>
          <Select
            value={selectedId ?? ""}
            onValueChange={(v) => setSelectedId(v)}
          >
            <SelectTrigger className="w-64 h-10 px-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <SelectValue placeholder="Select Suggestion" />
            </SelectTrigger>
            <SelectContent className="w-64 border border-gray-200 shadow-lg rounded-md bg-white">
              {suggestions.map((s, i) => (
                <SelectItem
                  key={s._id}
                  value={s._id}
                  className="cursor-pointer px-4 py-2 hover:bg-blue-50 focus:bg-blue-100 focus:text-blue-800 rounded-sm"
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">
                      Suggestion {i + 1}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(s.createdAt!).toLocaleDateString()}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {selected && (
        <div className="space-y-8">
          <div className="mt-4 flex justify-end">
            <button
              className=" text-red-500 px-4 py-2 rounded-md  cursor pointer"
              onClick={() => handleDeleteClick(selected._id)}
            >
              <Trash2 />
            </button>
          </div>
          <section className="bg-blue-50 p-6 rounded-lg border border-blue-100">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">
              Suggested Career Paths
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {selected.suggestedCareers}
            </p>
          </section>

          <section className="bg-amber-50 p-6 rounded-lg border border-amber-100">
            <h3 className="text-lg font-semibold text-amber-800 mb-3">
              Skill Gap Analysis
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {selected.skillGapAnalysis}
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-green-600" />
              Recommended Courses
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selected.recommended_courses.map((course) => (
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
      )}
    </div>
  );
}
