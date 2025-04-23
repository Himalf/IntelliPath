import { useEffect, useState } from "react";
import Modal from "@/components/Modal";
import { User } from "@/services/userService";
import resumeService, { ResumeAnalysis } from "@/services/resumeService";
import careerSuggestionService, {
  CareerSuggestion,
} from "@/services/careerSuggestionService";
import * as Tabs from "@radix-ui/react-tabs";
import CareerSuggestionsTab from "./tabs/CareerSuggestionsTab";
import UserInfoTab from "./tabs/UserInfoTab";
import { Loader2 } from "lucide-react";
import ResumeAnalysisTab from "@/features/user-management/tabs/ResumeAnalysisTab/";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export default function ViewUserDetailsModal({ isOpen, onClose, user }: Props) {
  const [resumeAnalysis, setResumeAnalysis] = useState<ResumeAnalysis[]>([]);
  const [careerSuggestion, setCareerSuggestion] = useState<CareerSuggestion[]>(
    []
  );
  const [activeTab, setActiveTab] = useState("info");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user?._id) {
      fetchUserData(user._id);
    }
    // Reset state when modal closes
    return () => {
      if (!isOpen) {
        setActiveTab("info");
      }
    };
  }, [user, isOpen]);

  const fetchUserData = async (userId: string) => {
    setIsLoading(true);
    try {
      // Fetch data in parallel
      const [resumeData, careerData] = await Promise.all([
        resumeService.getResumeAnalysis(userId),
        careerSuggestionService.getSuggestions(userId),
      ]);

      setResumeAnalysis(resumeData || []);
      setCareerSuggestion(careerData || []);
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  if (!user) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${user.fullName}'s Profile`}
      width="max-w-4xl"
    >
      <Tabs.Root
        value={activeTab}
        onValueChange={handleTabChange}
        className="min-h-96"
      >
        <Tabs.List className="flex space-x-2 border-b pb-2 mb-6">
          <TabButton value="info" active={activeTab === "info"}>
            User Information
          </TabButton>
          <TabButton value="resume" active={activeTab === "resume"}>
            Resume Analysis
          </TabButton>
          <TabButton value="career" active={activeTab === "career"}>
            Career Suggestions
          </TabButton>
        </Tabs.List>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <span className="ml-2 text-gray-600">Loading data...</span>
          </div>
        ) : (
          <>
            <Tabs.Content value="info" className="focus:outline-none">
              <UserInfoTab user={user} />
            </Tabs.Content>
            <Tabs.Content value="resume" className="focus:outline-none">
              <ResumeAnalysisTab analyses={resumeAnalysis || []} />
            </Tabs.Content>
            <Tabs.Content value="career" className="focus:outline-none">
              <CareerSuggestionsTab suggestions={careerSuggestion || []} />
            </Tabs.Content>
          </>
        )}
      </Tabs.Root>
    </Modal>
  );
}

// Helper component for tab buttons
function TabButton({
  value,
  active,
  children,
}: {
  value: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Tabs.Trigger
      value={value}
      className={`px-4 py-2 font-medium rounded-t transition-all
        ${
          active
            ? "text-blue-600 border-b-2 border-blue-600"
            : "text-gray-600 hover:text-blue-500 hover:bg-gray-50"
        }`}
    >
      {children}
    </Tabs.Trigger>
  );
}
