import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center text-center px-4">
      <div className="text-5xl mb-4">🍽️</div>
      <h1 className="text-2xl font-bold text-stone-900 mb-2">Restaurant not found</h1>
      <p className="text-stone-400 text-sm mb-8 max-w-xs">
        This restaurant is not in our list or may have been removed.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 bg-stone-900 hover:bg-stone-700 text-white rounded-xl px-5 py-3 text-sm font-medium transition-colors"
      >
        ← Back to all restaurants
      </Link>
    </div>
  )
}
