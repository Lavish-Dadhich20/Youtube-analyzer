export function SkeletonBlock({ className = "" }) {
  return (
    <div className={`bg-gray-800 rounded-lg animate-pulse ${className}`} />
  );
}

export function AnalyzeSkeleton() {
  return (
    <div className="mt-10 space-y-6 animate-pulse">
      <div className="flex gap-6 items-start bg-gray-900 border border-gray-800 rounded-xl p-6">
        <SkeletonBlock className="w-48 h-28 flex-shrink-0" />
        <div className="flex-1 space-y-3">
          <SkeletonBlock className="h-5 w-3/4" />
          <SkeletonBlock className="h-4 w-1/3" />
          <SkeletonBlock className="h-4 w-1/2" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <SkeletonBlock className="h-32 rounded-xl" />
        <SkeletonBlock className="h-32 rounded-xl" />
        <SkeletonBlock className="h-32 rounded-xl" />
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-3">
        <SkeletonBlock className="h-4 w-1/4" />
        <SkeletonBlock className="h-3 w-full" />
        <SkeletonBlock className="h-3 w-full" />
        <SkeletonBlock className="h-3 w-2/3" />
      </div>
    </div>
  );
}

export function TrendingCardSkeleton() {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden animate-pulse">
      <SkeletonBlock className="w-full aspect-video rounded-none" />
      <div className="p-4 space-y-2">
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-2/3" />
        <SkeletonBlock className="h-3 w-1/3" />
      </div>
    </div>
  );
}