import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="bg-gray-100 dark:bg-gray-900 flex-1 min-h-screen ">
      <div className="flex-1  overflow-y-auto p-4 md:p-6">
        <div className="space-y-6 h-full overflow-y-auto">
          <div className="flex flex-col md:flex-row justify-end items-center gap-4">
            <Skeleton className="h-[42px] w-[140px] rounded-xl bg-white" />
          </div>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-[125px] w-[100%] rounded-xl bg-white" />
            <Skeleton className="h-[125px] w-[100%] rounded-xl bg-white" />
            <Skeleton className="h-[125px] w-[100%] rounded-xl bg-white" />
            <Skeleton className="h-[125px] w-[100%] rounded-xl bg-white" />
          </div>
          <div className="">
            <Skeleton className="h-[42px] w-[140px] rounded-xl bg-white" />
          </div>
          <div className="">
            <Skeleton className="h-[40vh] w-[100%] rounded-xl bg-white" />
          </div>
        </div>
      </div>
    </div>
  )
}
