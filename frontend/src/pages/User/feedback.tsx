import FeedbackList from "@/components/FeedbackList";
import { useAuth } from "@/features/auth/AuthContext";

export default function FeedbackPage() {
  const { user } = useAuth();

  if (!user)
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-pulse flex space-x-2">
          <div className="h-3 w-3 bg-primary rounded-full"></div>
          <div className="h-3 w-3 bg-primary rounded-full"></div>
          <div className="h-3 w-3 bg-primary rounded-full"></div>
        </div>
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-center sm:text-left">
        Your Feedback
      </h1>
      <FeedbackList userId={user._id} />
    </div>
  );
}
