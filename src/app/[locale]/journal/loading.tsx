import Skeleton from '@/components/ui/Skeleton'

export default function JournalLoading() {
  return (
    <>
      <div className="text-center px-6 pt-12 pb-2 flex flex-col items-center gap-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-12 w-64" />
      </div>

      <div className="flex justify-center px-6 pt-6 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-16" />
        ))}
      </div>

      <div className="container mx-auto px-6 sm:px-14 pt-7">
        <Skeleton className="h-[360px] w-full rounded-lg" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 container mx-auto px-6 sm:px-14 pt-9 pb-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3">
            <Skeleton className="aspect-[4/3] w-full" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-4/5" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>
    </>
  )
}
