import type React from "react";
import type { ResumeAnalysis } from "@/services/resumeService";
import {
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import ResumeSummaryTab from "./ResumeSummaryTab";

export default function ResumeAnalysisTab({
  analysis,
}: {
  analysis: ResumeAnalysis | null;
}) {
  const [openSection, setOpenSection] = useState<string | null>(null);

  if (!analysis) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <svg
          className="w-12 h-12 mb-4 text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="text-lg">No resume analysis available</p>
        <p className="mt-2 text-sm">
          User hasn't uploaded a resume or it hasn't been analyzed yet
        </p>
      </div>
    );
  }

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <div className="space-y-6 p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Resume Analysis
        </h2>
        <p className="text-gray-600">
          Here's our analysis of your resume's strengths and areas for
          improvement
        </p>
      </div>

      <div className="space-y-4">
        <AnalysisItem
          title="Strengths"
          items={analysis.strengths}
          icon={<CheckCircle className="w-5 h-5" />}
          accentColor="green"
          isOpen={openSection === "Strengths"}
          onToggle={() => toggleSection("Strengths")}
        />

        <AnalysisItem
          title="Areas for Improvement"
          items={analysis.weakness}
          icon={<AlertTriangle className="w-5 h-5" />}
          accentColor="amber"
          isOpen={openSection === "Weaknesses"}
          onToggle={() => toggleSection("Weaknesses")}
        />

        <AnalysisItem
          title="Recommendations"
          items={analysis.recommendation}
          icon={<Lightbulb className="w-5 h-5" />}
          accentColor="blue"
          isOpen={openSection === "Recommendations"}
          onToggle={() => toggleSection("Recommendations")}
        />
        <ResumeSummaryTab resumeText={analysis?.resumeText ?? null} />
      </div>
    </div>
  );
}

interface AnalysisItemProps {
  title: string;
  items: string[];
  icon: React.ReactNode;
  accentColor: "green" | "amber" | "blue";
  isOpen: boolean;
  onToggle: () => void;
}

function AnalysisItem({
  title,
  items,
  icon,
  accentColor,
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
  };

  const colors = colorMap[accentColor];

  return (
    <div
      className={cn(
        "border rounded-lg overflow-hidden transition-all duration-300 ease-out",
        isOpen && "shadow-md",
        isOpen && colors.shadow
      )}
    >
      <button
        onClick={onToggle}
        className={cn(
          "w-full flex items-center justify-between px-5 py-4 text-left transition-all duration-200",
          "hover:bg-gray-50/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
        )}
      >
        <div className="flex items-center">
          <span className={cn("mr-2", colors.icon)}>{icon}</span>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
        <ChevronDown
          className={cn(
            "h-5 w-5 text-gray-500 transition-transform duration-300 ease-out",
            isOpen && "transform rotate-180"
          )}
        />
      </button>

      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-out",
          isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className={cn("border-t px-5 py-4", colors.bg, colors.border)}>
          <ul className="space-y-3 pt-2">
            {items.map((item, index) => (
              <li
                key={index}
                className={cn(
                  "flex items-start transition-all",
                  isOpen &&
                    "animate-in fade-in-0 slide-in-from-left-3 duration-500 fill-mode-both"
                )}
                style={{ animationDelay: isOpen ? `${index * 80}ms` : "0ms" }}
              >
                <span
                  className={cn(
                    "inline-block rounded-full p-1 mr-3 mt-0.5",
                    colors.bullet
                  )}
                >
                  {accentColor === "green" && (
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  {accentColor === "amber" && (
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  {accentColor === "blue" && (
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                    </svg>
                  )}
                </span>
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
