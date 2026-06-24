import { Navbar } from '@/components/navbar'

function SkeletonBox({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-100 ${className || ''}`} />
}

export default function HistoricoLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        <div className="space-y-2">
          <SkeletonBox className="h-8 w-56" />
          <SkeletonBox className="h-4 w-80" />
        </div>

        {/* Month navigation skeleton */}
        <div className="flex items-center gap-4">
          <SkeletonBox className="h-9 w-9 rounded-xl" />
          <SkeletonBox className="h-6 w-36 rounded-lg" />
          <SkeletonBox className="h-9 w-9 rounded-xl" />
        </div>

        {/* Calendar grid skeleton */}
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }).map((_, i) => (
            <SkeletonBox key={i} className="aspect-square rounded-xl" />
          ))}
        </div>
      </main>
    </div>
  )
}
