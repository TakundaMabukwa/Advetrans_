"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import {
    Save,
    Share,
    Download,
    Filter,
    ChevronLeft,
    ChevronRight,
    Printer,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { getReportBySlug } from "@/lib/reports-data"

// Mock inspection data
const mockInspectionData = [
    {
        vehicleReg: "BX71YGP",
        department: {
            nationalDept: "Transport",
            departmentName: "Maintenance",
            region: "Gauteng",
            unit: "Vehicle Inspections",
            clientName: "City of Johannesburg",
        },
        asset: {
            model: "HiAce",
            make: "Toyota",
            modelYear: 2019,
            status: "Active",
        },
        inspections: [
            {
                id: "INSP-001",
                date: "2025-08-01",
                time: "08:00",
                inspector: "John Mokoena",
                outcome: "Pass",
                issues: "None",
                nextService: "2025-12-01",
                remarks: "All good",
            },
            {
                id: "INSP-002",
                date: "2025-08-05",
                time: "09:00",
                inspector: "Thuli Ndlovu",
                outcome: "Fail",
                issues: "Brake pads worn",
                nextService: "2025-09-01",
                remarks: "Urgent repair needed",
            },
            {
                id: "INSP-003",
                date: "2025-08-10",
                time: "07:45",
                inspector: "Sipho Mahlangu",
                outcome: "Pass",
                issues: "Minor scratch",
                nextService: "2026-01-10",
                remarks: "Scratch not critical",
            },
            {
                id: "INSP-004",
                date: "2025-08-11",
                time: "11:30",
                inspector: "Lerato Dube",
                outcome: "Pass",
                issues: "None",
                nextService: "2026-01-11",
                remarks: "Clean condition",
            },
            {
                id: "INSP-005",
                date: "2025-08-15",
                time: "10:00",
                inspector: "John Mokoena",
                outcome: "Fail",
                issues: "Headlight out",
                nextService: "2025-08-25",
                remarks: "Replace headlight",
            },
            {
                id: "INSP-006",
                date: "2025-08-17",
                time: "13:00",
                inspector: "Thuli Ndlovu",
                outcome: "Pass",
                issues: "None",
                nextService: "2026-01-17",
                remarks: "No issues found",
            },
            {
                id: "INSP-007",
                date: "2025-08-19",
                time: "14:45",
                inspector: "Sipho Mahlangu",
                outcome: "Pass",
                issues: "Tyre slightly worn",
                nextService: "2025-12-19",
                remarks: "Monitor tyre wear",
            },
            {
                id: "INSP-008",
                date: "2025-08-20",
                time: "08:30",
                inspector: "Lerato Dube",
                outcome: "Fail",
                issues: "Battery not holding charge",
                nextService: "2025-08-30",
                remarks: "Battery replacement needed",
            },
            {
                id: "INSP-009",
                date: "2025-08-23",
                time: "07:00",
                inspector: "John Mokoena",
                outcome: "Pass",
                issues: "None",
                nextService: "2026-01-23",
                remarks: "Excellent condition",
            },
            {
                id: "INSP-010",
                date: "2025-08-25",
                time: "12:00",
                inspector: "Thuli Ndlovu",
                outcome: "Pass",
                issues: "None",
                nextService: "2026-01-25",
                remarks: "All clear",
            },
        ],
    },
]

export default function InspectionReportDetailPage() {
    const params = useParams()
    const category = params.category as string
    const slug = params.slug as string
    const [userRole, setUserRole] = useState<"fleet-manager" | "admin" | "cost-center" | "call-center" | "customer">("fleet-manager")

    useEffect(() => {
        const role = localStorage.getItem("userRole") as typeof userRole
        if (role) setUserRole(role)
    }, [])

    const report = getReportBySlug(category, slug)

    const getReportTitle = () => {
        if (!report) return "Report Not Found"
        return report.name
    }

    return (
        <div className="flex h-full flex-col">
            {/* Header */}
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                <div className="flex items-center gap-2 flex-1">
                    <Link href="/reports" className="text-blue-600 hover:underline">
                        Reports
                    </Link>
                    <span className="text-muted-foreground">/</span>
                    <Link href={`/reports/${category}`} className="text-blue-600 hover:underline">
                        {category}
                    </Link>
                    <span className="text-muted-foreground">/</span>
                    <span className="font-medium">{getReportTitle()} Report</span>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        <Save className="h-4 w-4 mr-2" /> Save
                    </Button>
                    <Button variant="outline" size="sm">
                        <Share className="h-4 w-4 mr-2" /> Share
                    </Button>
                    <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" /> Export CSV
                    </Button>
                    <Button variant="outline" size="sm">
                        <Printer className="h-4 w-4 mr-2" /> Print
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex flex-1 flex-col overflow-auto p-4 space-y-4">
                {/* Table */}
                <div className="border rounded-lg overflow-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="text-left p-3">National Dept</th>
                                <th className="text-left p-3">Department</th>
                                <th className="text-left p-3">Region</th>
                                <th className="text-left p-3">Unit</th>
                                <th className="text-left p-3">Client</th>
                                <th className="text-left p-3">Vehicle Reg</th>
                                <th className="text-left p-3">Model</th>
                                <th className="text-left p-3">Make</th>
                                <th className="text-left p-3">Year</th>
                                <th className="text-left p-3">Status</th>
                                <th className="text-left p-3">Inspection ID</th>
                                <th className="text-left p-3">Date</th>
                                <th className="text-left p-3">Time</th>
                                <th className="text-left p-3">Inspector</th>
                                <th className="text-left p-3">Outcome</th>
                                <th className="text-left p-3">Issues Found</th>
                                <th className="text-left p-3">Next Service</th>
                                <th className="text-left p-3">Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockInspectionData.map((record, i) =>
                                record.inspections.map((insp, j) => (
                                    <tr key={`insp-${i}-${j}`} className="border-t hover:bg-muted/25">
                                        <td className="p-3">{record.department.nationalDept}</td>
                                        <td className="p-3">{record.department.departmentName}</td>
                                        <td className="p-3">{record.department.region}</td>
                                        <td className="p-3">{record.department.unit}</td>
                                        <td className="p-3">{record.department.clientName}</td>
                                        <td className="p-3">{record.vehicleReg}</td>
                                        <td className="p-3">{record.asset.model}</td>
                                        <td className="p-3">{record.asset.make}</td>
                                        <td className="p-3">{record.asset.modelYear}</td>
                                        <td className="p-3">{record.asset.status}</td>
                                        <td className="p-3">{insp.id}</td>
                                        <td className="p-3">{insp.date}</td>
                                        <td className="p-3">{insp.time}</td>
                                        <td className="p-3">{insp.inspector}</td>
                                        <td className="p-3">{insp.outcome}</td>
                                        <td className="p-3">{insp.issues}</td>
                                        <td className="p-3">{insp.nextService}</td>
                                        <td className="p-3">{insp.remarks}</td>
                                    </tr>
                                )),
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
