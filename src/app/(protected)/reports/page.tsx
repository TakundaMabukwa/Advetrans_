"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import {
    Grid3X3,
    List,
    Star,
    FileText,
    Users,
    Truck,
    AlertTriangle,
    Wrench,
    ClipboardList,
    UserCheck,
    Cog,
    Fuel,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const reportIcons = {
    Vehicles: Truck,
    "Vehicle Assignments": UserCheck,
    Inspections: ClipboardList,
    Issues: AlertTriangle,
    Service: Wrench,
    Parts: Cog,
    Fuel: Fuel,
}

const allReports = [
    {
        name: "Group Changes",
        description: "List updates to every vehicle's group.",
        type: "Vehicles",
        category: "vehicles",
        slug: "group-changes",
    },
    {
        name: "Vehicle Renewal Reminders",
        description: "Lists all date-based reminders for vehicles.",
        type: "Vehicles",
        category: "vehicles",
        slug: "vehicles",
    },
    {
        name: "Status Changes",
        description: "List updates to every vehicle's status.",
        type: "Vehicles",
        category: "vehicles",
        slug: "status-changes",
    },
    {
        name: "Status Summary",
        description: "Lists the time vehicles have spent in different statuses.",
        type: "Vehicles",
        category: "vehicles",
        slug: "status-summary",
    },
    {
        name: "Vehicles Report",
        description: "Listing of all basic vehicle information.",
        type: "Vehicles",
        category: "vehicles",
        slug: "vehicles",
    },
    {
        name: "Cost Comparison by Year in Service",
        description: "Analysis of total vehicle costs per meter based on when in the vehicle's life costs occurred.",
        type: "Vehicles",
        category: "vehicles",
        slug: "cost-comparison-by-year-in-service",
    },
    {
        name: "Cost/Meter Trend",
        description: "Analysis of total vehicle costs per meter over time.",
        type: "Vehicles",
        category: "vehicles",
        slug: "cost-meter-trend",
    },
    {
        name: "Vehicle Details",
        description: "Listing of full vehicle profiles & details.",
        type: "Vehicles",
        category: "vehicles",
        slug: "vehicles",
    },
    {
        name: "Expense Summary",
        description: "Aggregate expense costs grouped by expense type or vehicle group.",
        type: "Vehicles",
        category: "vehicles",
        slug: "expense-summary",
    },
    {
        name: "Expenses by Vehicle",
        description: "Listing of all expense entries by vehicle.",
        type: "Vehicles",
        category: "vehicles",
        slug: "expenses-by-vehicle",
    },
    {
        name: "Operating Costs Summary",
        description: "Summary of costs associated with vehicles.",
        type: "Vehicles",
        category: "vehicles",
        slug: "operating",
    },
    {
        name: "Total Cost Trend",
        description: "Analysis of total vehicle costs over time.",
        type: "Vehicles",
        category: "vehicles",
        slug: "total",
    },
    {
        name: "Utilization Summary",
        description: "Shows usage per vehicle based on meter entries.",
        type: "Vehicles",
        category: "vehicles",
        slug: "utilization",
    },
    {
        name: "Vehicle Assignment Log",
        description: "Listing of all vehicle-to-contact assignment details.",
        type: "Vehicle Assignments",
        category: "vehicle-assignments",
        slug: "vehicle-assignment-log",
    },
    {
        name: "Vehicle Assignments Summary",
        description: "Aggregate vehicle assignment data grouped by operator or vehicle.",
        type: "Vehicle Assignments",
        category: "vehicle-assignments",
        slug: "vehicle-assignments-summary",
    },

    {
        name: "Inspection Submission List",
        description: "Listing of all inspection submissions.",
        type: "Inspections",
        category: "inspections",
        slug: "inspection-submission-list",
    },
    {
        name: "Inspection Failures List",
        description: "Listing of all failed inspection items.",
        type: "Inspections",
        category: "inspections",
        slug: "inspections",
    },
    {
        name: "Inspection Schedules",
        description: "Listing of all inspection schedules.",
        type: "Inspections",
        category: "inspections",
        slug: "inspections",
    },
    {
        name: "Inspection Submissions Summary",
        description: "Aggregate inspection data grouped by user or vehicle.",
        type: "Inspections",
        category: "inspections",
        slug: "inspections",
    },
    {
        name: "Faults Summary",
        description: "Listing of summarized fault metrics for particular fault codes and vehicles.",
        type: "Issues",
        category: "issues",
        slug: "faults-summary",
    },
    {
        name: "Issues List",
        description: "Lists basic details of all vehicle-related issues.",
        type: "Issues",
        category: "issues",
        slug: "issues",
    },

    {
        name: "Repair Priority Class Summary",
        description: "Aggregate Service Data breakdown of Scheduled, Non-Scheduled, and Emergency Repairs.",
        type: "Service",
        category: "service",
        slug: "repair",
    },
    {
        name: "Service History by Vehicle",
        description: "Listing of all service by vehicle grouped by entry or task.",
        type: "Service",
        category: "service",
        slug: "service-history-by-vehicle",
    },
    {
        name: "Service Entries Summary",
        description: "Listing of summarized service history for vehicles.",
        type: "Service",
        category: "service",
        slug: "service-entries-summary",
    },
    {
        name: "Service Reminder Compliance",
        description: "Shows history of completed Service Reminders as On Time/Late.",
        type: "Service",
        category: "service",
        slug: "service-reminder-compliance",
    },
    {
        name: "Service Reminders",
        description: "Lists all service reminders.",
        type: "Service",
        category: "service",
        slug: "service",
    },
    {
        name: "Service Task Summary",
        description: "Aggregate service data grouped by Service Task.",
        type: "Service",
        category: "service",
        slug: "service",
    },
    {
        name: "Vehicles Without Service",
        description: "Lists all vehicles that haven't had a service task(s) performed.",
        type: "Service",
        category: "service",
        slug: "vehicles",
    },
    {
        name: "Maintenance Categorization Summary",
        description: "Aggregate service data grouped by VMRS Category, System, or Reason for Repair Codes.",
        type: "Service",
        category: "service",
        slug: "maintenance",
    },
    {
        name: "Parts by Vehicle",
        description: "Listing of all parts used on each vehicle.",
        type: "Parts",
        category: "parts",
        slug: "parts",
    },

    {
        name: "Fuel Entries by Vehicle",
        description: "Listing of fuel entries by vehicle.",
        type: "Fuel",
        category: "fuel",
        slug: "fuel",
    },
    {
        name: "Fuel Summary",
        description: "Listing of summarized fuel metrics by vehicles.",
        type: "Fuel",
        category: "fuel",
        slug: "fuel-summary",
    },
    {
        name: "Fuel Summary by Location",
        description: "Aggregate fuel volume and price data grouped by location and fuel type.",
        type: "Fuel",
        category: "fuel",
        slug: "fuel-summary-by-location",
    },
]

const categoryReports = {
    vehicles: allReports.filter((r) => r.category === "vehicles"),
    "vehicle-assignments": allReports.filter((r) => r.category === "vehicle-assignments"),
    inspections: allReports.filter((r) => r.category === "inspections"),
    issues: allReports.filter((r) => r.category === "issues"),
    service: allReports.filter((r) => r.category === "service"),
    parts: allReports.filter((r) => r.category === "parts"),
    fuel: allReports.filter((r) => r.category === "fuel"),
}

export default function ReportsPage() {
    const [reportType, setReportType] = useState<string>("all")

    const [userRole, setUserRole] = useState<"call-center" | "fleet-manager" | "cost-center" | "customer" | "admin">(
        "fleet-manager",
    )
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
    const searchParams = useSearchParams()

    useEffect(() => {
        const role = localStorage.getItem("userRole") as typeof userRole
        if (role) setUserRole(role)
    }, [])

    const getCurrentReports = () => {
        const category = searchParams.get("category")
        let reports = allReports

        if (category && categoryReports[category as keyof typeof categoryReports]) {
            reports = categoryReports[category as keyof typeof categoryReports]
        }

        if (reportType !== "all") {
            reports = reports.filter((r) => r.type === reportType)
        }

        return reports
    }


    const getPageTitle = () => {
        const category = searchParams.get("category")
        if (category) {
            return category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, " ") + " Reports"
        }
        return "Standard Reports"
    }

    const handleReportClick = (report: any) => {
        window.location.href = `/reports/${report.slug}`
    }

    const reportsToShow = getCurrentReports()

    return (
        <div className="flex h-full flex-col">
            {/* Header */}
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">

                <Separator orientation="vertical" className="mr-2 h-4" />
                <div className="flex items-center gap-2 flex-1">
                    <FileText className="h-5 w-5" />
                    <h1 className="text-lg font-semibold">{getPageTitle()}</h1>
                </div>
                <div className="flex items-center gap-2">
                    <Select value={reportType} onValueChange={setReportType}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Filter by Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            {[...new Set(allReports.map((r) => r.type))].map((type) => (
                                <SelectItem key={type} value={type}>
                                    {type}
                                </SelectItem>
                            ))}
                        </SelectContent>

                    </Select>
                    <Button
                        variant={viewMode === "grid" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setViewMode("grid")}
                    >
                        <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={viewMode === "list" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setViewMode("list")}
                    >
                        <List className="h-4 w-4" />
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 p-6">
                <div className="space-y-4">
                    {/* Reports Display */}
                    {viewMode === "list" ? (
                        <div className="space-y-2">
                            {/* Table Header */}
                            <div className="grid grid-cols-12 gap-4 p-3 text-sm font-medium text-muted-foreground border-b">
                                <div className="col-span-1"></div>
                                <div className="col-span-3">Name</div>
                                <div className="col-span-5">Description</div>
                                <div className="col-span-2">Report Type ▲</div>
                                <div className="col-span-1">Saved Reports</div>
                            </div>

                            {/* Table Rows */}
                            {reportsToShow.map((report, index) => (
                                <div
                                    key={index}
                                    className="grid grid-cols-12 gap-4 p-3 hover:bg-muted/50 border-b border-border/50 cursor-pointer"
                                    onClick={() => handleReportClick(report)}
                                >
                                    <div className="col-span-1 flex items-center">
                                        <Star className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div className="col-span-3 font-medium text-blue-600 hover:underline">{report.name}</div>
                                    <div className="col-span-5 text-sm text-muted-foreground">{report.description}</div>
                                    <div className="col-span-2">
                                        <Badge variant="secondary">{report.type}</Badge>
                                    </div>
                                    <div className="col-span-1"></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {reportsToShow.map((report, index) => (
                                <Card
                                    key={index}
                                    className="hover:shadow-md transition-shadow cursor-pointer h-48 flex flex-col"
                                    onClick={() => handleReportClick(report)}
                                >
                                    <CardHeader className="pb-3 flex-1">
                                        <CardTitle className="text-base text-blue-600 hover:underline line-clamp-2">
                                            {report.name}
                                        </CardTitle>
                                        <CardDescription className="text-sm line-clamp-3 flex-1">{report.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-0 mt-auto">
                                        <Badge variant="secondary">{report.type}</Badge>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {reportsToShow.length === 0 && (
                        <div className="text-center py-12">
                            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium mb-2">No reports found</h3>
                            <p className="text-muted-foreground">No reports available for this category.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
