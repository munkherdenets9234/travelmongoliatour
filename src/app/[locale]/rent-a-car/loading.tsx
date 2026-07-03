import Skeleton from '@/components/ui/Skeleton'

export default function RentACarLoading() {
  return (
    <>
      <section className="relative h-[320px] bg-ink" />

      <div className="container mx-auto px-6 sm:px-14 -mt-9 relative z-10">
        <div className="bg-white rounded-md shadow-[0_20px_44px_rgba(30,27,22,0.14)] p-5 flex flex-wrap items-end gap-5">
          <Skeleton className="h-11 w-40" />
          <Skeleton className="h-11 w-40" />
          <Skeleton className="h-11 w-64" />
        </div>
      </div>

      <div className="container mx-auto px-6 sm:px-14 pt-8 flex flex-wrap gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20" />
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 container mx-auto px-6 sm:px-14 py-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-md overflow-hidden bg-white shadow-[0_10px_26px_rgba(30,27,22,0.09)]">
            <Skeleton className="h-[180px] w-full rounded-none" />
            <div className="p-5 flex flex-col gap-3">
              <Skeleton className="h-6 w-3/4" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-14" />
                <Skeleton className="h-6 w-14" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-7 w-20" />
                <Skeleton className="h-9 w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
