import React from "react";

interface ResumeSummaryTabProps {
  resumeText: string | null;
}

const ResumeSummaryTab: React.FC<ResumeSummaryTabProps> = ({ resumeText }) => {
  if (!resumeText) {
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
        <p className="text-lg">No resume text available</p>
        <p className="mt-2 text-sm">
          The user may not have uploaded a resume or it hasn't been parsed yet.
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Resume Text</h2>
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-[500px] overflow-y-auto">
        {resumeText.split("\n").map((line, index) => (
          <p
            key={index}
            className="text-sm text-gray-700 mb-2 whitespace-pre-wrap"
          >
            {line}
          </p>
        ))}
      </div>
    </div>
  );
};

export default ResumeSummaryTab;
