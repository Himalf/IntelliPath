import { useEffect, useState } from "react";
import FeedbackForm from "./FeedbackForm";
import { Star, MessageSquare } from "lucide-react";
import feedbackService, {
  type CreateFeedbackDto,
  type Feedback,
} from "@/services/feedbackService";
import { useAuth } from "@/features/auth/AuthContext";
import LoadingSpinner from "./LoadingSpinner";
import ErrorDisplay from "./ErrorDisplay";
import { toast } from "sonner";
import { Card, CardContent } from "./ui/card";

interface Props {
  userId: string;
}

export default function FeedbackList({ userId }: Props) {
  const { user } = useAuth();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFeedback = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await feedbackService.getUserFeedback(userId);
      setFeedbacks(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error("Failed to load feedback:", error);
      setError(error?.message || "Failed to load feedback. Please try again.");
      toast.error("Failed to load feedback");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (data: CreateFeedbackDto) => {
    try {
      await feedbackService.createFeedback(data);
      toast.success("Feedback submitted successfully!");
      await loadFeedback();
    } catch (error: any) {
      console.error("Failed to create feedback:", error);
      toast.error(error?.message || "Failed to submit feedback");
    }
  };

  useEffect(() => {
    loadFeedback();
  }, [userId]);

  return (
    <div className="space-y-8">
      {/* Only show form - table view is in FeedbackPage */}
      {user?.role === "USER" && (
        <Card className="border-2 border-blue-200 bg-blue-50/50">
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <Star className="mr-2 text-blue-600" size={18} />
              Submit New Feedback
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Help us improve by sharing your experience with IntelliPath
            </p>
            <FeedbackForm userId={userId} onSubmit={handleCreate} />
          </CardContent>
        </Card>
      )}

      {/* Show error if any */}
      {error && (
        <ErrorDisplay
          title="Failed to Load Feedback"
          message={error}
          onRetry={loadFeedback}
        />
      )}
    </div>
  );
}
