import { useState } from "react";
import { CheckCircle, ChevronDown, ChevronUp } from "lucide-react";

export default function StrengthsSection({
  strengths,
}: {
  strengths: string[];
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <section className="border rounded-lg overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-800">Strengths</h3>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {isOpen && (
        <div className="bg-green-50 p-4 border-t border-green-100">
          <ul className="space-y-3">
            {strengths.map((strength, index) => (
              <li key={index} className="flex items-start">
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
      )}
    </section>
  );
}
