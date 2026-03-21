import { SkeletonGrid } from '@/components/SkeletonCard'

export default function Loading() {
  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-end justify-between">
            <div>
              <div className="h-8 w-36 bg-stone-100 rounded animate-pulse mb-2" />
              <div className="h-4 w-52 bg-stone-100 rounded animate-pulse" />
            </div>
            <div className="h-4 w-24 bg-stone-100 rounded animate-pulse" />
          </div>
        </div>
      </header>

      <div className="bg-white border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex gap-3">
          <div className="h-9 w-32 bg-stone-100 rounded-full animate-pulse" />
          <div className="h-9 w-28 bg-stone-100 rounded-full animate-pulse" />
          <div className="h-9 w-24 bg-stone-100 rounded-full animate-pulse" />
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <SkeletonGrid />
      </main>
    </div>
  )
}
