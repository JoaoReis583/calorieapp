import { Navbar } from '@/components/navbar'

function SkeletonBox({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-100 ${className || ''}`} />
}

export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Header skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <SkeletonBox className="h-8 w-52" />
            <SkeletonBox className="h-4 w-72" />
          </div>
          <SkeletonBox className="h-11 w-44 rounded-xl" />
        </div>

        {/* Progress cards skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <SkeletonBox className="lg:col-span-5 h-72 rounded-[2rem]" />
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <SkeletonBox className="h-44 rounded-[2rem]" />
            <SkeletonBox className="h-44 rounded-[2rem]" />
            <SkeletonBox className="h-44 rounded-[2rem]" />
          </div>
        </div>

        {/* Meals skeleton */}
        <div className="space-y-4">
          <SkeletonBox className="h-7 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SkeletonBox className="h-64 rounded-[2rem]" />
            <SkeletonBox className="h-64 rounded-[2rem]" />
          </div>
        </div>
      </main>
    </div>
  )
}
