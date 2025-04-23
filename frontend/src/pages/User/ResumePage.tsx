import ResumeUpload from "@/components/user/ResumeUploadForm";
import { useAuth } from "@/features/auth/AuthContext";
import { Loader2 } from "lucide-react";

export default function ResumePage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex justify-center items-center h-60">
        <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">
        Upload Your Resume
      </h1>
      <ResumeUpload userId={user._id} />
    </div>
  );
}
