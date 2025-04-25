import React, { useEffect, useState } from "react";
import type { ResumeAnalysis } from "@/services/resumeService";
import {
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  ChevronDown,
  Trash2,
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
import resumeService from "@/services/resumeService";

interface Props {
  analyses: ResumeAnalysis[]; // now an array
}

export default function ResumeAnalysisTab({ analyses }: Props) {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // default to first analysis
  useEffect(() => {
    if (analyses.length > 0) {
      setSelectedId(analyses[0]._id); // Set default selected analysis to the first one
    }
  }, [analyses]);

  const analysis = analyses.find((a) => a._id === selectedId) ?? null;

  const toggle = (section: string) =>
    setOpenSection(openSection === section ? null : section);

  if (analyses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <p>No resume analyses available.</p>
      </div>
    );
  }
  const deleteResume = async (id: string) => {
    if (window.confirm("Are you sure you want to delete?")) {
      const res = await resumeService.deleteAnalyses(id);
      if (res) {
        window.location.reload();
      }
    }
  };

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
            <SelectTrigger className="w-64 h-10 px-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <SelectValue placeholder="Select Resume" />
            </SelectTrigger>
            <SelectContent className="w-64 border border-gray-200 shadow-lg rounded-md bg-white">
              {analyses.map((a, i) => (
                <SelectItem
                  key={a._id}
                  value={a._id}
                  className="cursor-pointer px-4 py-2 hover:bg-blue-50 focus:bg-blue-100 focus:text-blue-800 rounded-sm"
                >
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

      {analysis ? (
        <>
          <button
            onClick={() => {
              deleteResume(analysis._id);
            }}
          >
            <Trash2 className="text-red-500 cursor-pointer justify-end" />
          </button>
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
          <ResumeSummaryTab resumeText={analysis.resumeText} />
        </>
      ) : (
        <p className="text-sm text-gray-500">
          Select a resume to view its analysis.
        </p>
      )}
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
