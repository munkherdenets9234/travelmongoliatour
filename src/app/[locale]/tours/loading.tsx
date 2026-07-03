import Skeleton from '@/components/ui/Skeleton'

export default function ToursLoading() {
  return (
    <>
      <section className="relative h-[360px] bg-ink" />

      <div className="flex flex-wrap items-center justify-between gap-4 container mx-auto px-6 sm:px-14 pt-6">
        <Skeleton className="h-7 w-40" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-24" />
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10 container mx-auto px-6 sm:px-14 py-8">
        <aside className="lg:w-56 flex-none flex flex-col gap-7">
          <Skeleton className="h-4 w-20" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </aside>

        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[420px] w-full" />
          ))}
        </div>
      </div>
    </>
  )
}
