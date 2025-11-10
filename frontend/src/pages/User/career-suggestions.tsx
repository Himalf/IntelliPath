import { useState, useEffect } from "react";
import { Sparkles, FileText, Loader2, Lightbulb, TrendingUp, BookOpen, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import CareerSuggestionModal from "@/components/user/CareerSuggestionModal";
import { useAuth } from "@/features/auth/AuthContext";
import careerSuggestionService, {
  CareerSuggestion,
} from "@/services/careerSuggestionService";
import CareerSuggestionsTab from "@/features/user-management/tabs/CareerSuggestionsTab";
import CareerSuggestionsTable from "@/components/CareerSuggestionsTable";
import { Link } from "react-router-dom";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorDisplay from "@/components/ErrorDisplay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function CareerSuggestionsPage() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<CareerSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSuggestionId, setSelectedSuggestionId] = useState<string | null>(null);

  // Set default selected suggestion
  useEffect(() => {
    if (suggestions.length > 0 && !selectedSuggestionId) {
      setSelectedSuggestionId(suggestions[0]._id || null);
    }
  }, [suggestions, selectedSuggestionId]);

  const fetchSuggestions = async () => {
    if (!user?._id) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await careerSuggestionService.getSuggestions(user._id);
      setSuggestions(Array.isArray(res) ? res : []);
    } catch (err: any) {
      console.error("Failed to fetch suggestions:", err);
      setError(err?.message || "Failed to load career suggestions. Please try again.");
      toast.error("Failed to load career suggestions");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, [user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-60">
        <LoadingSpinner text="Loading..." />
      </div>
    );
  }

  const latestSuggestion = suggestions.length > 0 ? suggestions[0] : null;
  const careerCount = latestSuggestion 
    ? latestSuggestion.suggestedCareers.split(',').length 
    : 0;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Lightbulb className="w-8 h-8 text-yellow-500" />
            Career Suggestions
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            AI-powered career path recommendations based on your skills and experience
          </p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)} 
          className="cursor-pointer"
          size="lg"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Generate New Suggestions
        </Button>
      </div>

      {/* Stats Card */}
      {latestSuggestion && (
        <Card className="border border-gray-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-yellow-600" />
                Latest Career Suggestions
              </span>
              <Badge variant="outline" className="text-lg px-3 py-1">
                {careerCount} Careers
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-2 text-green-600 mb-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-semibold">Suggested Careers</span>
                </div>
                <p className="text-sm text-gray-600">
                  {latestSuggestion.suggestedCareers.split(',').slice(0, 3).join(', ')}
                  {careerCount > 3 && ` +${careerCount - 3} more`}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-2 text-blue-600 mb-2">
                  <BookOpen className="w-5 h-5" />
                  <span className="font-semibold">Recommended Courses</span>
                </div>
                <p className="text-sm text-gray-600">
                  {latestSuggestion.recommended_courses?.length || 0} courses available
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-2 text-amber-600 mb-2">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-semibold">Skill Gaps</span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {latestSuggestion.skillGapAnalysis || "No gaps identified"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <FileText className="text-blue-500 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-2">How It Works</h3>
            <p className="text-sm text-blue-800 mb-3">
              Our AI analyzes your skills and experience to suggest the best career paths for you. 
              For more accurate suggestions, make sure your <strong>Resume is uploaded</strong> and analyzed.
            </p>
            <Link
              to="/dashboard/resume"
              className="inline-flex items-center text-blue-700 font-medium hover:underline"
            >
              <FileText className="w-4 h-4 mr-1" />
              Go to Resume Analysis
            </Link>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && !isLoading && (
        <ErrorDisplay
          title="Failed to Load Suggestions"
          message={error}
          onRetry={fetchSuggestions}
        />
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner text="Loading career suggestions..." />
        </div>
      ) : suggestions.length > 0 ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Your Career Suggestions ({suggestions.length})
            </h2>
            <Badge variant="outline">
              {suggestions.length} {suggestions.length === 1 ? 'suggestion' : 'suggestions'}
            </Badge>
          </div>
          
          {/* Career Suggestions Table */}
          <CareerSuggestionsTable
            suggestions={suggestions}
            selectedId={selectedSuggestionId}
            onSelect={(id) => {
              setSelectedSuggestionId(id);
              setTimeout(() => {
                const element = document.getElementById(`career-detail-view`);
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }, 100);
            }}
            onDelete={async (id) => {
              try {
                await careerSuggestionService.deleteSuggestion(id);
                toast.success("Career suggestion deleted successfully");
                fetchSuggestions();
                if (selectedSuggestionId === id) {
                  setSelectedSuggestionId(null);
                }
              } catch (err: any) {
                toast.error(err?.message || "Failed to delete suggestion");
              }
            }}
          />
          
          {/* Detailed View - Only show selected suggestion */}
          {selectedSuggestionId && (
            <div id="career-detail-view" className="mt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-600" />
                Detailed View
              </h3>
              <CareerSuggestionsTab 
                suggestions={suggestions}
                selectedId={selectedSuggestionId}
                onDelete={async (id) => {
                  try {
                    await careerSuggestionService.deleteSuggestion(id);
                    toast.success("Career suggestion deleted successfully");
                    fetchSuggestions();
                    if (selectedSuggestionId === id) {
                      setSelectedSuggestionId(null);
                    }
                  } catch (err: any) {
                    toast.error(err?.message || "Failed to delete suggestion");
                  }
                }}
              />
            </div>
          )}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Sparkles className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Career Suggestions Yet</h3>
            <p className="text-sm text-gray-500 text-center mb-6 max-w-md">
              Get personalized career path recommendations based on your skills and experience. 
              Click the button above to generate your first suggestion!
            </p>
            <Button onClick={() => setIsModalOpen(true)}>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Career Suggestions
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modal */}
      <CareerSuggestionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userId={user._id}
        onSuccess={() => {
          fetchSuggestions();
          toast.success("Career suggestions generated successfully!");
        }}
      />
    </div>
  );
}
