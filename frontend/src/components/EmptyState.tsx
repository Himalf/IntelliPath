import { UserX } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center py-10 text-gray-400">
      <UserX className="w-12 h-12 mb-4" />
      <p>No users found matching your search.</p>
    </div>
  );
}
