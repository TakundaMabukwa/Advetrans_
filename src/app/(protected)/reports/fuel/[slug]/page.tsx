"use client"

import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
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

// Sample structured fuel data
const mockFuelData = [
  {
    vehicleReg: "ABC123GP",
    department: {
      nationalDept: "Transport",
      departmentName: "Fleet Operations",
      region: "Gauteng",
      unit: "Fleet Management Unit",
      clientName: "City of Johannesburg",
      division: "Vehicle Services",
      costCentre: "FS001",
    },
    asset: {
      model: "Corolla Quest",
      make: "Toyota",
      modelYear: 2020,
      age: 5,
      status: "Active",
    },
    entries: [
      {
        transactionNo: "TX-001",
        odo: 125000,
        distanceTravelled: 65,
        fuelVolume: 10,
        fuelPrice: "R21.40",
        transactionDate: "2025-08-01",
        transactionTime: "08:25",
        oilCompany: "Engen",
        town: "Soweto",
        fuelStation: "Engen Dobsonville",
        transactionType: "Refuel",
        townDetail: "Zone 10, Soweto",
      },
      {
        transactionNo: "TX-002",
        odo: 125680,
        distanceTravelled: 68,
        fuelVolume: 11,
        fuelPrice: "R21.60",
        transactionDate: "2025-08-04",
        transactionTime: "09:15",
        oilCompany: "Shell",
        town: "Randburg",
        fuelStation: "Shell Randburg CBD",
        transactionType: "Refuel",
        townDetail: "CBD, Randburg",
      },
    ],
  },
]

export default function FuelReportDetailPage() {
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

      {/* Content */}
      <div className="flex flex-1 flex-col overflow-auto p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" /> Filters
          </Button>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" disabled>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3">National/Prov Dept</th>
                <th className="text-left p-3">Department</th>
                <th className="text-left p-3">Region/District</th>
                <th className="text-left p-3">Unit</th>
                <th className="text-left p-3">Client Name</th>
                <th className="text-left p-3">Division</th>
                <th className="text-left p-3">Cost Centre</th>
                <th className="text-left p-3">Vehicle Reg</th>
                <th className="text-left p-3">Asset Model</th>
                <th className="text-left p-3">Asset Make</th>
                <th className="text-left p-3">Model Year</th>
                <th className="text-left p-3">Age</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Transaction #</th>
                <th className="text-left p-3">Odometer</th>
                <th className="text-left p-3">Distance</th>
                <th className="text-left p-3">Fuel Volume (L)</th>
                <th className="text-left p-3">Fuel Price</th>
                <th className="text-left p-3">Date</th>
                <th className="text-left p-3">Time</th>
                <th className="text-left p-3">Oil Company</th>
                <th className="text-left p-3">Town</th>
                <th className="text-left p-3">Fuel Station</th>
                <th className="text-left p-3">Type</th>
                <th className="text-left p-3">Town Detail</th>
              </tr>
            </thead>
            <tbody>
              {mockFuelData.map((record, i) =>
                record.entries.map((entry, j) => (
                  <tr key={`entry-${i}-${j}`} className="border-t hover:bg-muted/25">
                    <td className="p-3">{record.department.nationalDept}</td>
                    <td className="p-3">{record.department.departmentName}</td>
                    <td className="p-3">{record.department.region}</td>
                    <td className="p-3">{record.department.unit}</td>
                    <td className="p-3">{record.department.clientName}</td>
                    <td className="p-3">{record.department.division}</td>
                    <td className="p-3">{record.department.costCentre}</td>
                    <td className="p-3">{record.vehicleReg}</td>
                    <td className="p-3">{record.asset.model}</td>
                    <td className="p-3">{record.asset.make}</td>
                    <td className="p-3">{record.asset.modelYear}</td>
                    <td className="p-3">{record.asset.age}</td>
                    <td className="p-3">{record.asset.status}</td>
                    <td className="p-3">{entry.transactionNo}</td>
                    <td className="p-3">{entry.odo}</td>
                    <td className="p-3">{entry.distanceTravelled} km</td>
                    <td className="p-3">{entry.fuelVolume}</td>
                    <td className="p-3">{entry.fuelPrice}</td>
                    <td className="p-3">{entry.transactionDate}</td>
                    <td className="p-3">{entry.transactionTime}</td>
                    <td className="p-3">{entry.oilCompany}</td>
                    <td className="p-3">{entry.town}</td>
                    <td className="p-3">{entry.fuelStation}</td>
                    <td className="p-3">{entry.transactionType}</td>
                    <td className="p-3">{entry.townDetail}</td>
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
