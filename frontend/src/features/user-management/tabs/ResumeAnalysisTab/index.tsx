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
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ResumeSummaryTab from "./ResumeSummaryTab";
import resumeService, {
  JobRecommendation,
  ResumeAnalysis,
} from "@/services/resumeService";
import { calculateResumeScore } from "@/utils/resumeScore";

interface Props {
  analyses: ResumeAnalysis[];
  selectedId?: string | null;
  onDelete?: (id: string) => void;
}

export default function ResumeAnalysisTab({ analyses, selectedId, onDelete }: Props) {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(null);

  // Use prop selectedId if provided, otherwise use internal state
  const effectiveSelectedId = selectedId ?? internalSelectedId;

  useEffect(() => {
    if (analyses.length > 0 && !effectiveSelectedId) {
      setInternalSelectedId(analyses[0]._id);
    }
  }, [analyses, effectiveSelectedId]);

  const analysis = analyses.find((a) => a._id === effectiveSelectedId) ?? null;
  const toggle = (section: string) =>
    setOpenSection(openSection === section ? null : section);

  const deleteResume = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this resume analysis?")) {
      if (onDelete) {
        onDelete(id);
      } else {
        const res = await resumeService.deleteAnalyses(id);
        if (res) window.location.reload();
      }
    }
  };

  if (!analysis) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>No resume analyses available.</p>
      </div>
    );
  }

  // Calculate resume score using unified utility
  const resumeScore = calculateResumeScore(analysis);

  return (
    <div className="space-y-6">
      {/* Header with Score - No dropdown needed, selection from table */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border-2 border-blue-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                {analysis ? `Resume Analysis #${analyses.findIndex(a => a._id === effectiveSelectedId) + 1}` : "Resume Analysis"}
              </h3>
              {analysis?.createdAt && (
                <p className="text-xs text-gray-600 mt-1">
                  Analyzed on {new Date(analysis.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-gray-600 mb-1">Resume Score</p>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-blue-600">{resumeScore}</span>
                <span className="text-gray-500">/100</span>
              </div>
            </div>
            <button 
              onClick={() => deleteResume(analysis._id)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-blue-200">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FileText className="w-4 h-4" />
            <span>
              Analyzed on {analysis.createdAt ? new Date(analysis.createdAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) : 'Unknown date'}
            </span>
          </div>
        </div>
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
      border: "border-green-200",
      bullet: "bg-green-500 text-white",
      shadow: "shadow-green-200/50",
      headerBg: "bg-green-100",
    },
    amber: {
      icon: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-200",
      bullet: "bg-amber-500 text-white",
      shadow: "shadow-amber-200/50",
      headerBg: "bg-amber-100",
    },
    blue: {
      icon: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
      bullet: "bg-blue-500 text-white",
      shadow: "shadow-blue-200/50",
      headerBg: "bg-blue-100",
    },
  } as const;

  const c = colorMap[accent];

  return (
    <div
      className={cn(
        "border-2 rounded-xl overflow-hidden transition-all hover:shadow-lg",
        isOpen && "shadow-lg",
        c.border
      )}
    >
      <button
        onClick={onToggle}
        className={cn(
          "w-full flex items-center justify-between px-6 py-4 transition-colors",
          c.headerBg,
          "hover:opacity-90"
        )}
      >
        <div className="flex items-center gap-3">
          <span className={cn("p-2 rounded-lg bg-white", c.icon)}>{icon}</span>
          <div className="text-left">
            <h3 className="text-lg font-bold text-gray-800">{title}</h3>
            <p className="text-xs text-gray-600">{items.length} items</p>
          </div>
        </div>
        <ChevronDown
          className={cn("h-5 w-5 transition-transform text-gray-600", isOpen && "rotate-180")}
        />
      </button>
      <div
        className={cn(
          "transition-all duration-300 overflow-hidden",
          isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className={cn("px-6 py-5", c.bg)}>
          <ul className="space-y-3">
            {items.map((i, idx) => (
              <li key={idx} className="flex items-start gap-3 group">
                <span className={cn(
                  "inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold flex-shrink-0 mt-0.5",
                  c.bullet
                )}>
                  {idx + 1}
                </span>
                <span className="text-gray-700 leading-relaxed group-hover:text-gray-900 transition-colors">{i}</span>
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
    <div className="border-2 border-purple-200 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-4 bg-gradient-to-r from-purple-100 to-indigo-100 hover:from-purple-200 hover:to-indigo-200 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white text-purple-600">
            <Briefcase className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-bold text-gray-800">
              Job Recommendations
            </h3>
            <p className="text-xs text-gray-600">{jobs.length} opportunities available</p>
          </div>
          <span className="ml-2 text-sm font-bold text-purple-700 bg-white px-3 py-1 rounded-full border-2 border-purple-300">
            {jobs.length}
          </span>
        </div>
        <ChevronDown
          className={cn("h-5 w-5 transition-transform text-gray-600", isOpen && "rotate-180")}
        />
      </button>

      <div
        className={cn(
          "transition-all duration-300 overflow-hidden",
          isOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-6 py-5 bg-gradient-to-br from-purple-50 to-indigo-50 border-t-2 border-purple-200">
          {jobs.length === 0 ? (
            <div className="text-center py-8">
              <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">
                No job recommendations found.
              </p>
            </div>
          ) : (
            <ul className="grid sm:grid-cols-2 gap-4">
              {jobs.map((job, idx) => (
                <li
                  key={idx}
                  className="bg-white rounded-lg border-2 border-purple-200 p-5 shadow-md hover:shadow-lg transition-all hover:border-purple-400 group"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="text-base font-bold text-gray-800 group-hover:text-purple-700 transition-colors flex-1">
                        {job.title}
                      </h4>
                      <a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline flex items-center text-sm gap-1 font-medium px-3 py-1.5 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        View Job
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                    {job.company && (
                      <p className="text-sm text-gray-600">at {job.company}</p>
                    )}
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
