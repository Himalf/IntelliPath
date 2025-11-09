import { useState, useEffect } from "react";
import careerSuggestionService, {
  CareerSuggestion,
} from "@/services/careerSuggestionService";
import { BookOpen, Trash2, Lightbulb, TrendingUp, ExternalLink, Calendar, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";

export default function CareerSuggestionsTab({
  suggestions,
  selectedId: propSelectedId,
  onDelete,
}: {
  suggestions: CareerSuggestion[];
  selectedId?: string | null;
  onDelete?: (id: string) => void;
}) {
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(null);

  // Use prop selectedId if provided, otherwise use internal state
  const effectiveSelectedId = propSelectedId ?? internalSelectedId;

  useEffect(() => {
    if (suggestions.length > 0 && !effectiveSelectedId) {
      setInternalSelectedId(suggestions[0]._id);
    }
  }, [suggestions, effectiveSelectedId]);

  const selected = suggestions.find((s) => s._id === effectiveSelectedId) ?? null;

  if (suggestions.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Lightbulb className="w-16 h-16 text-gray-300 mb-4" />
          <p className="text-gray-500">No career suggestions available.</p>
        </CardContent>
      </Card>
    );
  }

  const deleteSuggestions = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this career suggestion?")) return;
    
    try {
      if (onDelete) {
        onDelete(id);
      } else {
        await careerSuggestionService.deleteSuggestion(id);
        toast.success("Career suggestion deleted successfully");
        window.location.reload();
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete suggestion");
    }
  };

  const careers = selected?.suggestedCareers.split(',').map(c => c.trim()) || [];

  return (
    <div className="space-y-6">
      {/* Header - No dropdown needed, selection from table */}
      {selected && (
        <div className="space-y-6">
          {/* Header with Delete */}
          <Card className="border-2 border-yellow-200 bg-yellow-50/50">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Lightbulb className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      Career Suggestion #{suggestions.findIndex(s => s._id === effectiveSelectedId) + 1}
                    </h3>
                    {selected.createdAt && (
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3" />
                        Generated on {format(new Date(selected.createdAt), "MMMM d, yyyy 'at' h:mm a")}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteSuggestions(selected._id || '')}
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Suggested Career Paths */}
          <Card className="border-2 border-green-200 bg-green-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <TrendingUp className="w-5 h-5" />
                Suggested Career Paths
                <Badge variant="outline" className="ml-2">
                  {careers.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {careers.map((career, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-4 rounded-lg border border-green-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="font-medium text-gray-800">{career}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Skill Gap Analysis */}
          <Card className="border-2 border-amber-200 bg-amber-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-800">
                <AlertCircle className="w-5 h-5" />
                Skill Gap Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-white p-4 rounded-lg border border-amber-200">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selected.skillGapAnalysis || "No skill gaps identified."}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Recommended Courses */}
          {selected.recommended_courses && selected.recommended_courses.length > 0 && (
            <Card className="border-2 border-blue-200 bg-blue-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <BookOpen className="w-5 h-5" />
                  Recommended Courses
                  <Badge variant="outline" className="ml-2">
                    {selected.recommended_courses.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selected.recommended_courses.map((course) => (
                    <Card
                      key={course._id}
                      className="border border-blue-200 hover:shadow-lg transition-all cursor-pointer"
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <a
                              href={course.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 font-semibold block mb-2 group"
                            >
                              {course.title}
                              <ExternalLink className="w-4 h-4 inline-block ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </a>
                            {course.description && (
                              <p className="text-sm text-gray-600 line-clamp-3">
                                {course.description}
                              </p>
                            )}
                          </div>
                        </div>
                        {course.url && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-4 w-full"
                            onClick={() => window.open(course.url, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View Course
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
