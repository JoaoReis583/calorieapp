import { Navbar } from '@/components/navbar'

function SkeletonBox({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-100 ${className || ''}`} />
}

export default function EstatisticasLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        <div className="space-y-2">
          <SkeletonBox className="h-8 w-56" />
          <SkeletonBox className="h-4 w-80" />
        </div>

        {/* Stats cards skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBox key={i} className="h-32 rounded-[2rem]" />
          ))}
        </div>

        {/* Chart skeleton */}
        <SkeletonBox className="h-72 w-full rounded-[2rem]" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SkeletonBox className="h-60 rounded-[2rem]" />
          <SkeletonBox className="h-60 rounded-[2rem]" />
        </div>
      </main>
    </div>
  )
}
