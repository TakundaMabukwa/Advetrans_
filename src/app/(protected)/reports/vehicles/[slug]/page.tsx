"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import {
  Save,
  Share,
  Download,
  PrinterIcon as Print,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Settings,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from "next/link"

// Mock data for fuel entries report
const mockFuelData = [
  {
    vehicle: "1100 [2018 Toyota Prius]",
    entries: [
      {
        date: "08/01/2025",
        occurredAt: "12:27 PM",
        fuelType: "Petrol",
        pricePerGallon: 2.462,
        fuelEconomy: 60.63,
        cost: 0.041,
        partial: false,
        reset: false,
        reference: "",
        litres: 7.01,
        total: "R17.26",
      },
      {
        date: "07/29/2025",
        occurredAt: "10:29 AM",
        fuelType: "Petrol",
        pricePerGallon: 2.704,
        fuelEconomy: 44.41,
        cost: 0.061,
        partial: false,
        reset: false,
        reference: "",
        litres: 3.67,
        total: "R23.44",
      },
      {
        date: "07/24/2025",
        occurredAt: "9:36 AM",
        fuelType: "Petrol",
        pricePerGallon: 2.459,
        fuelEconomy: 57.08,
        cost: 0.043,
        partial: false,
        reset: false,
        reference: "",
        litres: 568,
        total: "R18.61",
      },
      {
        date: "07/18/2025",
        occurredAt: "7:08 AM",
        fuelType: "Petrol",
        pricePerGallon: 2.423,
        fuelEconomy: 47.54,
        cost: 0.051,
        partial: false,
        reset: false,
        reference: "",
        litres: 477,
        total: "R20.54",
      },
      {
        date: "07/14/2025",
        occurredAt: "11:49 AM",
        fuelType: "Petrol",
        pricePerGallon: 2.499,
        fuelEconomy: 55.98,
        cost: 0.045,
        partial: false,
        reset: false,
        reference: "",
        litres: 1075,
        total: "R20.18",
      },
      {
        date: "07/11/2025",
        occurredAt: "10:43 AM",
        fuelType: "Petrol",
        pricePerGallon: 2.499,
        fuelEconomy: 0,
        cost: 0,
        partial: false,
        reset: false,
        reference: "",
        litres: 884,
        total: "R22.20",
      },
    ],
  },
  {
    vehicle: "2100 [2016 Ford F-150]",
    entries: [
      {
        date: "08/03/2025",
        occurredAt: "12:27 PM",
        fuelType: "Diesel",
        pricePerGallon: 2.419,
        fuelEconomy: 13.45,
        cost: 0.18,
        partial: false,
        reset: false,
        reference: "",
        litres: 1113,
        total: "R46.23",
      },
      {
        date: "08/01/2025",
        occurredAt: "4:48 AM",
        fuelType: "Diesel",
        pricePerGallon: 2.494,
        fuelEconomy: 14.81,
        cost: 0.168,
        partial: false,
        reset: false,
        reference: "",
        litres: 1371,
        total: "R45.82",
      },
      {
        date: "07/29/2025",
        occurredAt: "12:27 PM",
        fuelType: "Diesel",
        pricePerGallon: 2.426,
        fuelEconomy: 10.64,
        cost: 0.228,
        partial: false,
        reset: false,
        reference: "",
        litres: 954,
        total: "R50.83",
      },
      {
        date: "07/26/2025",
        occurredAt: "3:49 AM",
        fuelType: "Diesel",
        pricePerGallon: 2.714,
        fuelEconomy: 14.62,
        cost: 0.186,
        partial: false,
        reset: false,
        reference: "",
        litres: 1099,
        total: "R46.41",
      },
      {
        date: "07/24/2025",
        occurredAt: "11:35 AM",
        fuelType: "Diesel",
        pricePerGallon: 2.954,
        fuelEconomy: 11.47,
        cost: 0.258,
        partial: false,
        reset: false,
        reference: "",
        litres: 19096,
        total: "R56.41",
      },
    ],
  },
]

const columnOptions = [
  { id: "date", label: "Date", checked: true },
  { id: "occurredAt", label: "Occurred at", checked: true },
  { id: "createdDate", label: "Created Date", checked: false },
  { id: "updatedAt", label: "Updated At", checked: false },
  { id: "vendor", label: "Vendor", checked: false },
  { id: "vendorRegion", label: "Vendor region", checked: false },
  { id: "odometer", label: "Odometer", checked: false },
  { id: "void", label: "Void", checked: false },
  { id: "usage", label: "Usage", checked: false },
  { id: "fuelType", label: "Fuel Type", checked: true },
  { id: "pricePerGallon", label: "Price/litre", checked: true },
  { id: "fuelEconomy", label: "Fuel Economy", checked: true },
  { id: "cost", label: "Cost", checked: true },
  { id: "partial", label: "Partial", checked: true },
  { id: "reset", label: "Reset", checked: true },
  { id: "reference", label: "Reference", checked: true },
  { id: "vehicleExceptionAlert", label: "Vehicle Exception Alert", checked: false },
  { id: "litres", label: "litres", checked: true },
  { id: "total", label: "Total", checked: true },
]

export default function ReportDetailPage() {
  const params = useParams()
  const [userRole, setUserRole] = useState<"call-center" | "fleet-manager" | "cost-center" | "customer" | "admin">(
    "fleet-manager",
  )
  const [showColumnSelector, setShowColumnSelector] = useState(false)
  const [columns, setColumns] = useState(columnOptions)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)

  useEffect(() => {
    const role = localStorage.getItem("userRole") as typeof userRole
    if (role) setUserRole(role)
  }, [])

  const getReportTitle = () => {
    const slug = params.slug as string
    return slug
      .split("-")
      .map((word) => word.toUpperCase() + word.slice(1))
      .join(" ")
  }

  const handleColumnToggle = (columnId: string) => {
    setColumns(columns.map((col) => (col.id === columnId ? { ...col, checked: !col.checked } : col)))
  }

  const visibleColumns = columns.filter((col) => col.checked)
  const totalEntries = mockFuelData.reduce((total, vehicle) => total + vehicle.entries.length, 0)
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalEntries)

  return (
        <div className="flex h-full flex-col">
          {/* Header */}
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex items-center gap-2 flex-1">
              <Link href="/reports" className="text-blue-600 hover:underline">
                Reports
              </Link>
              <span className="text-muted-foreground">/</span>
              <span className="font-medium">{getReportTitle()} Report</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" size="sm">
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" size="sm">
                <Print className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
          </header>

          <div className="flex flex-1 overflow-hidden">
            {/* Main Content */}
            <div className="flex-1 p-4">
              <div className="space-y-4">
                {/* Filters */}
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                  <Badge variant="secondary" className="gap-1">
                    1 filter applied
                    <X className="h-3 w-3" />
                  </Badge>
                  <Button variant="ghost" size="sm" className="text-blue-600">
                    Clear all
                  </Button>
                  <div className="ml-auto flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {startItem}-{endItem} of {totalEntries}
                    </span>
                    <Button variant="outline" size="sm" disabled={currentPage === 1}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Data Table */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left p-3 font-medium">Vehicle ▲</th>
                          {visibleColumns.map((col) => (
                            <th key={col.id} className="text-left p-3 font-medium">
                              {col.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {mockFuelData.map((vehicle, vehicleIndex) => (
                          <>
                            <tr key={`vehicle-${vehicleIndex}`} className="border-t">
                              <td colSpan={visibleColumns.length + 1} className="p-3 bg-blue-50">
                                <span className="font-medium text-blue-600">{vehicle.vehicle}</span>
                              </td>
                            </tr>
                            {vehicle.entries.map((entry, entryIndex) => (
                              <tr key={`entry-${vehicleIndex}-${entryIndex}`} className="border-t hover:bg-muted/25">
                                <td className="p-3"></td>
                                {visibleColumns.map((col) => (
                                  <td key={col.id} className="p-3 text-sm">
                                    {col.id === "date" && entry.date}
                                    {col.id === "occurredAt" && entry.occurredAt}
                                    {col.id === "fuelType" && entry.fuelType}
                                    {col.id === "pricePerGallon" && entry.pricePerGallon}
                                    {col.id === "fuelEconomy" && entry.fuelEconomy}
                                    {col.id === "cost" && entry.cost}
                                    {col.id === "partial" && (entry.partial ? "Yes" : "")}
                                    {col.id === "reset" && (entry.reset ? "Yes" : "")}
                                    {col.id === "reference" && entry.reference}
                                    {col.id === "litres" && entry.litres}
                                    {col.id === "total" && entry.total}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar - Column Selector */}
            <div className="w-80 border-l bg-muted/20 p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Columns</h3>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Meter Units</div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="estimated-resale" />
                      <label htmlFor="estimated-resale" className="text-sm">
                        Estimated Resale Value
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="out-of-service-date" />
                      <label htmlFor="out-of-service-date" className="text-sm">
                        Out-of-Service Date
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="out-of-service-meter" />
                      <label htmlFor="out-of-service-meter" className="text-sm">
                        Out-of-Service Meter
                      </label>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">FUEL ENTRY</div>
                  <Button variant="ghost" size="sm" className="text-blue-600 p-0 h-auto">
                    Hide All
                  </Button>
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {columns.map((column) => (
                        <div key={column.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={column.id}
                            checked={column.checked}
                            onCheckedChange={() => handleColumnToggle(column.id)}
                          />
                          <label htmlFor={column.id} className="text-sm">
                            {column.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </div>
          </div>
        </div>
  )
}
