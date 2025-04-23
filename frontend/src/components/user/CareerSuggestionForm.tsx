import React, { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Sparkles } from "lucide-react";
import CareerSuggestionService from "@/services/careerSuggestionService";

interface CareerSuggestionFormProps {
  userId: string;
  onSuccess?: () => void;
}

const CareerSuggestionForm: React.FC<CareerSuggestionFormProps> = ({
  userId,
  onSuccess,
}) => {
  const [skillsInput, setSkillsInput] = useState("");
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    const skillList = skillsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (!skillList.length) {
      toast("Please enter at least one skill.");
      return;
    }

    const skillString = skillList.join(", ");

    setGenerating(true);
    try {
      await CareerSuggestionService.generateSuggestion(userId, skillString);
      toast("Career suggestion generated successfully!");
      setSkillsInput("");
      onSuccess?.();
    } catch (err) {
      toast("Failed to generate suggestion");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700">
          Enter your skills (comma separated):
        </label>
        <Input
          value={skillsInput}
          onChange={(e) => setSkillsInput(e.target.value)}
          placeholder="e.g. JavaScript, React, Node.js"
        />
      </div>

      <Button className="w-full" onClick={handleGenerate} disabled={generating}>
        {generating ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 mr-2" />
            Generate Suggestions
          </>
        )}
      </Button>
    </div>
  );
};

export default CareerSuggestionForm;
