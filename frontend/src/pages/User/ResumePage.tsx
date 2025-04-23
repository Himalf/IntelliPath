import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/AuthContext";
import ResumeUpload from "@/components/user/ResumeUploadForm";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, Lightbulb, FileText } from "lucide-react";
import resumeService, { ResumeAnalysis } from "@/services/resumeService";
import ResumeAnalysisTab from "@/features/user-management/tabs/ResumeAnalysisTab";
import Modal from "@/components/Modal";
import { Link } from "react-router-dom";

export default function ResumePage() {
  const { user } = useAuth();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [resumeAnalyses, setResumeAnalyses] = useState<ResumeAnalysis[]>([]);
  const [loadingAnalyses, setLoadingAnalyses] = useState(true);

  const fetchAnalyses = async () => {
    if (!user?._id) return;
    setLoadingAnalyses(true);
    try {
      const data = await resumeService.getResumeAnalysis(user._id);
      setResumeAnalyses(data);
    } catch (err) {
      console.error("Failed to fetch analyses", err);
    } finally {
      setLoadingAnalyses(false);
    }
  };

  const handleUploadSuccess = () => {
    setShowUploadModal(false);
    fetchAnalyses();
  };

  useEffect(() => {
    if (user?._id) fetchAnalyses();
  }, [user]);

  if (!user) {
    return (
      <div className="flex justify-center items-center h-60">
        <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          Your Resumes
        </h1>
        <Button
          onClick={() => setShowUploadModal(true)}
          className="cursor-pointer"
        >
          <Upload className="w-4 h-4 mr-2" /> Upload Resume
        </Button>
      </div>

      {/* Link to Career Suggestions */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-sm text-yellow-900 shadow-sm">
        <span className="flex items-center">
          <Lightbulb className="text-yellow-400" />
          Want tailored career paths based on your skills and resume?
        </span>
        <Link
          to="/dashboard/career"
          className="inline-flex items-center text-yellow-800 font-medium mt-2 hover:underline"
        >
          <Lightbulb className="w-4 h-4 mr-1" />
          Go to Career Suggestions →
        </Link>
      </div>

      {/* Resume List or Loading */}
      {loadingAnalyses ? (
        <div className="flex justify-center mt-12">
          <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
        </div>
      ) : resumeAnalyses.length > 0 ? (
        <ResumeAnalysisTab analyses={resumeAnalyses} />
      ) : (
        <div className="text-center text-gray-500 py-10">
          <FileText className="mx-auto w-8 h-8 mb-2" />
          <p className="text-sm">
            No resume analysis found. Upload a resume to get started!
          </p>
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Resume"
        width="max-w-xl"
      >
        <ResumeUpload userId={user._id} onSuccess={handleUploadSuccess} />
      </Modal>
    </div>
  );
}
