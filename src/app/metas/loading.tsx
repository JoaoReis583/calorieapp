import { Navbar } from '@/components/navbar'

function SkeletonBox({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-100 ${className || ''}`} />
}

export default function MetasLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        <div className="space-y-2">
          <SkeletonBox className="h-8 w-44" />
          <SkeletonBox className="h-4 w-72" />
        </div>

        <div className="max-w-xl space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <SkeletonBox className="h-4 w-32 rounded-lg" />
              <SkeletonBox className="h-12 w-full rounded-xl" />
            </div>
          ))}
          <SkeletonBox className="h-12 w-36 rounded-xl" />
        </div>
      </main>
    </div>
  )
}
