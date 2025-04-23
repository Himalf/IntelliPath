import { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  width?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  width = "max-w-lg",
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div
        className={`bg-white w-full ${width} max-h-[90vh] rounded-lg shadow-lg relative p-6 animate-fade-in-up overflow-y-auto`}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
        >
          &times;
        </button>

        {/* Modal title */}
        {title && (
          <h2 className="text-xl font-semibold mb-4 text-gray-800 pr-6">
            {title}
          </h2>
        )}

        {/* Scrollable content */}
        <div className="overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
