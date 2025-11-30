"use client"

import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Download,
  Settings,
  User,
  Clock,
  Timer,
  Activity,
  Bell,
  UserCircle,
  Menu,
  BarChart3,
  AlertTriangle,
  Star,
  ChevronDown,
  LogOut,
} from "lucide-react"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useAuth } from "@/context/auth-context/context"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useDashboard } from "@/context/dashboard-context"
import { AddDriversForm } from "@/components/add-drivers-form"
import { DriversTab } from "@/components/drivers-tab"
import { 
  epsApi, 
  DriverPerformance, 
  BiWeeklyCategory, 
  DailyViolation, 
  DriverReward, 
  DailyStats,
  processDriverPerformance,
  processBiWeeklyData,
  processDailyViolations,
  REFRESH_INTERVALS
} from "@/lib/eps-api"
import {
  DriverPerformanceCardSkeleton,
  DriverTableSkeleton,
  ChartSkeleton,
  StatsCardSkeleton,
  DriverPerformanceGridSkeleton
} from "@/components/loading-skeletons"
import { MaterialCharts } from "@/components/material-charts"
import { MonthlyStatsTable } from "@/components/monthly-stats-table"
import { TopSpeedingOffendersTable } from "@/components/top-speeding-offenders-table"


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

const fleetPerformanceData = [
  {
    category: "Long Haul > 2500km bi-weekly",
    speed: 30,
    harshBraking: 10,
    excessiveDay: 20,
    excessiveNight: 20,
    kilometers: 20,
    riskScore: 85,
    units: 45,
    monthlyFleetStats: 2850,
    monthlyEventsCount: 12,
  },
  {
    category: "Medium Haul > 1500km bi-weekly",
    speed: 30,
    harshBraking: 10,
    excessiveDay: 20,
    excessiveNight: 20,
    kilometers: 20,
    riskScore: 72,
    units: 38,
    monthlyFleetStats: 1875,
    monthlyEventsCount: 8,
  },
  {
    category: "Short Haul > 600km bi-weekly",
    speed: 40,
    harshBraking: 20,
    excessiveDay: 10,
    excessiveNight: 10,
    kilometers: 20,
    riskScore: 58,
    units: 62,
    monthlyFleetStats: 945,
    monthlyEventsCount: 15,
  },
]

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

// Mock data removed - using real API data from context

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

const haulBenchmarks = {
  "Long Haul": { speed: 30, harshBraking: 10, excessiveDay: 20, excessiveNight: 20, kilometers: 20 },
  "Medium Haul": { speed: 30, harshBraking: 10, excessiveDay: 20, excessiveNight: 20, kilometers: 20 },
  "Short Haul": { speed: 40, harshBraking: 20, excessiveDay: 10, excessiveNight: 10, kilometers: 20 },
}

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

const monthlyKilometres = [
  { month: "August", value: 729751 },
  { month: "September", value: 745448 },
  { month: "October", value: 733432 },
  { month: "November", value: 649340 },
  { month: "December", value: 549840 },
  { month: "January", value: 0 },
]

// Driver performance data based on the provided metrics
const driverPerformanceData = [
  { 
    driverName: "AMOS NTSAKO MSIMEKI", 
    score: 85,
    haulType: "Long Haul",
    speed: 30,
    harshBraking: 10,
    excessiveDay: 20,
    excessiveNight: 20,
    kilometers: 20,
    color: "#3B82F6" // Blue
  },
  { 
    driverName: "ANDRIES HABOFANOE LESAWANA", 
    score: 78,
    haulType: "Medium Haul",
    speed: 30,
    harshBraking: 10,
    excessiveDay: 20,
    excessiveNight: 20,
    kilometers: 20,
    color: "#10B981" // Green
  },
  { 
    driverName: "AVHATAKALI RAMANDZHANZHA", 
    score: 72,
    haulType: "Short Haul",
    speed: 40,
    harshBraking: 20,
    excessiveDay: 10,
    excessiveNight: 10,
    kilometers: 20,
    color: "#F59E0B" // Orange
  },
  { 
    driverName: "BANDILE LOREN MBEWANA", 
    score: 68,
    haulType: "Long Haul",
    speed: 30,
    harshBraking: 10,
    excessiveDay: 20,
    excessiveNight: 20,
    kilometers: 20,
    color: "#EF4444" // Red
  },
  { 
    driverName: "BANNANA MAKULOBISHI MAKUA", 
    score: 82,
    haulType: "Medium Haul",
    speed: 30,
    harshBraking: 10,
    excessiveDay: 20,
    excessiveNight: 20,
    kilometers: 20,
    color: "#8B5CF6" // Purple
  },
]

const numberOfTrips = [
  { month: "August", value: 28671 },
  { month: "September", value: 30876 },
  { month: "October", value: 33858 },
  { month: "November", value: 33008 },
  { month: "December", value: 26785 },
  { month: "January", value: 24560 },
]

const topSpeedingDrivers = [
  { name: "ZARAFENDHOSA SWAMUTHI", value: 15, color: "#8B5CF6" },
  { name: "NQOBANE", value: 12, color: "#06B6D4" },
  { name: "NQOBILE MONDO", value: 10, color: "#10B981" },
  { name: "SIFISO", value: 8, color: "#F59E0B" },
  { name: "PHINLOVU", value: 6, color: "#EF4444" },
  { name: "Others", value: 49, color: "#6B7280" },
]

const overallRiskScore = [
  { month: "July", score: 29 },
  { month: "August", score: 26 },
  { month: "September", score: 26 },
  { month: "October", score: 26 },
  { month: "November", score: 26 },
  { month: "December", score: 20 },
]

export default function DriverDashboard() {
  const [activeTab, setActiveTab] = useState("executive-dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { user, signOut } = useAuth()
  const router = useRouter()

  // Use dashboard context
  const { 
    state: { 
      driverPerformance, 
      biWeeklyData, 
      dailyViolations, 
      driverRewards, 
      dailyStats, 
      drivers,
      loading, 
      errors 
    }, 
    refreshAllData,
    fetchDrivers
  } = useDashboard()

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success("Successfully signed out!")
      router.push("/login")
    } catch (error) {
      toast.error("Error signing out")
    }
  }

  // Data fetching is now handled by the dashboard context

  // Load data on component mount
  useEffect(() => {
    refreshAllData()
  }, [refreshAllData])

  // Log current data state for debugging
  useEffect(() => {
    console.log('📋 Current Dashboard State:', {
      driverPerformance: driverPerformance.length,
      biWeeklyData: biWeeklyData.length,
      dailyViolations: dailyViolations.length,
      driverRewards: driverRewards.length,
      dailyStats: dailyStats.length,
      loading,
      errors
    })
  }, [driverPerformance, biWeeklyData, dailyViolations, driverRewards, dailyStats, loading, errors])

  // Auto-refresh intervals removed - data is fetched once and stored in context

  const tabs = [
    { id: "executive-dashboard", label: "Executive Dashboard", icon: BarChart3 },
    { id: "view-drivers", label: "View Drivers", icon: Eye },
    { id: "add-drivers", label: "Add Drivers", icon: Plus },
    { id: "drivers-performance", label: "Driver Performance", icon: Activity },
    { id: "driver-monitoring-config", label: "Driver Monitoring Config", icon: Settings },
  ]

  return (
    <div className="bg-gray-50">
      <div className="top-0 right-0 left-0 z-50 fixed bg-gradient-to-r from-sky-100 via-blue-50 to-cyan-50 shadow-sm border-b border-blue-200">
        <div className="flex justify-between items-center px-6 h-full">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-cyan-100 text-cyan-600"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="" />
            </Button>
            <div className="flex items-center space-x-3">
              <div className="flex justify-center items-center bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg w-8 h-8">
                <div className="bg-white rounded-sm w-4 h-4"></div>
              </div>
              <div>
                <h1 className="font-bold text-gray-900 text-xl">Driver App</h1>
                <p className="text-gray-600 text-sm">Fleet Management System</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 bg-green-100 px-3 py-1 rounded-full">
              <div className="bg-green-500 rounded-full w-2 h-2 animate-pulse"></div>
              <span className="font-medium text-green-700 text-sm">Live</span>
            </div>
            <span className="text-gray-700 text-sm">
              Good morning, <span className="font-semibold text-gray-900">{user?.email || 'admin'}</span>
            </span>
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" className="relative hover:bg-cyan-50 text-gray-600 hover:text-cyan-600">
                <Bell className="w-5 h-5" />
                <div className="-top-1 -right-1 absolute bg-orange-500 rounded-full w-3 h-3"></div>
              </Button>
              <Button variant="ghost" size="sm" className="hover:bg-cyan-50 text-gray-600 hover:text-cyan-600">
                <div className="flex justify-center items-center bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full w-6 h-6 font-bold text-white text-xs">
                  {user?.email?.charAt(0).toUpperCase() || 'A'}
                </div>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="hover:bg-red-50 text-gray-600 hover:text-red-600"
                onClick={handleSignOut}
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-sky-100 via-blue-50 to-cyan-50 shadow-xl transition-all duration-300 ease-in-out z-40 border-r border-blue-200 ${
          sidebarOpen ? "w-64" : "w-0"
        } overflow-hidden`}
      >
        <div className="p-6 pt-20">
          <div className="mb-2 font-bold text-slate-800 text-2xl">DRIVER APP</div>
          <div className="mb-8 text-slate-600 text-sm">Fleet Management</div>

          <nav className="space-y-2">
            <div className="flex items-center space-x-3 bg-gradient-to-r from-cyan-600 to-blue-600 shadow-lg px-4 py-3 rounded-lg text-white">
              <User className="w-4 h-4" />
              <span className="font-medium text-sm">Drivers</span>
            </div>
          </nav>
        </div>
      </div>

      <div className={`transition-all duration-300 ease-in-out mt-16 p-6 ${sidebarOpen ? "ml-64" : "ml-0"}`}>
        <div className="bg-gradient-to-r from-sky-100 via-blue-50 to-cyan-50 shadow-sm mb-6 border border-blue-200 rounded-lg">
          <div className="border-b border-blue-200">
            <div className="flex space-x-1 p-1">
              <button
                onClick={() => setActiveTab("view-drivers")}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === "view-drivers"
                    ? "bg-white text-cyan-700 shadow-sm border border-cyan-200"
                    : "text-gray-600 hover:text-cyan-700 hover:bg-cyan-50"
                }`}
              >
                <Eye className="w-4 h-4" />
                <span>View Drivers</span>
              </button>
              <button
                onClick={() => setActiveTab("add-drivers")}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === "add-drivers"
                    ? "bg-white text-cyan-700 shadow-sm border border-cyan-200"
                    : "text-gray-600 hover:text-cyan-700 hover:bg-cyan-50"
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>Add Drivers</span>
              </button>
              <button
                onClick={() => setActiveTab("drivers-performance")}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === "drivers-performance"
                    ? "bg-white text-cyan-700 shadow-sm border border-cyan-200"
                    : "text-gray-600 hover:text-cyan-700 hover:bg-cyan-50"
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>Driver Performance</span>
              </button>
              <button
                onClick={() => setActiveTab("driver-monitoring-config")}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === "driver-monitoring-config"
                    ? "bg-white text-cyan-700 shadow-sm border border-cyan-200"
                    : "text-gray-600 hover:text-cyan-700 hover:bg-cyan-50"
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Driver Monitoring Config</span>
              </button>
              <button
                onClick={() => setActiveTab("executive-dashboard")}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === "executive-dashboard"
                    ? "bg-white text-cyan-700 shadow-sm border border-cyan-200"
                    : "text-gray-600 hover:text-cyan-700 hover:bg-cyan-50"
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Executive Dashboard</span>
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-b-lg">
            {activeTab === "executive-dashboard" && (
              <div className="space-y-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-sky-100 via-blue-50 to-cyan-50 shadow-lg p-6 border border-blue-200 rounded-lg text-slate-800">
                  <h1 className="font-bold text-2xl text-center">EPS Courier Services - Executive Dashboard</h1>
                </div>

                 {/* Material UI Charts */}
                 <MaterialCharts 
                   biWeeklyData={biWeeklyData}
                   dailyStats={dailyStats}
                 />

                 {/* Monthly Statistics Table */}
                 <MonthlyStatsTable dailyStats={dailyStats} />

                 {/* Top Speeding Offenders Table */}
                 <TopSpeedingOffendersTable dailyStats={dailyStats} />

                 {/* Overall Risk Score Bar Chart */}
                  <Card className="p-6">
                   <h3 className="mb-4 font-semibold text-purple-800 text-lg text-center">Overall Risk Score</h3>
                   <div className="h-80">
                     <ResponsiveContainer width="100%" height={320}>
                       <BarChart data={(() => {
                         // Group daily stats by month and calculate drivers below 60% performance
                         const monthlyRiskData = dailyStats.reduce((acc, stat) => {
                           const month = new Date(stat.date).toLocaleString('en-US', { month: 'long' })
                           if (!acc[month]) {
                             acc[month] = {
                               month,
                               driversBelow60: 0,
                               totalDrivers: 0
                             }
                           }
                           
                           // Calculate performance score for this driver/stat
                           const totalPoints = parseFloat(stat.total_points) || 0
                           const totalViolations = parseFloat(stat.total_violations) || 0
                           const performanceScore = totalPoints > 0 ? ((totalPoints - totalViolations) / totalPoints) * 100 : 0
                           if (performanceScore < 60) {
                             acc[month].driversBelow60 += 1
                           }
                           acc[month].totalDrivers += 1
                           
                           return acc
                         }, {} as Record<string, any>)
                         
                         // Create array with all months, showing data only for available months
                         const monthOrder = ['July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March']
                         const allMonthsData = monthOrder.map(month => ({
                           month,
                           count: monthlyRiskData[month]?.driversBelow60 || 0
                         }))
                         
                         console.log('📊 Monthly Risk Data (All Months):', allMonthsData)
                         return allMonthsData
                       })()}>
                         <CartesianGrid strokeDasharray="3 3" />
                         <XAxis dataKey="month" />
                         <YAxis />
                         <Bar dataKey="count" fill="#20B2AA" />
                       </BarChart>
                     </ResponsiveContainer>
                    </div>
                  </Card>

                {/* Driver Performance Bar Chart */}
                <Card className="p-6">
                  <h3 className="mb-4 font-semibold text-lg text-center">Driver Performance Scores</h3>
                  {loading.performance ? (
                    <ChartSkeleton />
                  ) : (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={driverPerformance.map(driver => {
                          const safetyScore = parseFloat(driver.safety_score) || 0
                          const efficiency = parseFloat(driver.efficiency) || 0
                          return {
                            driverName: driver.driver_name,
                            score: ((safetyScore + efficiency) / 2) * 100,
                          }
                        })}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="driverName" angle={-45} textAnchor="end" height={100} />
                          <YAxis />
                          <Bar dataKey="score" fill="#D4A574" />
                        </BarChart>
                      </ResponsiveContainer>
                      </div>
                  )}
                    </Card>

              </div>
            )}

            {activeTab === "view-drivers" && (
              <DriversTab 
                drivers={drivers}
                loading={loading.drivers}
                error={errors.drivers}
                onFetchDrivers={fetchDrivers}
              />
            )}

            {activeTab === "view-drivers-old" && (
              <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
                <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-6 border-gray-200 border-b">
                  <div className="flex justify-between items-center">
                    <div className="relative">
                      <Search className="top-1/2 left-3 absolute w-4 h-4 text-gray-400 -translate-y-1/2 transform" />
                      <Input
                        placeholder="Search drivers..."
                        className="pl-10 border-gray-300 focus:border-cyan-500 focus:ring-cyan-500 w-80"
                      />
                    </div>
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="outline"
                        className="flex items-center space-x-2 bg-transparent border-gray-300 hover:border-cyan-500 hover:text-cyan-600"
                      >
                        <Download className="w-4 h-4" />
                        <span>Export CSV</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="flex items-center space-x-2 bg-transparent border-gray-300 hover:border-cyan-500 hover:text-cyan-600"
                      >
                        <span>Columns</span>
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {loading.performance ? (
                  <DriverTableSkeleton />
                ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-cyan-50 to-blue-50">
                      <tr>
                        <th className="px-6 py-4 font-semibold text-cyan-700 text-xs text-left uppercase tracking-wider">
                            Plate Number
                        </th>
                        <th className="px-6 py-4 font-semibold text-cyan-700 text-xs text-left uppercase tracking-wider">
                            Driver Name
                        </th>
                        <th className="px-6 py-4 font-semibold text-cyan-700 text-xs text-left uppercase tracking-wider">
                            KM Today
                        </th>
                        <th className="px-6 py-4 font-semibold text-cyan-700 text-xs text-left uppercase tracking-wider">
                            Start Time
                        </th>
                        <th className="px-6 py-4 font-semibold text-cyan-700 text-xs text-left uppercase tracking-wider">
                            Reward Level
                        </th>
                        <th className="px-6 py-4 font-semibold text-cyan-700 text-xs text-left uppercase tracking-wider">
                            Safety Score
                        </th>
                        <th className="px-6 py-4 font-semibold text-cyan-700 text-xs text-left uppercase tracking-wider">
                            Efficiency
                        </th>
                        <th className="px-6 py-4 font-semibold text-cyan-700 text-xs text-left uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {driverPerformance.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-6 py-12 text-gray-500 text-center">
                              No driver data available
                            </td>
                          </tr>
                        ) : (
                          driverPerformance.map((driver, index) => {
                            console.log(`👤 Displaying Driver ${index + 1}:`, {
                              name: driver.driver_name,
                              plate: driver.plate,
                              safetyScore: driver.safety_score,
                              efficiency: driver.efficiency,
                              totalPoints: driver.total_points,
                              dailyStats: dailyStats.find(stat => stat.plate === driver.plate)
                            })
                            return (
                            <tr
                              key={driver.plate}
                          className={`${index % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-cyan-50 transition-colors duration-150`}
                        >
                              <td className="px-6 py-4 font-medium text-gray-900 text-sm whitespace-nowrap">{driver.plate}</td>
                              <td className="px-6 py-4 text-gray-900 text-sm whitespace-nowrap">{driver.driver_name}</td>
                              <td className="px-6 py-4 text-gray-900 text-sm whitespace-nowrap">
                                <span className="inline-flex items-center bg-purple-100 px-2.5 py-0.5 rounded-full font-medium text-purple-800 text-xs">
                                  {dailyStats.find(stat => stat.plate === driver.plate)?.daily_distance || 
                                   dailyStats.find(stat => stat.plate === driver.plate)?.total_distance || 
                                   'N/A'} km
                                </span>
                              </td>
                          <td className="px-6 py-4 text-gray-900 text-sm whitespace-nowrap">
                            <span className="inline-flex items-center bg-green-100 px-2.5 py-0.5 rounded-full font-medium text-green-800 text-xs">
                                  {dailyStats.find(stat => stat.plate === driver.plate)?.first_drive_time ? 
                                   new Date(dailyStats.find(stat => stat.plate === driver.plate)!.first_drive_time).toLocaleTimeString() : 
                                   'N/A'}
                            </span>
                          </td>
                              <td className="px-6 py-4 text-gray-900 text-sm whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-medium text-xs ${
                                  driver.reward_level === 'Platinum' ? 'bg-purple-100 text-purple-800' :
                                  driver.reward_level === 'Gold' ? 'bg-yellow-100 text-yellow-800' :
                                  driver.reward_level === 'Silver' ? 'bg-gray-100 text-gray-800' :
                                  driver.reward_level === 'Bronze' ? 'bg-orange-100 text-orange-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {driver.reward_level}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-gray-900 text-sm whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-medium text-xs ${
                                  driver.safety_score >= 0.8 ? 'bg-green-100 text-green-800' :
                                  driver.safety_score >= 0.6 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {(driver.safety_score * 100).toFixed(1)}%
                                </span>
                              </td>
                              <td className="px-6 py-4 text-gray-900 text-sm whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-medium text-xs ${
                                  driver.efficiency >= 0.8 ? 'bg-green-100 text-green-800' :
                                  driver.efficiency >= 0.6 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {(driver.efficiency * 100).toFixed(1)}%
                                </span>
                              </td>
                          <td className="px-6 py-4 font-medium text-sm whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                className="bg-cyan-500 hover:bg-cyan-600 shadow-md hover:shadow-lg p-0 rounded-full w-8 h-8 text-white transition-all duration-200"
                                    title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                className="bg-emerald-500 hover:bg-emerald-600 shadow-md hover:shadow-lg p-0 rounded-full w-8 h-8 text-white transition-all duration-200"
                                    title="Edit Driver"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                className="bg-red-500 hover:bg-red-600 shadow-md hover:shadow-lg p-0 rounded-full w-8 h-8 text-white transition-all duration-200"
                                    title="Remove Driver"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                            )
                          })
                        )}
                    </tbody>
                  </table>
                </div>
                )}
              </div>
            )}

            {activeTab === "add-drivers" && (
              <AddDriversForm />
            )}

            {activeTab === "drivers-performance" && (
              <div className="space-y-6">
                {/* Performance Overview Cards */}
                <div className="gap-6 grid grid-cols-3 mb-8">
                  <Card className="bg-gradient-to-br from-green-50 to-green-100 p-6 border-green-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-green-800 text-lg">Performing Well</h3>
                        <p className="font-bold text-green-600 text-3xl">
                          {driverPerformance.filter((d) => {
                            const safetyScore = parseFloat(d.safety_score) || 0
                            const efficiency = parseFloat(d.efficiency) || 0
                            const performanceScore = ((safetyScore + efficiency) / 2) * 100
                            return performanceScore >= 60
                          }).length}
                        </p>
                      </div>
                      <div className="flex justify-center items-center bg-green-500 rounded-full w-12 h-12">
                        <Star className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-gradient-to-br from-red-50 to-red-100 p-6 border-red-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-red-800 text-lg">Needs Improvement</h3>
                        <p className="font-bold text-red-600 text-3xl">
                          {driverPerformance.filter((d) => ((d.safety_score + d.efficiency) / 2) * 100 < 70).length}
                        </p>
                      </div>
                      <div className="flex justify-center items-center bg-red-500 rounded-full w-12 h-12">
                        <AlertTriangle className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 border-blue-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-blue-800 text-lg">Average Score</h3>
                        <p className="font-bold text-blue-600 text-3xl">
                          {Math.round(
                            driverPerformance.reduce((acc, d) => acc + ((d.safety_score + d.efficiency) / 2) * 100, 0) /
                              driverPerformance.length,
                          )}
                        </p>
                      </div>
                      <div className="flex justify-center items-center bg-blue-500 rounded-full w-12 h-12">
                        <BarChart3 className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Driver Performance Cards */}
                <div className="gap-6 grid grid-cols-3">
                  {loading.performance ? (
                    <DriverPerformanceGridSkeleton />
                  ) : driverPerformance.length === 0 ? (
                    <div className="col-span-3 py-12 text-gray-500 text-center">
                      No driver performance data available
                    </div>
                  ) : (
                    driverPerformance.map((driver, index) => {
                      // Calculate performance score and status locally
                      const safetyScore = parseFloat(driver.safety_score) || 0
                      const efficiency = parseFloat(driver.efficiency) || 0
                      const performanceScore = Math.round(((safetyScore + efficiency) / 2) * 100)
                      const isPerformingWell = performanceScore >= 60
                      
                      console.log(`🎯 Driver Performance Card ${index + 1}:`, {
                        name: driver.driver_name,
                        plate: driver.plate,
                        totalPoints: driver.total_points,
                        performanceScore: performanceScore,
                        isPerformingWell: isPerformingWell,
                        rewardLevel: driver.reward_level,
                        safetyScore: driver.safety_score,
                        efficiency: driver.efficiency,
                        compliance: {
                          speed: driver.speed_compliance,
                          route: driver.route_compliance,
                          time: driver.time_compliance
                        },
                        biWeeklyCategoryPoints: driver.biWeeklyCategoryPoints,
                        dailyStats: dailyStats.find(stat => stat.plate === driver.plate)
                      })
                      return (
                    <Card
                      key={index}
                      className={`p-6 border-2 shadow-sm hover:shadow-md transition-all duration-200 ${
                        isPerformingWell
                          ? "border-green-200 bg-gradient-to-br from-green-50 to-white"
                          : "border-red-200 bg-gradient-to-br from-red-50 to-white"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-gray-900 text-sm">{driver.driver_name}</h3>
                        <div
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            isPerformingWell ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {isPerformingWell ? "Good" : "Needs Improvement"}
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-600 text-sm">Plate: {driver.plate}</span>
                          <span className="font-semibold text-purple-600 text-sm">{driver.latest_mileage}km</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-600 text-sm">Total Points</span>
                          <span
                            className={`text-lg font-bold ${
                              driver.total_points >= 80
                                ? "text-green-600"
                                : driver.total_points >= 70
                                  ? "text-yellow-600"
                                  : "text-red-600"
                            }`}
                          >
                            {driver.total_points}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-600 text-sm">Performance Score</span>
                          <span
                            className={`text-lg font-bold ${
                              performanceScore >= 80
                                ? "text-green-600"
                                : performanceScore >= 60
                                  ? "text-yellow-600"
                                  : "text-red-600"
                            }`}
                          >
                            {performanceScore}%
                          </span>
                        </div>
                      </div>

                      {/* Performance Metrics */}
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 text-xs">Speed Compliance</span>
                          <span className={`text-xs font-medium ${driver.speed_compliance ? "text-green-600" : "text-red-600"}`}>
                            {driver.speed_compliance ? "✓" : "✗"}
                          </span>
                              </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 text-xs">Route Compliance</span>
                          <span className={`text-xs font-medium ${driver.route_compliance ? "text-green-600" : "text-red-600"}`}>
                            {driver.route_compliance ? "✓" : "✗"}
                              </span>
                            </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 text-xs">Time Compliance</span>
                          <span className={`text-xs font-medium ${driver.time_compliance ? "text-green-600" : "text-red-600"}`}>
                            {driver.time_compliance ? "✓" : "✗"}
                          </span>
                          </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 text-xs">Safety Score</span>
                          <span className="font-medium text-blue-600 text-xs">
                            {(driver.safety_score * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 text-xs">Efficiency</span>
                          <span className="font-medium text-green-600 text-xs">
                            {(driver.efficiency * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>

                      {/* Bi-Weekly Category Points */}
                      {driver.biWeeklyCategoryPoints && driver.biWeeklyCategoryPoints.earned && driver.biWeeklyCategoryPoints.caps && (
                        <div className="space-y-3 bg-gray-50 mb-4 p-3 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700 text-sm">Bi-Weekly Progress</span>
                            <span className="text-gray-500 text-xs">
                              {driver.biWeeklyCategoryPoints.haulType || 'N/A'}
                            </span>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600 text-xs">Speed Compliance</span>
                              <span className="font-medium text-xs">
                                {driver.biWeeklyCategoryPoints.earned.speedCompliance || 0}/{driver.biWeeklyCategoryPoints.caps.speedCompliance || 0}
                              </span>
                            </div>
                            <div className="bg-gray-200 rounded-full w-full h-1.5">
                              <div 
                                className="bg-blue-500 rounded-full h-1.5 transition-all duration-300"
                                style={{ 
                                  width: `${Math.min(100, Math.max(0, ((driver.biWeeklyCategoryPoints.earned.speedCompliance || 0) / Math.max(1, driver.biWeeklyCategoryPoints.caps.speedCompliance || 1)) * 100))}%` 
                                }}
                              ></div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600 text-xs">Harsh Braking</span>
                              <span className="font-medium text-xs">
                                {driver.biWeeklyCategoryPoints.earned.harshBraking || 0}/{driver.biWeeklyCategoryPoints.caps.harshBraking || 0}
                              </span>
                            </div>
                            <div className="bg-gray-200 rounded-full w-full h-1.5">
                              <div 
                                className="bg-orange-500 rounded-full h-1.5 transition-all duration-300"
                                style={{ 
                                  width: `${Math.min(100, Math.max(0, ((driver.biWeeklyCategoryPoints.earned.harshBraking || 0) / Math.max(1, driver.biWeeklyCategoryPoints.caps.harshBraking || 1)) * 100))}%` 
                                }}
                              ></div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600 text-xs">Day Driving</span>
                              <span className="font-medium text-xs">
                                {driver.biWeeklyCategoryPoints.earned.dayDriving || 0}/{driver.biWeeklyCategoryPoints.caps.dayDriving || 0}
                              </span>
                            </div>
                            <div className="bg-gray-200 rounded-full w-full h-1.5">
                              <div 
                                className="bg-green-500 rounded-full h-1.5 transition-all duration-300"
                                style={{ 
                                  width: `${Math.min(100, Math.max(0, ((driver.biWeeklyCategoryPoints.earned.dayDriving || 0) / Math.max(1, driver.biWeeklyCategoryPoints.caps.dayDriving || 1)) * 100))}%` 
                                }}
                              ></div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600 text-xs">Night Driving</span>
                              <span className="font-medium text-xs">
                                {driver.biWeeklyCategoryPoints.earned.nightDriving || 0}/{driver.biWeeklyCategoryPoints.caps.nightDriving || 0}
                              </span>
                            </div>
                            <div className="bg-gray-200 rounded-full w-full h-1.5">
                              <div 
                                className="bg-purple-500 rounded-full h-1.5 transition-all duration-300"
                                style={{ 
                                  width: `${Math.min(100, Math.max(0, ((driver.biWeeklyCategoryPoints.earned.nightDriving || 0) / Math.max(1, driver.biWeeklyCategoryPoints.caps.nightDriving || 1)) * 100))}%` 
                                }}
                              ></div>
                            </div>
                          </div>

                          <div className="pt-2 border-gray-200 border-t">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700 text-xs">Total Earned</span>
                              <span className="font-bold text-blue-600 text-xs">
                                {driver.biWeeklyCategoryPoints.earned.total || 0} points
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Daily Stats */}
                      <div className="space-y-2 mb-4 pt-2 border-gray-200 border-t">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 text-xs">KM Travelled Today</span>
                          <span className="font-medium text-purple-600 text-xs">
                            {dailyStats.find(stat => stat.plate === driver.plate)?.daily_distance || 
                             dailyStats.find(stat => stat.plate === driver.plate)?.total_distance || 
                             'N/A'} km
                          </span>
                          </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 text-xs">Start Time Today</span>
                          <span className="font-medium text-green-600 text-xs">
                            {dailyStats.find(stat => stat.plate === driver.plate)?.first_drive_time ? 
                             new Date(dailyStats.find(stat => stat.plate === driver.plate)!.first_drive_time).toLocaleTimeString() : 
                             'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 text-xs">Total Driving Hours</span>
                          <span className="font-medium text-blue-600 text-xs">
                            {dailyStats.find(stat => stat.plate === driver.plate)?.total_driving_hours || 'N/A'}h
                          </span>
                        </div>
                      </div>

                      {/* Points and Updates */}
                      <div className="space-y-2 mb-4 pt-2 border-gray-200 border-t">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 text-xs">Total Points</span>
                          <span className="font-medium text-blue-600 text-xs">{driver.total_points}</span>
                        </div>
                      </div>
                    </Card>
                    )
                    })
                  )}
                </div>
              </div>
            )}

            {activeTab === "driver-monitoring-config" && (
              <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-cyan-50 to-blue-50">
                      <tr>
                        <th className="px-6 py-4 font-semibold text-cyan-700 text-xs text-left uppercase tracking-wider">
                          Criterion
                        </th>
                        <th className="px-6 py-4 font-semibold text-cyan-700 text-xs text-left uppercase tracking-wider">
                          Selected Weighting
                        </th>
                        <th className="px-6 py-4 font-semibold text-cyan-700 text-xs text-left uppercase tracking-wider">
                          Actual Weighting
                        </th>
                        <th className="px-6 py-4 font-semibold text-cyan-700 text-xs text-left uppercase tracking-wider">
                          Risk Tiers
                        </th>
                        <th className="px-6 py-4 font-semibold text-cyan-700 text-xs text-left uppercase tracking-wider">
                          No. Incidents
                        </th>
                        <th className="px-6 py-4 font-semibold text-cyan-700 text-xs text-left uppercase tracking-wider">
                          Statuses
                        </th>
                        <th className="px-6 py-4 font-semibold text-cyan-700 text-xs text-left uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {mockMonitoringCriteria.map((criteria, index) => (
                        <tr
                          key={index}
                          className={`${index % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-cyan-50 transition-colors duration-150`}
                        >
                          <td className="px-6 py-4 font-medium text-gray-900 text-sm whitespace-nowrap">
                            {criteria.criterion}
                          </td>
                          <td className="px-6 py-4 text-gray-900 text-sm whitespace-nowrap">
                            {criteria.selectedWeighting.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-gray-900 text-sm whitespace-nowrap">
                            {criteria.actualWeighting.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-gray-900 text-sm whitespace-nowrap">{criteria.riskTiers}</td>
                          <td className="px-6 py-4 text-gray-900 text-sm whitespace-nowrap">
                            <span className="inline-flex items-center bg-red-100 px-2.5 py-0.5 rounded-full font-medium text-red-800 text-xs">
                              {criteria.incidents}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-900 text-sm">
                            {criteria.statuses.length > 0 ? (
                              <div className="space-y-1">
                                {criteria.statuses.map((status, statusIndex) => (
                                  <div
                                    key={statusIndex}
                                    className="bg-blue-100 px-2 py-1 rounded-md text-blue-800 text-xs"
                                  >
                                    {status}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 font-medium text-sm whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                className="bg-emerald-500 hover:bg-emerald-600 shadow-md hover:shadow-lg p-0 rounded-full w-8 h-8 text-white transition-all duration-200"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              {index === mockMonitoringCriteria.length - 1 && (
                                <Button
                                  size="sm"
                                  className="bg-cyan-500 hover:bg-cyan-600 shadow-md hover:shadow-lg p-0 rounded-full w-8 h-8 text-white transition-all duration-200"
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
      </div>
    </div>
  )
}
