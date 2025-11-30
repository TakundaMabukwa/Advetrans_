"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Eye,
  Edit,
  Trash2,
  Plus,
  Settings,
  User,
  Activity,
  Star,
  Search,
  Download,
  ChevronDown,
  Clock,
  Timer,
  Menu,
  Bell,
  UserCircle,
} from "lucide-react"

interface Driver {
  id: string
  firstName: string
  surname: string
  demeritPoints: number
  licenseCode: string
  licenseExpires: string
  pdpExpiryDate: string
}

interface DriverActivity {
  name: string
  startTime: string
  endTime: string
  totalTime: string
  idleTime: string
}

interface MonitoringCriteria {
  criterion: string
  selectedWeighting: number
  actualWeighting: number
  riskTiers: number
  incidents: number
  statuses: string[]
}

const mockDrivers: Driver[] = [
  {
    id: "29973",
    firstName: "ABEDNOCK",
    surname: "LEFU MOFOKENG",
    demeritPoints: 0,
    licenseCode: "",
    licenseExpires: "in 3 years",
    pdpExpiryDate: "in 21 days",
  },
  {
    id: "31446",
    firstName: "ABONGILE",
    surname: "NCEKANA",
    demeritPoints: 0,
    licenseCode: "",
    licenseExpires: "in 3 years",
    pdpExpiryDate: "in 2 months",
  },
  {
    id: "29621",
    firstName: "ADORE",
    surname: "LUNGILE NGOMA",
    demeritPoints: 0,
    licenseCode: "",
    licenseExpires: "in 3 years",
    pdpExpiryDate: "3 months ago",
  },
  {
    id: "31535",
    firstName: "ALBERT",
    surname: "ZULU",
    demeritPoints: 0,
    licenseCode: "",
    licenseExpires: "in 4 years",
    pdpExpiryDate: "in 4 months",
  },
  {
    id: "29977",
    firstName: "ALEX",
    surname: "KONZ NGUBANE",
    demeritPoints: 0,
    licenseCode: "",
    licenseExpires: "in 4 years",
    pdpExpiryDate: "in a year",
  },
  {
    id: "31454",
    firstName: "ALSON",
    surname: "TUMEDISO MAROBELE",
    demeritPoints: 0,
    licenseCode: "",
    licenseExpires: "in 4 years",
    pdpExpiryDate: "in a year",
  },
  {
    id: "31432",
    firstName: "AMOS",
    surname: "MDYESHANA",
    demeritPoints: 0,
    licenseCode: "",
    licenseExpires: "in 4 years",
    pdpExpiryDate: "in 8 months",
  },
  {
    id: "29446",
    firstName: "ANDILE",
    surname: "MABECE",
    demeritPoints: 0,
    licenseCode: "",
    licenseExpires: "in 3 years",
    pdpExpiryDate: "9 months ago",
  },
]

const mockDriverActivity: DriverActivity[] = [
  { name: "AMOS NTSAKO MSIMEKI", startTime: "15:37", endTime: "16:12", totalTime: "36 minutes", idleTime: "an hour" },
  { name: "AMOS NTSAKO MSIMEKI", startTime: "01:25", endTime: "05:52", totalTime: "4 hours", idleTime: "5 minutes" },
  { name: "Amos Oupa Malinga", startTime: "09:20", endTime: "14:08", totalTime: "5 hours", idleTime: "5 hours" },
  { name: "andile mabece", startTime: "07:12", endTime: "15:19", totalTime: "8 hours", idleTime: "28 minutes" },
  {
    name: "ANDRIES HABOFANOE LESAWANA",
    startTime: "04:06",
    endTime: "23:11",
    totalTime: "19 hours",
    idleTime: "2 hours",
  },
  {
    name: "AVHATAKALI RAMANDZHANZHA",
    startTime: "04:30",
    endTime: "23:05",
    totalTime: "18 hours",
    idleTime: "3 hours",
  },
  { name: "BANDILE LOREN MBEWANA", startTime: "04:23", endTime: "21:32", totalTime: "17 hours", idleTime: "4 hours" },
  { name: "BANNANA MAKULOBISHI MAKUA", startTime: "13:59", endTime: "23:09", totalTime: "9 hours", idleTime: "1 hour" },
]

const mockMonitoringCriteria: MonitoringCriteria[] = [
  {
    criterion: "Speeding",
    selectedWeighting: 50.0,
    actualWeighting: 50.0,
    riskTiers: 4,
    incidents: 4,
    statuses: [
      "Speed Exception 1",
      "Speed Exception 1~Outside safe zone",
      "Speed Exception 2",
      "Speed Exception 2~Outside safe zone",
    ],
  },
  {
    criterion: "Harsh Accelerating",
    selectedWeighting: 10.0,
    actualWeighting: 10.0,
    riskTiers: 4,
    incidents: 8,
    statuses: ["Safety - Acceleration - Aggressive", "Safety - Acceleration - Dangerous"],
  },
  {
    criterion: "Night Time Driving",
    selectedWeighting: 10.0,
    actualWeighting: 10.0,
    riskTiers: 4,
    incidents: 4,
    statuses: [],
  },
  {
    criterion: "Excessive day",
    selectedWeighting: 10.0,
    actualWeighting: 10.0,
    riskTiers: 4,
    incidents: 15,
    statuses: [],
  },
  {
    criterion: "Harsh Braking",
    selectedWeighting: 10.0,
    actualWeighting: 10.0,
    riskTiers: 4,
    incidents: 20,
    statuses: ["Safety - Braking - Dangerous", "Safety - Braking - Aggressive"],
  },
  {
    criterion: "Night Time Driving Excessive",
    selectedWeighting: 10.0,
    actualWeighting: 10.0,
    riskTiers: 4,
    incidents: 4,
    statuses: [],
  },
]

export default function DriverDashboard() {
  const [activeTab, setActiveTab] = useState("view-drivers")
  const [formData, setFormData] = useState({
    firstName: "",
    surname: "",
    idNumber: "",
    email: "",
    cellPhone: "",
    parcelNumber: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const tabs = [
    { id: "view-drivers", label: "View Drivers", icon: Eye },
    { id: "add-drivers", label: "Add Drivers", icon: Plus },
    { id: "drivers-activity", label: "Drivers Activity", icon: Activity },
    { id: "driver-score", label: "Driver Score", icon: Star },
    { id: "driver-monitoring-config", label: "Driver Monitoring Config", icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-gradient-to-r from-sky-100 via-blue-50 to-cyan-50 border-b border-blue-200 shadow-sm z-50">
        <div className="flex items-center justify-between h-full px-6">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="text-cyan-600 hover:bg-cyan-100">
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-sm"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">MacSteel Fleet</h1>
                <p className="text-sm text-gray-600">Logistics Management System</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 bg-green-100 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-700">Live</span>
            </div>
            <span className="text-sm text-gray-700">Good morning, <span className="font-semibold text-gray-900">admin</span></span>
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" className="relative text-gray-600 hover:text-cyan-600 hover:bg-cyan-50">
                <Bell className="w-5 h-5" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full"></div>
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-cyan-600 hover:bg-cyan-50">
                <div className="w-6 h-6 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  A
                </div>
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-cyan-600 hover:bg-cyan-50">
                <UserCircle className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

      {/* Sidebar */}
      <div className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-gradient-to-b from-slate-800 via-slate-900 to-gray-900 shadow-xl">
        <div className="p-6">
          <div className="text-2xl font-bold text-white mb-2">MACSTEEL</div>
          <div className="text-sm text-slate-300 mb-8">Pursuing Reinvention</div>

          <nav className="space-y-2">
            <div className="text-cyan-400 font-semibold mb-4 text-xs uppercase tracking-wider">DASHBOARD</div>
            <div className="flex items-center space-x-3 text-slate-300 hover:text-white hover:bg-slate-700 py-2 px-3 rounded-lg transition-all duration-200">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Start Time</span>
            </div>
            <div className="flex items-center space-x-3 text-slate-300 hover:text-white hover:bg-slate-700 py-2 px-3 rounded-lg transition-all duration-200">
              <Timer className="w-4 h-4" />
              <span className="text-sm">Start Time Dashboard</span>
            </div>
            <div className="flex items-center space-x-3 text-slate-300 hover:text-white hover:bg-slate-700 py-2 px-3 rounded-lg transition-all duration-200">
              <Activity className="w-4 h-4" />
              <span className="text-sm">Utilisation</span>
            </div>
            <div className="flex items-center space-x-3 text-slate-300 hover:text-white hover:bg-slate-700 py-2 px-3 rounded-lg transition-all duration-200">
              <Search className="w-4 h-4" />
              <span className="text-sm">Reporting</span>
            </div>

            <div className="text-cyan-400 font-semibold mb-4 mt-8 text-xs uppercase tracking-wider">VEHICLES</div>
            <div className="flex items-center space-x-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-3 px-4 rounded-lg shadow-lg">
              <User className="w-4 h-4" />
              <span className="text-sm font-medium">Drivers</span>
            </div>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 mt-16 p-6">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <nav className="flex">
            {tabs.map((tab, index) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-6 font-medium text-sm border-b-2 transition-all duration-200 ${
                    activeTab === tab.id
                      ? "border-cyan-500 text-cyan-600 bg-cyan-50"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  } ${index === 0 ? "rounded-tl-lg" : ""} ${index === tabs.length - 1 ? "rounded-tr-lg" : ""}`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "view-drivers" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50">
              <div className="flex items-center justify-between">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input placeholder="Search drivers..." className="pl-10 w-80 border-gray-300 focus:border-cyan-500 focus:ring-cyan-500" />
                </div>
                <div className="flex items-center space-x-3">
                  <Button variant="outline" className="flex items-center space-x-2 border-gray-300 hover:border-cyan-500 hover:text-cyan-600 bg-transparent">
                    <Download className="w-4 h-4" />
                    <span>Export CSV</span>
                  </Button>
                  <Button variant="outline" className="flex items-center space-x-2 border-gray-300 hover:border-cyan-500 hover:text-cyan-600 bg-transparent">
                    <span>Columns</span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-cyan-50 to-blue-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-cyan-700 uppercase tracking-wider">
                      Driver Number
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-cyan-700 uppercase tracking-wider">
                      First Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-cyan-700 uppercase tracking-wider">
                      Surname
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-cyan-700 uppercase tracking-wider">
                      Demerit Points
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-cyan-700 uppercase tracking-wider">
                      License Code
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-cyan-700 uppercase tracking-wider">
                      License Expires
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-cyan-700 uppercase tracking-wider">
                      PDP ExpiryDate
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-cyan-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mockDrivers.map((driver, index) => (
                    <tr key={driver.id} className={`${index % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-cyan-50 transition-colors duration-150`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{driver.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{driver.firstName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{driver.surname}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {driver.demeritPoints}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{driver.licenseCode}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{driver.licenseExpires}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{driver.pdpExpiryDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            className="bg-cyan-500 hover:bg-cyan-600 text-white rounded-full w-8 h-8 p-0 shadow-md hover:shadow-lg transition-all duration-200"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full w-8 h-8 p-0 shadow-md hover:shadow-lg transition-all duration-200"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            className="bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 p-0 shadow-md hover:shadow-lg transition-all duration-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "add-drivers" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                1
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Driver Details</h2>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-red-600 mb-2">First Name *</label>
                <Input
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  className="w-full border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                />
                <p className="text-xs text-red-500 mt-1">This field is required</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-red-600 mb-2">Surname *</label>
                <Input
                  value={formData.surname}
                  onChange={(e) => handleInputChange("surname", e.target.value)}
                  className="w-full border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                />
                <p className="text-xs text-red-500 mt-1">This field is required</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Identification/Passport Number</label>
                <Input
                  value={formData.idNumber}
                  onChange={(e) => handleInputChange("idNumber", e.target.value)}
                  className="w-full border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cell Phone Number</label>
                <Input
                  value={formData.cellPhone}
                  onChange={(e) => handleInputChange("cellPhone", e.target.value)}
                  className="w-full border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Parcel Number</label>
                <Input
                  value={formData.parcelNumber}
                  onChange={(e) => handleInputChange("parcelNumber", e.target.value)}
                  className="w-full border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                />
              </div>
            </div>

            <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200 mb-8">
              Next
            </Button>

            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gray-400 text-white rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <h2 className="text-lg font-semibold text-gray-500">Driver License Details</h2>
            </div>

            <Button className="bg-gray-400 hover:bg-gray-500 text-white shadow-md">Submit</Button>
          </div>
        )}

        {activeTab === "drivers-activity" && (
          <div className="grid grid-cols-4 gap-6">
            {mockDriverActivity.map((activity, index) => (
              <Card key={index} className="p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                <h3 className="font-semibold text-gray-900 mb-4 text-center text-sm">{activity.name}</h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-cyan-600" />
                      <span className="text-sm text-gray-600">Start Time:</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{activity.startTime}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-cyan-600" />
                      <span className="text-sm text-gray-600">End Time:</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{activity.endTime}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Timer className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-600">Total Time:</span>
                    </div>
                    <span className="text-sm font-semibold text-blue-600">{activity.totalTime}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Timer className="w-4 h-4 text-orange-500" />
                      <span className="text-sm text-gray-600">Idle Time:</span>
                    </div>
                    <span className="text-sm font-medium text-orange-600">{activity.idleTime}</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full mt-4 border-cyan-300 text-cyan-600 hover:bg-cyan-50 hover:border-cyan-500 bg-transparent">
                  View Details
                </Button>
              </Card>
            ))}
          </div>
        )}

        {activeTab === "driver-score" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Driver Score</h3>
              <p className="text-gray-600">Driver scoring functionality will be implemented here.</p>
            </div>
          </div>
        )}

        {activeTab === "driver-monitoring-config" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-cyan-50 to-blue-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-cyan-700 uppercase tracking-wider">
                      Criterion
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-cyan-700 uppercase tracking-wider">
                      Selected Weighting
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-cyan-700 uppercase tracking-wider">
                      Actual Weighting
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-cyan-700 uppercase tracking-wider">
                      Risk Tiers
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-cyan-700 uppercase tracking-wider">
                      No. Incidents
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-cyan-700 uppercase tracking-wider">
                      Statuses
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-cyan-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mockMonitoringCriteria.map((criteria, index) => (
                    <tr key={index} className={`${index % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-cyan-50 transition-colors duration-150`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{criteria.criterion}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {criteria.selectedWeighting.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {criteria.actualWeighting.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{criteria.riskTiers}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {criteria.incidents}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {criteria.statuses.length > 0 ? (
                          <div className="space-y-1">
                            {criteria.statuses.map((status, statusIndex) => (
                              <div key={statusIndex} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-md">
                                {status}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full w-8 h-8 p-0 shadow-md hover:shadow-lg transition-all duration-200"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          {index === mockMonitoringCriteria.length - 1 && (
                            <Button
                              size="sm"
                              className="bg-cyan-500 hover:bg-cyan-600 text-white rounded-full w-8 h-8 p-0 shadow-md hover:shadow-lg transition-all duration-200"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )\
}
