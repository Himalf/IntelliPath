import { ReactNode } from "react";

interface ChartCardProps {
  title: string;
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export default function ChartCard({
  title,
  children,
  icon,
  className = "",
}: ChartCardProps) {
  return (
    <div
      className={`bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300 overflow-hidden ${className}`}
    >
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center">
          {icon && <span className="mr-2">{icon}</span>}
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
        <div className="flex space-x-2">
          <button className="text-gray-400 hover:text-gray-600 p-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="1"></circle>
              <circle cx="19" cy="12" r="1"></circle>
              <circle cx="5" cy="12" r="1"></circle>
            </svg>
          </button>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}
