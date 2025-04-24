import { useEffect, useState } from "react";
import FeedbackForm from "./FeedbackForm";
import { Pencil, Trash2, Star, MessageSquare, Calendar } from "lucide-react";
import feedbackService, {
  type CreateFeedbackDto,
  type Feedback,
} from "@/services/feedbackService";
import { Button } from "./ui/button";
import { format } from "date-fns";
interface Props {
  userId: string;
}
export default function FeedbackList({ userId }: Props) {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadFeedback = async () => {
    setIsLoading(true);
    try {
      const data = await feedbackService.getUserFeedback(userId);
      setFeedbacks(data);
    } catch (error) {
      console.error("Failed to load feedback:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (data: CreateFeedbackDto) => {
    try {
      await feedbackService.createFeedback(data);
      await loadFeedback();
    } catch (error) {
      console.error("Failed to create feedback:", error);
    }
  };

  const handleUpdate = async (data: CreateFeedbackDto) => {
    if (editId) {
      try {
        await feedbackService.updateFeedback(editId, data);
        setEditId(null);
        await loadFeedback();
      } catch (error) {
        console.error("Failed to update feedback:", error);
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await feedbackService.deleteFeedback(id);
      await loadFeedback();
    } catch (error) {
      console.error("Failed to delete feedback:", error);
    }
  };
  useEffect(() => {
    loadFeedback();
  }, []);
  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-lg shadow-sm border border-primary/10">
        <h2 className="text-xl font-semibold mb-6 flex items-center">
          <MessageSquare className="mr-2 text-primary" size={20} />
          Your Feedback History
        </h2>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-pulse flex space-x-2">
              <div className="h-2 w-2 bg-primary rounded-full"></div>
              <div className="h-2 w-2 bg-primary rounded-full"></div>
              <div className="h-2 w-2 bg-primary rounded-full"></div>
            </div>
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            You haven't submitted any feedback yet.
          </div>
        ) : (
          <div className="space-y-4 max-h-[20vh] overflow-y-auto ">
            {feedbacks.map((f) => (
              <div
                key={f._id}
                className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 transition-all hover:shadow-md"
              >
                {editId === f._id ? (
                  <FeedbackForm
                    userId={userId}
                    initialData={f}
                    onSubmit={handleUpdate}
                  />
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className={`${
                              i < f.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className="ml-1 text-sm text-gray-500">
                          ({f.rating}/5)
                        </span>
                      </div>
                      {f.createdAt && (
                        <div className="text-xs text-gray-400 flex items-center">
                          <Calendar size={12} className="mr-1" />
                          {format(new Date(f.createdAt), "MMM d, yyyy")}
                        </div>
                      )}
                    </div>

                    <p className="text-gray-700 leading-relaxed">{f.message}</p>

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditId(f._id)}
                        className="text-gray-600 hover:text-primary hover:border-primary transition-colors"
                      >
                        <Pencil size={14} className="mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(f._id)}
                        className="text-red-600 hover:text-white hover:bg-red-600 hover:border-red-600 transition-colors"
                      >
                        <Trash2 size={14} className="mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-medium mb-4 flex items-center">
          <Star className="mr-2 text-primary" size={18} />
          Submit New Feedback
        </h3>
        <FeedbackForm userId={userId} onSubmit={handleCreate} />
      </div>
    </div>
  );
}
