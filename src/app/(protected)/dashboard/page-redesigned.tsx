"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Truck,
  Phone,
  DollarSign,
  User,
  AlertTriangle,
  Clock,
  CheckCircle,
  TrendingUp,
  Users,
  MapPin,
  FileText,
  ChartBar,
  Briefcase,
  Car,
  Building2,
  Building,
  Settings,
  PlusSquare,
  Wrench,
  User2,
} from "lucide-react";
import { getDashboardStats } from "@/lib/stats/dashboard";
import { createClient } from "@/lib/supabase/client";
import JobAssignmentsDashboard from "@/components/jobs/jobsStat";
import RecentActivityList from "@/components/dashboard/recentActivities";
import FinancialsPanel from "@/components/financials/FinancialsPanel";
import { SlidingNumber } from "@/components/ui/sliding-number";
import CardDemo from "@/components/userAvatar";
import Link from "next/link";
import DetailCard from "@/components/ui/detail-card";
import { onCreate } from "@/hooks/use-auth";
import { useGlobalContext } from "@/context/global-context/context";
import { ProgressWithWaypoints } from '@/components/ui/progress-with-waypoints'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { FuelGaugesView } from "@/components/fuelGauge/FuelGaugesView";
import FuelCanBusDisplay from "@/components/FuelCanBusDisplay";
import DriverPerformanceDashboard from "@/components/dashboard/DriverPerformanceDashboard";

// Enhanced routing components with proper waypoints
function RoutingSection() {
  const [trips, setTrips] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTrips() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase.from('trips').select('*')
        if (error) throw error
        setTrips(data || [])
      } catch (err) {
        console.error('Error fetching trips:', err)
        setTrips([])
      } finally {
        setLoading(false)
      }
    }
    
    fetchTrips()
  }, [])

  const tripsList = trips.filter(trip => trip.status?.toLowerCase() !== 'delivered')

  const TRIP_STATUSES = [
    'Pending',
    'Accept',
    'Arrived at Loading',
    'Staging Area', 
    'Loading',
    'On Trip',
    'Offloading',
    'Weighing In/Out',
    'Delivered'
  ]

  const getWaypoints = (trip: any) => {
    const currentStatusIndex = TRIP_STATUSES.findIndex(s => s.toLowerCase() === trip.status?.toLowerCase())
    
    return TRIP_STATUSES.map((status, index) => ({
      position: (index / (TRIP_STATUSES.length - 1)) * 100,
      label: status,
      completed: currentStatusIndex > index,
      current: currentStatusIndex === index
    }))
  }

  const getTripProgress = (status: string) => {
    const statusIndex = TRIP_STATUSES.findIndex(s => s.toLowerCase() === status?.toLowerCase())
    if (statusIndex === -1) return 0
    return ((statusIndex + 1) / TRIP_STATUSES.length) * 100
  }

  if (loading) {
    return <div className="text-center py-8">Loading trips...</div>
  }

  if (tripsList.length === 0) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8 text-muted-foreground">
          No trips available in database
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {tripsList.map((trip: any) => {
        const waypoints = getWaypoints(trip)
        const progress = getTripProgress(trip.status)

        const clientDetails = typeof trip.clientdetails === 'string' ? JSON.parse(trip.clientdetails) : trip.clientdetails
        const title = clientDetails?.name || trip.selectedClient || trip.clientDetails?.name || `Trip ${trip.trip_id || trip.id}`
        const isOffCourse = false // Simplified for demo

        return (
          <div key={trip.id || trip.trip_id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
            {/* Alert Banner */}
            {isOffCourse && (
              <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-3 rounded-t-xl">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 animate-pulse" />
                  <span className="text-sm font-medium">Trip Off-Course - Immediate Attention Required</span>
                </div>
              </div>
            )}

            <div className="p-6">
              {/* Header Section */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                      <Truck className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 text-lg truncate">{title}</h3>
                      <p className="text-sm text-slate-500">Trip #{trip.trip_id || trip.id}</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide",
                    trip.status?.toLowerCase() === 'delivered' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                    trip.status?.toLowerCase() === 'on trip' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                    ['pending', 'accept'].includes(trip.status?.toLowerCase()) ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                    ['reject', 'cancelled', 'stopped'].includes(trip.status?.toLowerCase()) ? 'bg-red-100 text-red-700 border border-red-200' :
                    'bg-slate-100 text-slate-700 border border-slate-200'
                  )}>
                    {trip.status?.replace('-', ' ') || 'Unknown'}
                  </span>
                </div>
              </div>

              {/* Route Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">Pickup</span>
                  </div>
                  <p className="text-sm font-medium text-slate-900 truncate">{trip.origin || 'Not specified'}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">Drop-off</span>
                  </div>
                  <p className="text-sm font-medium text-slate-900 truncate">{trip.destination || 'Not specified'}</p>
                </div>
              </div>

              {/* Enhanced Timeline */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-slate-700">Trip Progress</h4>
                  <span className="text-xs text-slate-500">{Math.round(progress)}% Complete</span>
                </div>
                <div className="relative">
                  <div className="flex justify-between items-center">
                    {waypoints.map((waypoint, index) => (
                      <div key={index} className="flex flex-col items-center relative z-10">
                        <div className={cn(
                          "w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all duration-300",
                          waypoint.current ? "bg-blue-500 border-blue-500 text-white shadow-lg scale-110" :
                          waypoint.completed ? "bg-emerald-500 border-emerald-500 text-white" :
                          "bg-white border-slate-300 text-slate-400"
                        )}>
                          {waypoint.completed ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : waypoint.current ? (
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                          ) : (
                            index + 1
                          )}
                        </div>
                        <span className={cn(
                          "text-xs mt-2 text-center max-w-16 leading-tight",
                          waypoint.current ? "text-blue-600 font-semibold" :
                          waypoint.completed ? "text-emerald-600 font-medium" :
                          "text-slate-400"
                        )}>
                          {waypoint.label.split(' ').slice(0, 2).join(' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="absolute top-4 left-4 right-4 h-0.5 bg-slate-200 -z-0">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 transition-all duration-500 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Cargo Information */}
              {trip.cargo && (
                <div className="bg-slate-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                    <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">Cargo Details</span>
                  </div>
                  <p className="text-sm font-medium text-slate-900">
                    {trip.cargo}{trip.cargo_weight && ` (${trip.cargo_weight})`}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                >
                  <Clock className="w-3 h-3 mr-1" />
                  Pickup Time
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                >
                  <Clock className="w-3 h-3 mr-1" />
                  Drop-off Time
                </Button>
                <Button 
                  size="sm" 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white border-0 ml-auto"
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Complete Trip
                </Button>
              </div>
            </div>

            {/* Driver Card Integration */}
            <div className="border-t border-slate-200 p-6 bg-slate-50 rounded-b-xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center">
                  <User className="w-6 h-6 text-slate-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Driver Assignment</p>
                  <p className="text-sm text-slate-500">No driver assigned</p>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<string>("routing");

  return (
    <>
      <div className="flex-1 space-y-4 p-4 pt-6">
        {/* Top Tabs Navigation */}
        <div className="flex items-center justify-between">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v)}
            className="w-full"
          >
            <TabsList className="flex w-fit items-center rounded-full bg-white/80 dark:bg-slate-800 p-1.5 shadow-lg ring-1 ring-slate-200 dark:ring-slate-700">
              <TabsTrigger
                value="routing"
                className="px-4 py-2 text-sm font-medium rounded-full data-[state=active]:bg-primary data-[state=active]:text-white hover:brightness-95"
              >
                Routing
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Conditionally render the main views */}
        {activeTab === "routing" && (
          <div className="space-y-4">
            <div className="mb-4 flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Trip Routing</h2>
                <p className="text-muted-foreground">Monitor all trips with progress tracking and waypoints</p>
              </div>
            </div>
            <RoutingSection />
          </div>
        )}
      </div>
    </>
  );
}