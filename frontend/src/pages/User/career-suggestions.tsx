import { useState, useEffect } from "react";
import { Sparkles, FileText, Loader2, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import CareerSuggestionModal from "@/components/user/CareerSuggestionModal";
import { useAuth } from "@/features/auth/AuthContext";
import careerSuggestionService, {
  CareerSuggestion,
} from "@/services/careerSuggestionService";
import CareerSuggestionsTab from "@/features/user-management/tabs/CareerSuggestionsTab";
import { Link } from "react-router-dom";

export default function CareerSuggestionsPage() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<CareerSuggestion[]>([]);

  const fetchSuggestions = async () => {
    if (user?._id) {
      const res = await careerSuggestionService.getSuggestions(user._id);
      setSuggestions(res);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, [user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-60">
        <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Lightbulb className="w-6 h-6 text-yellow-500" />
          Career Suggestions
        </h1>
        <Button onClick={() => setIsModalOpen(true)} className="cursor-pointer">
          <Sparkles className="w-4 h-4 mr-2" />
          Generate Suggestions
        </Button>
      </div>

      {/* Intro / Info Card */}
      <div className="bg-blue-50 p-4 rounded-md text-sm text-blue-900 border border-blue-200 shadow-sm">
        Based on your skills, we generate career paths that best match your
        potential. For more accurate suggestions, make sure your{" "}
        <strong>Resume is uploaded</strong> and analyzed.
        <br />
        <Link
          to="/dashboard/resume"
          className="text-blue-700 hover:underline inline-flex items-center gap-1 mt-2"
        >
          <FileText className="w-4 h-4" />
          Go to Resume Analysis
        </Link>
      </div>

      {/* Suggestion Summary */}
      <div className="bg-white p-4 rounded-md border shadow-sm text-gray-700">
        You currently have <strong>{suggestions.length}</strong> career
        suggestion
        {suggestions.length !== 1 && "s"}.
      </div>

      {/* Suggestions List */}
      {suggestions.length > 0 ? (
        <CareerSuggestionsTab suggestions={suggestions} />
      ) : (
        <div className="text-center text-gray-500 py-10">
          <Sparkles className="mx-auto w-8 h-8 mb-2" />
          <p className="text-sm">
            No career suggestions yet. Click above to generate!
          </p>
        </div>
      )}

      {/* Modal */}
      <CareerSuggestionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userId={user._id}
        onSuccess={fetchSuggestions}
      />
    </div>
  );
}
