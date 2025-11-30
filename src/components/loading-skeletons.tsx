import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

export function DriverPerformanceCardSkeleton() {
  return (
    <Card className="bg-gradient-to-br from-gray-50 to-white p-4 border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <Skeleton className="w-24 h-4" />
        <Skeleton className="rounded-full w-16 h-6" />
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <Skeleton className="w-16 h-3" />
          <Skeleton className="w-12 h-4" />
        </div>
        <div className="flex justify-between items-center mb-2">
          <Skeleton className="w-20 h-3" />
          <Skeleton className="w-8 h-5" />
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex justify-between items-center">
            <Skeleton className="w-20 h-3" />
            <Skeleton className="w-8 h-3" />
          </div>
        ))}
      </div>

      <div className="space-y-2 mb-4 pt-2 border-gray-200 border-t">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex justify-between items-center">
            <Skeleton className="w-24 h-3" />
            <Skeleton className="w-12 h-3" />
          </div>
        ))}
      </div>

      <div className="space-y-2 mb-4 pt-2 border-gray-200 border-t">
        <div className="flex justify-between items-center">
          <Skeleton className="w-16 h-3" />
          <Skeleton className="w-8 h-3" />
        </div>
      </div>
    </Card>
  )
}

export function DriverTableRowSkeleton() {
  return (
    <tr className="hover:bg-gray-50 border-gray-200 border-b">
      <td className="px-4 py-3">
        <Skeleton className="w-16 h-4" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="w-24 h-4" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="w-12 h-4" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="w-16 h-4" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="w-12 h-4" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="w-12 h-4" />
      </td>
      <td className="px-4 py-3">
        <div className="flex space-x-2">
          <Skeleton className="w-8 h-8" />
          <Skeleton className="w-8 h-8" />
          <Skeleton className="w-8 h-8" />
        </div>
      </td>
    </tr>
  )
}

export function ChartSkeleton() {
  return (
    <Card className="p-6">
      <div className="mb-4">
        <Skeleton className="mb-2 w-32 h-6" />
        <Skeleton className="w-48 h-4" />
      </div>
      <Skeleton className="w-full h-64" />
    </Card>
  )
}

export function StatsCardSkeleton() {
  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <Skeleton className="w-20 h-4" />
        <Skeleton className="w-8 h-8" />
      </div>
      <Skeleton className="mb-2 w-16 h-8" />
      <Skeleton className="w-24 h-3" />
    </Card>
  )
}

export function DriverPerformanceGridSkeleton() {
  return (
    <div className="gap-6 grid grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <DriverPerformanceCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function DriverTableSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-gray-200 border-b">
            <tr>
               {Array.from({ length: 7 }).map((_, i) => (
                <th key={i} className="px-4 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                  <Skeleton className="w-16 h-3" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Array.from({ length: 5 }).map((_, i) => (
              <DriverTableRowSkeleton key={i} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
