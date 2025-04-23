import React, { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Sparkles } from "lucide-react";
import careerSuggestionService from "@/services/careerSuggestionService";
import Modal from "../Modal";

interface CareerSuggestionModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CareerSuggestionModal: React.FC<CareerSuggestionModalProps> = ({
  userId,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [skills, setSkills] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!skills.trim()) {
      toast.warning("Please enter at least one skill.");
      return;
    }

    setLoading(true);
    try {
      await careerSuggestionService.generateSuggestion(userId, skills);
      toast.success("Career suggestions generated successfully!");
      onSuccess?.();
      onClose();
      setSkills("");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate suggestions.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Generate Career Suggestions"
    >
      <div className="space-y-4">
        <p className="text-gray-600 text-sm">
          Enter your skills separated by commas (e.g., JavaScript, UI Design,
          Problem Solving)
        </p>
        <Input
          placeholder="Enter skills..."
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
        />
        <Button className="w-full" onClick={handleSubmit} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5 mr-2" />
              Generate Suggestions
            </>
          )}
        </Button>
      </div>
    </Modal>
  );
};

export default CareerSuggestionModal;
