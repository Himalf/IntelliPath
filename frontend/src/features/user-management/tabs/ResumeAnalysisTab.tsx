import { ResumeAnalysis } from "@/services/resumeService";
import { CheckCircle, XCircle, LightbulbIcon } from "lucide-react";

export default function ResumeAnalysisTab({
  analysis,
}: {
  analysis: ResumeAnalysis | null;
}) {
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

  return (
    <div className="space-y-8">
      <section>
        <div className="flex items-center mb-4">
          <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-800">Strengths</h3>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-100">
          <ul className="space-y-3">
            {analysis.strengths.map((strength, i) => (
              <li key={i} className="flex items-start">
                <span className="inline-block rounded-full bg-green-100 p-1 mr-3 mt-0.5">
                  <svg
                    className="w-3 h-3 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <span className="text-gray-700">{strength}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section>
        <div className="flex items-center mb-4">
          <XCircle className="w-5 h-5 text-red-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-800">
            Areas for Improvement
          </h3>
        </div>
        <div className="bg-red-50 rounded-lg p-4 border border-red-100">
          <ul className="space-y-3">
            {analysis.weakness.map((weakness, i) => (
              <li key={i} className="flex items-start">
                <span className="inline-block rounded-full bg-red-100 p-1 mr-3 mt-0.5">
                  <svg
                    className="w-3 h-3 text-red-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <span className="text-gray-700">{weakness}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section>
        <div className="flex items-center mb-4">
          <LightbulbIcon className="w-5 h-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-800">
            Recommendations
          </h3>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <ul className="space-y-3">
            {analysis.recommendation.map((recommendation, i) => (
              <li key={i} className="flex items-start">
                <span className="inline-block rounded-full bg-blue-100 p-1 mr-3 mt-0.5">
                  <svg
                    className="w-3 h-3 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                  </svg>
                </span>
                <span className="text-gray-700">{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
