import { useState } from "react";
import FeedbackList from "@/components/FeedbackList";
import FeedbackTable from "@/components/FeedbackTable";
import { useAuth } from "@/features/auth/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Star, TrendingUp, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import LoadingSpinner from "@/components/LoadingSpinner";
import feedbackService, { Feedback } from "@/services/feedbackService";
import { useEffect } from "react";
import { toast } from "sonner";

export default function FeedbackPage() {
  const { user } = useAuth();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    average: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });

  useEffect(() => {
    const loadFeedback = async () => {
      if (!user?._id) return;
      setIsLoading(true);
      try {
        const data = await feedbackService.getUserFeedback(user._id);
        const safeData = Array.isArray(data) ? data : [];
        setFeedbacks(safeData);

        // Calculate stats
        if (safeData.length > 0) {
          const avg = safeData.reduce((sum, f) => sum + f.rating, 0) / safeData.length;
          const dist: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
          safeData.forEach((f) => {
            dist[f.rating as keyof typeof dist]++;
          });
          setStats({
            total: safeData.length,
            average: Number(avg.toFixed(2)),
            distribution: dist,
          });
        }
      } catch (error: any) {
        console.error("Failed to load feedback:", error);
        toast.error("Failed to load feedback");
      } finally {
        setIsLoading(false);
      }
    };

    loadFeedback();
  }, [user]);

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <LoadingSpinner text="Loading..." />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <MessageSquare className="w-8 h-8 text-blue-600" />
            Your Feedback
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Share your experience and help us improve
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {feedbacks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Total Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">{stats.total}</div>
              <p className="text-xs text-blue-700 mt-1">submissions</p>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-yellow-700 flex items-center gap-2">
                <Star className="w-4 h-4" />
                Average Rating
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-bold text-yellow-900">{stats.average}</div>
                <span className="text-sm text-yellow-700">/ 5.0</span>
              </div>
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={16}
                    className={
                      star <= Math.round(stats.average)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Rating Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center gap-2">
                    <span className="text-xs text-gray-600 w-4">{rating}★</span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{
                          width: `${stats.total > 0 ? (stats.distribution[rating as keyof typeof stats.distribution] / stats.total) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 w-8 text-right">
                      {stats.distribution[rating as keyof typeof stats.distribution]}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Feedback Table - Primary View */}
      {feedbacks.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">Your Feedback ({feedbacks.length})</h2>
            <Badge variant="outline">{feedbacks.length} {feedbacks.length === 1 ? 'entry' : 'entries'}</Badge>
          </div>
          <FeedbackTable 
            feedbacks={feedbacks} 
            onDelete={async (id) => {
              try {
                await feedbackService.deleteFeedback(id);
                toast.success("Feedback deleted successfully");
                // Reload feedback
                const data = await feedbackService.getUserFeedback(user._id);
                const safeData = Array.isArray(data) ? data : [];
                setFeedbacks(safeData);
                
                // Recalculate stats
                if (safeData.length > 0) {
                  const avg = safeData.reduce((sum, f) => sum + f.rating, 0) / safeData.length;
                  const dist: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
                  safeData.forEach((f) => {
                    dist[f.rating as keyof typeof dist]++;
                  });
                  setStats({
                    total: safeData.length,
                    average: Number(avg.toFixed(2)),
                    distribution: dist,
                  });
                } else {
                  setStats({
                    total: 0,
                    average: 0,
                    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
                  });
                }
              } catch (err: any) {
                toast.error(err?.message || "Failed to delete feedback");
              }
            }}
          />
          <p className="text-sm text-gray-600 italic">
            💡 Click on any row to expand and view full feedback message
          </p>
        </div>
      )}

      {/* Feedback Form - Only show form, not the list */}
      <FeedbackList userId={user._id} />
    </div>
  );
}
