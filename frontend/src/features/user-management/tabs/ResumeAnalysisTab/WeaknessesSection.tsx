import { useState } from "react";
import { XCircle, ChevronDown, ChevronUp } from "lucide-react";

export default function WeaknessesSection({
  weaknesses,
}: {
  weaknesses: string[];
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <section className="border rounded-lg overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          <XCircle className="w-5 h-5 text-red-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-800">
            Areas for Improvement
          </h3>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {isOpen && (
        <div className="bg-red-50 p-4 border-t border-red-100">
          <ul className="space-y-3">
            {weaknesses.map((weakness, index) => (
              <li key={index} className="flex items-start">
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
      )}
    </section>
  );
}
