// components/ResumeAnalysisTab.tsx
import React, { useEffect, useState } from "react";
import {
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  ChevronDown,
  Trash2,
  Briefcase,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ResumeSummaryTab from "./ResumeSummaryTab";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import resumeService, {
  JobRecommendation,
  ResumeAnalysis,
} from "@/services/resumeService";

interface Props {
  analyses: ResumeAnalysis[];
}

export default function ResumeAnalysisTab({ analyses }: Props) {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (analyses.length > 0) {
      setSelectedId(analyses[0]._id);
    }
  }, [analyses]);

  const analysis = analyses.find((a) => a._id === selectedId) ?? null;
  const toggle = (section: string) =>
    setOpenSection(openSection === section ? null : section);

  const deleteResume = async (id: string) => {
    if (window.confirm("Are you sure you want to delete?")) {
      const res = await resumeService.deleteAnalyses(id);
      if (res?.success) window.location.reload();
    }
  };

  if (!analysis) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>No resume analyses available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {analyses.length > 1 && (
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">
            Choose Resume:
          </label>
          <Select
            value={selectedId ?? ""}
            onValueChange={(v) => setSelectedId(v)}
          >
            <SelectTrigger className="w-64 h-10 border rounded-md px-4">
              <SelectValue placeholder="Select Resume" />
            </SelectTrigger>
            <SelectContent className="w-64 border rounded-md">
              {analyses.map((a, i) => (
                <SelectItem key={a._id} value={a._id}>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">Resume {i + 1}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(a.createdAt!).toLocaleDateString()}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex justify-end">
        <button onClick={() => deleteResume(analysis._id)}>
          <Trash2 className="text-red-500 hover:text-red-600" />
        </button>
      </div>

      <AnalysisItem
        title="Strengths"
        items={analysis.strengths}
        icon={<CheckCircle className="w-5 h-5" />}
        accent="green"
        isOpen={openSection === "Strengths"}
        onToggle={() => toggle("Strengths")}
      />
      <AnalysisItem
        title="Areas for Improvement"
        items={analysis.weakness}
        icon={<AlertTriangle className="w-5 h-5" />}
        accent="amber"
        isOpen={openSection === "Weaknesses"}
        onToggle={() => toggle("Weaknesses")}
      />
      <AnalysisItem
        title="Recommendations"
        items={analysis.recommendation}
        icon={<Lightbulb className="w-5 h-5" />}
        accent="blue"
        isOpen={openSection === "Recommendations"}
        onToggle={() => toggle("Recommendations")}
      />

      {analysis.jobRecommendations &&
        analysis.jobRecommendations.length > 0 && (
          <JobRecommendationSection
            jobs={analysis.jobRecommendations}
            isOpen={openSection === "Jobs"}
            onToggle={() => toggle("Jobs")}
          />
        )}

      <ResumeSummaryTab resumeText={analysis.resumeText} />
    </div>
  );
}

interface AnalysisItemProps {
  title: string;
  items: string[];
  icon: React.ReactNode;
  accent: "green" | "amber" | "blue";
  isOpen: boolean;
  onToggle: () => void;
}

function AnalysisItem({
  title,
  items,
  icon,
  accent,
  isOpen,
  onToggle,
}: AnalysisItemProps) {
  const colorMap = {
    green: {
      icon: "text-green-600",
      bg: "bg-green-50",
      border: "border-green-100",
      bullet: "bg-green-100 text-green-600",
      shadow: "shadow-green-100/50",
    },
    amber: {
      icon: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-100",
      bullet: "bg-amber-100 text-amber-600",
      shadow: "shadow-amber-100/50",
    },
    blue: {
      icon: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100",
      bullet: "bg-blue-100 text-blue-600",
      shadow: "shadow-blue-100/50",
    },
  } as const;

  const c = colorMap[accent];

  return (
    <div
      className={cn(
        "border rounded-lg overflow-hidden transition-all",
        isOpen && "shadow-md",
        isOpen && c.shadow
      )}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-gray-50"
      >
        <div className="flex items-center gap-2">
          <span className={c.icon}>{icon}</span>
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <ChevronDown
          className={cn("h-5 w-5 transition-transform", isOpen && "rotate-180")}
        />
      </button>
      <div
        className={cn(
          "transition-max-h overflow-hidden",
          isOpen ? "max-h-96" : "max-h-0"
        )}
      >
        <div className={cn("px-5 py-4", c.bg, c.border)}>
          <ul className="space-y-2">
            {items.map((i, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className={cn("inline-block p-1 rounded-full", c.bullet)}>
                  •
                </span>
                <span>{i}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

interface JobRecommendationSectionProps {
  jobs: JobRecommendation[];
  isOpen: boolean;
  onToggle: () => void;
}

function JobRecommendationSection({
  jobs,
  isOpen,
  onToggle,
}: JobRecommendationSectionProps) {
  return (
    <div className="border rounded-lg overflow-hidden shadow-sm">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2 text-purple-600">
          <Briefcase className="w-5 h-5" />
          <h3 className="text-lg font-semibold">
            Job Recommendations
            <span className="ml-2 text-xs font-medium text-purple-500 bg-purple-100 px-2 py-0.5 rounded-full">
              {jobs.length}
            </span>
          </h3>
        </div>
        <ChevronDown
          className={cn("h-5 w-5 transition-transform", isOpen && "rotate-180")}
        />
      </button>

      <div
        className={cn(
          "transition-max-h overflow-hidden",
          isOpen ? "max-h-[500px]" : "max-h-0"
        )}
      >
        <div className="px-5 py-4 bg-purple-50 border-t border-purple-100">
          {jobs.length === 0 ? (
            <p className="text-sm text-gray-500">
              No job recommendations found.
            </p>
          ) : (
            <ul className="grid sm:grid-cols-2 gap-4">
              {jobs.map((job, idx) => (
                <li
                  key={idx}
                  className="bg-white rounded-md border border-purple-100 p-4 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-semibold text-purple-800">
                        {job.title}
                      </h4>
                      <a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center text-sm gap-1"
                      >
                        View
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
