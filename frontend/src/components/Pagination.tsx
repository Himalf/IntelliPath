import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  return (
    <div className="flex justify-center gap-2 py-4">
      <Button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 bg-gray-200 text-gray-800 rounded disabled:opacity-50 hover:bg-gray-300"
      >
        Previous
      </Button>
      <span className="flex items-center text-sm text-gray-600">
        Page {currentPage} of {totalPages}
      </span>
      <Button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 bg-gray-200 text-gray-800 rounded disabled:opacity-50 hover:bg-gray-300"
      >
        Next
      </Button>
    </div>
  );
}
