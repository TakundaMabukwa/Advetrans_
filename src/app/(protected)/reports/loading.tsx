import { Skeleton } from "@/components/ui/skeleton"

import { Separator } from "@/components/ui/separator"

export default function ReportsLoading() {
    return (

        <div className="flex h-full flex-col">
            {/* Header */}
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                <Separator orientation="vertical" className="mr-2 h-4" />
                <div className="flex items-center gap-2 flex-1">
                    <Skeleton className="h-5 w-5" />
                    <Skeleton className="h-6 w-32" />
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 p-6">
                <div className="space-y-4">
                    {/* Grid Loading */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {Array.from({ length: 12 }).map((_, index) => (
                            <div key={index} className="border rounded-lg p-4 space-y-3">
                                <Skeleton className="h-5 w-3/4" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-2/3" />
                                <Skeleton className="h-6 w-20" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
