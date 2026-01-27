// Skeleton loader for campaign cards
function SkeletonCard() {
  return (
    <li className="group animate-pulse">
      <div className="h-full bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
        {/* Header skeleton */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="h-3 bg-slate-700 rounded w-20 mb-2"></div>
            <div className="h-4 bg-slate-700 rounded w-32"></div>
          </div>
          <div className="h-6 w-16 bg-slate-700 rounded-full"></div>
        </div>

        {/* Progress skeleton */}
        <div className="mb-4">
          <div className="flex justify-between items-baseline mb-2">
            <div>
              <div className="h-8 bg-slate-700 rounded w-24 mb-1"></div>
              <div className="h-3 bg-slate-700 rounded w-32"></div>
            </div>
            <div className="h-6 bg-slate-700 rounded w-12"></div>
          </div>
          <div className="w-full bg-slate-700/50 rounded-full h-2"></div>
        </div>

        {/* Creator info skeleton */}
        <div className="mb-4 pb-4 border-b border-slate-700">
          <div className="h-3 bg-slate-700 rounded w-16 mb-1"></div>
          <div className="h-4 bg-slate-700 rounded w-28"></div>
        </div>

        {/* Reward rate skeleton */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <div className="h-3 bg-slate-700 rounded w-20 mb-1"></div>
            <div className="h-4 bg-slate-700 rounded w-24"></div>
          </div>
          <div className="w-10 h-10 bg-slate-700 rounded-lg"></div>
        </div>

        {/* Button skeleton */}
        <div className="h-10 bg-slate-700 rounded-lg"></div>
      </div>
    </li>
  );
}

export default SkeletonCard;
