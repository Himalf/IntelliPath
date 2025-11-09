import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/AuthContext";
import ResumeUpload from "@/components/user/ResumeUploadForm";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, Lightbulb, FileText, Download, TrendingUp, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import resumeService, { ResumeAnalysis } from "@/services/resumeService";
import ResumeAnalysisTab from "@/features/user-management/tabs/ResumeAnalysisTab";
import ResumeTable from "@/components/ResumeTable";
import Modal from "@/components/Modal";
import { Link } from "react-router-dom";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorDisplay from "@/components/ErrorDisplay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { calculateResumeScore } from "@/utils/resumeScore";

export default function ResumePage() {
  const { user } = useAuth();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [resumeAnalyses, setResumeAnalyses] = useState<ResumeAnalysis[]>([]);
  const [loadingAnalyses, setLoadingAnalyses] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalyses = async () => {
    if (!user?._id) return;
    setLoadingAnalyses(true);
    setError(null);
    try {
      const data = await resumeService.getResumeAnalysis(user._id);
      setResumeAnalyses(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Failed to fetch analyses", err);
      setError(err?.message || "Failed to load resume analyses. Please try again.");
      toast.error("Failed to load resume analyses");
    } finally {
      setLoadingAnalyses(false);
    }
  };

  const handleUploadSuccess = () => {
    setShowUploadModal(false);
    toast.success("Resume uploaded and analyzed successfully!");
    fetchAnalyses();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this resume analysis?")) return;
    
    try {
      await resumeService.deleteAnalyses(id);
      toast.success("Resume analysis deleted successfully");
      fetchAnalyses();
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete resume analysis");
    }
  };

  useEffect(() => {
    if (user?._id) fetchAnalyses();
  }, [user]);

  if (!user) {
    return (
      <div className="flex justify-center items-center h-60">
        <LoadingSpinner text="Loading..." />
      </div>
    );
  }

  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);

  const latestAnalysis = resumeAnalyses.length > 0 ? resumeAnalyses[0] : null;
  const resumeScore = latestAnalysis ? calculateResumeScore(latestAnalysis) : 0;

  // Set default selected resume
  useEffect(() => {
    if (resumeAnalyses.length > 0 && !selectedResumeId) {
      setSelectedResumeId(resumeAnalyses[0]._id);
    }
  }, [resumeAnalyses, selectedResumeId]);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <FileText className="w-8 h-8 text-blue-600" />
            Resume Analysis
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Upload and analyze your resume to get personalized insights
          </p>
        </div>
        <Button
          onClick={() => setShowUploadModal(true)}
          className="cursor-pointer"
          size="lg"
        >
          <Upload className="w-4 h-4 mr-2" /> Upload Resume
        </Button>
      </div>

      {/* Resume Score Card */}
      {latestAnalysis && (
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Resume Score
              </span>
              <Badge
                variant={resumeScore >= 70 ? "default" : resumeScore >= 50 ? "outline" : "destructive"}
                className="text-lg px-3 py-1"
              >
                {resumeScore}/100
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Overall Score</span>
                <span className="font-semibold">{resumeScore}%</span>
              </div>
              <Progress value={resumeScore} className="h-3" />
            </div>
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-lg font-bold">{latestAnalysis.strengths?.length || 0}</span>
                </div>
                <p className="text-xs text-gray-600">Strengths</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-amber-600 mb-1">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-lg font-bold">{latestAnalysis.weakness?.length || 0}</span>
                </div>
                <p className="text-xs text-gray-600">Areas to Improve</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                  <Lightbulb className="w-4 h-4" />
                  <span className="text-lg font-bold">{latestAnalysis.recommendation?.length || 0}</span>
                </div>
                <p className="text-xs text-gray-600">Recommendations</p>
              </div>
            </div>
            {latestAnalysis.jobRecommendations && latestAnalysis.jobRecommendations.length > 0 && (
              <div className="pt-2 border-t border-blue-200">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>{latestAnalysis.jobRecommendations.length}</strong> job recommendations available
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Link to Career Suggestions */}
      <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <Lightbulb className="text-yellow-500 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-yellow-900 mb-1">Get Career Suggestions</h3>
            <p className="text-sm text-yellow-800 mb-3">
              Want tailored career paths based on your skills and resume analysis?
            </p>
            <Link
              to="/dashboard/career"
              className="inline-flex items-center text-yellow-900 font-medium hover:underline"
            >
              <Lightbulb className="w-4 h-4 mr-1" />
              Go to Career Suggestions →
            </Link>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && !loadingAnalyses && (
        <ErrorDisplay
          title="Failed to Load Resumes"
          message={error}
          onRetry={fetchAnalyses}
        />
      )}

      {/* Resume List or Loading */}
      {loadingAnalyses ? (
        <div className="flex justify-center mt-12">
          <LoadingSpinner text="Loading resume analyses..." />
        </div>
      ) : resumeAnalyses.length > 0 ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Your Resume Analyses ({resumeAnalyses.length})
            </h2>
            <Badge variant="outline">
              {resumeAnalyses.length} {resumeAnalyses.length === 1 ? 'resume' : 'resumes'}
            </Badge>
          </div>
          
          {/* Resume Table View */}
          <ResumeTable 
            analyses={resumeAnalyses}
            selectedId={selectedResumeId}
            onSelect={(id) => {
              setSelectedResumeId(id);
              // Scroll to detailed view
              setTimeout(() => {
                const element = document.getElementById(`resume-detail-view`);
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }, 100);
            }}
            onDelete={handleDelete}
          />
          
          {/* Detailed View - Only show selected resume */}
          {selectedResumeId && (
            <div id="resume-detail-view" className="mt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Detailed Analysis
              </h3>
              <ResumeAnalysisTab 
                analyses={resumeAnalyses} 
                selectedId={selectedResumeId}
                onDelete={handleDelete} 
              />
            </div>
          )}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Resume Analysis Found</h3>
            <p className="text-sm text-gray-500 text-center mb-6 max-w-md">
              Upload your resume to get AI-powered analysis, personalized recommendations, and job suggestions.
            </p>
            <Button onClick={() => setShowUploadModal(true)}>
              <Upload className="w-4 h-4 mr-2" /> Upload Your First Resume
            </Button>
          </CardContent>
        </Card>
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
