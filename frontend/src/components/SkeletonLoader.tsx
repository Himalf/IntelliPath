export function SkeletonLoader() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, idx) => (
        <div key={idx} className="flex items-center gap-4 animate-pulse">
          <div className="h-6 w-1/4 bg-gray-300 rounded"></div>
          <div className="h-6 w-1/4 bg-gray-300 rounded"></div>
          <div className="h-6 w-1/4 bg-gray-300 rounded"></div>
          <div className="h-6 w-1/4 bg-gray-300 rounded"></div>
        </div>
      ))}
    </div>
  );
}
