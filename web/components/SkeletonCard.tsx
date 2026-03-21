export const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-stone-200 p-5 animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="h-4 w-16 bg-stone-100 rounded-full" />
      <div className="h-6 w-20 bg-stone-100 rounded-full" />
    </div>
    <div className="h-5 w-3/4 bg-stone-100 rounded mb-2" />
    <div className="h-4 w-1/3 bg-stone-100 rounded mb-4" />
    <div className="flex gap-2 mb-4">
      <div className="h-6 w-16 bg-stone-100 rounded-full" />
      <div className="h-6 w-20 bg-stone-100 rounded-full" />
    </div>
    <div className="h-4 w-2/3 bg-stone-100 rounded mb-4" />
    <div className="border-t border-stone-100 pt-3">
      <div className="h-4 w-24 bg-stone-100 rounded" />
    </div>
  </div>
)

export const SkeletonGrid = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {Array.from({ length: 6 }).map((_, index) => (
      <SkeletonCard key={index} />
    ))}
  </div>
)
