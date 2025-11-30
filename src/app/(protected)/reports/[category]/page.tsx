"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { LayoutGrid, List, Star, ChevronDown } from "lucide-react"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { reportsData } from "@/lib/reports-data"

export default function ReportsCategoryPage() {
  const params = useParams()
  const categorySlug = params.category as string

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState<"name" | "type">("name")



  const categoryName = categorySlug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")

  const filteredReports = reportsData.filter((report) => report.category === categorySlug)

  const sortedReports = [...filteredReports].sort((a, b) => {
    if (sortBy === "name") {
      return a.name.localeCompare(b.name)
    } else if (sortBy === "type") {
      return a.type.localeCompare(b.type)
    }
    return 0
  })

  return (
        <div className="flex h-full flex-col">
          {/* Header */}
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex items-center gap-2 flex-1">
              <Link href="/reports" className="text-blue-600 hover:underline">
                Reports
              </Link>
              <span className="text-muted-foreground">/</span>
              <span className="font-medium">{categoryName} Reports</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Report Type <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSortBy("name")}>Sort by Name</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("type")}>Sort by Type</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setViewMode("grid")}
                className={viewMode === "grid" ? "bg-muted" : ""}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setViewMode("list")}
                className={viewMode === "list" ? "bg-muted" : ""}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </header>

          {/* Main Content */}
          <div className="flex-1 p-4 overflow-auto">
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {sortedReports.map((report) => (
                  <Link key={report.id} href={`/reports/${report.category}/${report.id}`}>
                    <Card className="h-full flex flex-col justify-between hover:shadow-md transition-shadow">
                      <CardHeader>
                        <CardTitle>{report.name}</CardTitle>
                        <CardDescription>{report.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex justify-end">
                        <Badge variant="secondary">{report.type}</Badge>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 font-medium w-10"></th>
                      <th className="text-left p-3 font-medium">Name</th>
                      <th className="text-left p-3 font-medium">Description</th>
                      <th className="text-left p-3 font-medium">Report Type</th>
                      <th className="text-left p-3 font-medium">Saved Reports</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedReports.map((report) => (
                      <tr key={report.id} className="border-t hover:bg-muted/25">
                        <td className="p-3">
                          <Star className="h-4 w-4 text-muted-foreground" />
                        </td>
                        <td className="p-3">
                          <Link
                            href={`/reports/${report.category}/${report.id}`}
                            className="text-blue-600 hover:underline"
                          >
                            {report.name}
                          </Link>
                        </td>
                        <td className="p-3 text-sm text-muted-foreground">{report.description}</td>
                        <td className="p-3">
                          <Badge variant="secondary">{report.type}</Badge>
                        </td>
                        <td className="p-3 text-sm text-muted-foreground">-</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
  )
}
