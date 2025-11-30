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
import { SecureButton } from "@/components/SecureButton";
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
  ChevronDown,
  ChevronRight,
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
import TestRouteMap from "@/components/map/test-route-map";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';



// Driver Card Component with fetched driver info
function DriverCard({ trip, userRole, handleViewMap, setCurrentTripForNote, setNoteText, setNoteOpen, setAvailableDrivers, setCurrentTripForChange, setChangeDriverOpen }: any) {
  const [driverInfo, setDriverInfo] = useState<any>(null)
  const [vehicleInfo, setVehicleInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [vehicleLocation, setVehicleLocation] = useState<any>(null)
  const [isFlashing, setIsFlashing] = useState(false)
  const [assignment, setAssignment] = useState<any>(null)

  // Check for unauthorized stops and trigger flash animation
  useEffect(() => {
    if (trip.unauthorized_stops_count > 0) {
      setIsFlashing(true)
      const timer = setTimeout(() => setIsFlashing(false), 3000) // Flash for 3 seconds
      return () => clearTimeout(timer)
    }
  }, [trip.unauthorized_stops_count])

  useEffect(() => {
    async function fetchAssignmentInfo() {
      const assignments = trip.vehicleassignments || trip.vehicle_assignments || []
      if (!assignments.length) return

      setLoading(true)
      try {
        const supabase = createClient()
        const assignment = assignments[0]
        setAssignment(assignment) // Store assignment for fallback vehicle info
        
        // Switch to second driver if status is handover and second driver exists
        let driverToFetch = assignment.drivers?.[0]
        if (trip.status?.toLowerCase() === 'handover' && assignment.drivers?.[1]) {
          driverToFetch = assignment.drivers[1]
        }
        
        // Fetch driver info by ID
        if (driverToFetch?.id) {
          const { data: driver } = await supabase
            .from('drivers')
            .select('*')
            .eq('id', driverToFetch.id)
            .single()
          setDriverInfo(driver)
          
          // Fetch vehicle location from EPS API
          if (driver) {
            try {
              const response = await fetch('http://64.227.138.235:3000/api/eps-vehicles')
              const result = await response.json()
              const vehicles = result.data || []
              
              // First try to match by driver name
              let vehicle = vehicles.find((v: any) => {
                const vehicleDriverName = v.driver_name?.toLowerCase() || ''
                const searchName = `${driver.first_name} ${driver.surname}`.toLowerCase()
                return vehicleDriverName.includes(searchName) || searchName.includes(vehicleDriverName)
              })
              
              // Fallback: match by vehicle name from assignment (JL64ZGGP)
              if (!vehicle && assignment?.vehicle?.name) {
                vehicle = vehicles.find((v: any) => {
                  return v.plate?.toLowerCase() === assignment.vehicle.name.toLowerCase()
                })
              }
              
              if (vehicle) {
                setVehicleLocation(vehicle)
              }
            } catch (error) {
              console.error('Error fetching vehicle location:', error)
            }
          }
        }
        
        // Fetch vehicle info by ID from local database
        if (assignment.vehicle?.id) {
          const { data: vehicle } = await supabase
            .from('vehiclesc')
            .select('*')
            .eq('id', assignment.vehicle.id)
            .single()
          setVehicleInfo(vehicle)
          
          // If no external vehicle found yet, try matching by local vehicle registration
          if (!vehicleLocation && vehicle?.registration_number) {
            try {
              const response = await fetch('http://64.227.138.235:3000/api/eps-vehicles')
              const result = await response.json()
              const vehicles = result.data || []
              
              const matchedVehicle = vehicles.find((v: any) => {
                return v.plate?.toLowerCase() === vehicle.registration_number.toLowerCase()
              })
              
              if (matchedVehicle) {
                setVehicleLocation(matchedVehicle)
              }
            } catch (error) {
              console.error('Error fetching vehicle by registration:', error)
            }
          }
        }
      } catch (err) {
        console.error('Error fetching assignment info:', err)
      }
      setLoading(false)
    }

    fetchAssignmentInfo()
  }, [trip.vehicleassignments, trip.vehicle_assignments])

  const driverName = driverInfo ? (typeof driverInfo.surname === 'string' ? driverInfo.surname : String(driverInfo.surname || 'Unassigned')) : 'Unassigned'
  const initials = driverName !== 'Unassigned' ? driverName.split(' ').map((s: string) => s[0]).slice(0,2).join('') : 'DR'

  if (loading) {
    return (
      <div className="w-[30%] bg-white rounded-lg border border-slate-200 shadow-sm p-3 animate-pulse">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-slate-200"></div>
          <div className="flex-1">
            <div className="h-3 bg-slate-200 rounded w-3/4 mb-1"></div>
            <div className="h-2 bg-slate-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      "w-[30%] rounded-xl p-4 bg-white/30 backdrop-blur-md border border-white/10 shadow-lg transition-transform duration-200 hover:scale-[1.02] hover:shadow-2xl",
      trip.unauthorized_stops_count > 0 && trip.status?.toLowerCase() !== 'delivered'
        ? isFlashing
          ? "ring-2 ring-red-400 animate-pulse"
          : "ring-1 ring-red-300"
        : "border-slate-200/30"
    )}>
      {/* Top accent */}
      <div className="h-1 w-full rounded-full bg-gradient-to-r from-blue-400 via-blue-400  to-indigo-500 mb-3 opacity-90" />

      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold text-white"
          style={{
            background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
            boxShadow: "0 6px 18px rgba(59,130,246,0.18)"
          }}
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-slate-900 truncate">{typeof driverInfo?.surname === 'string' ? driverInfo.surname : String(driverInfo?.surname || 'Unassigned')}</div>
          <div className="text-xs text-slate-600">{driverInfo ? driverInfo.phone_number : 'No driver assigned'}</div>
        </div>
        <div className="flex-shrink-0">
          <span className={cn(
            "px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide",
            driverInfo?.available ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
          )}>
            {driverInfo?.available ? 'Available' : 'Unavailable'}
          </span>
        </div>
      </div>

      {/* Unauthorized Stop Alert */}
      {trip.unauthorized_stops_count > 0 && trip.status?.toLowerCase() !== 'delivered' && (
        <div className="mb-3 p-3 rounded-lg bg-red-50/70 border border-red-200/40 backdrop-blur-sm">
          <div className="flex items-start gap-2">
            <div className="flex-shrink-0">
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-semibold text-red-800 uppercase">Unauthorized Stop Alert</div>
              <div className="text-sm font-medium text-red-900">
                {trip.unauthorized_stops_count} unauthorized stop{trip.unauthorized_stops_count > 1 ? 's' : ''} detected
              </div>
              {trip.route_points && trip.route_points.length > 0 && (
                <div className="text-xs text-red-700 mt-1">
                  Last: {(() => {
                    const last = trip.route_points[trip.route_points.length - 1]
                    return last ? `${last.lat?.toFixed(4)}, ${last.lng?.toFixed(4)}` : 'Unknown'
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}



      <div className="mb-3 p-3 rounded-lg bg-white/20 border border-white/5">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1.5 h-1.5 bg-slate-500 rounded-full" />
          <span className="text-xs font-medium text-slate-700 uppercase">Vehicle</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-900 truncate">
            {vehicleLocation?.plate || vehicleInfo?.registration_number || assignment?.vehicle?.name || 'Not assigned'}
          </span>
          <span className="text-xs text-slate-500">{vehicleLocation ? `Speed: ${vehicleLocation.speed} km/h` : ''}</span>
        </div>
        {vehicleLocation && (
          <div className="mt-2 text-xs text-slate-600">
            {vehicleLocation.address}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button
          size="sm"
          variant="link"
          className="h-8 text-xs border"
          onClick={async () => {
            const supabase = createClient();
            
            // Use route_points from trip data (already in [lng, lat] format)
            const routePoints = trip.route_points || [];
            const routeCoords = routePoints.length > 0 ? routePoints : [];
            
            // Use stop_points from trip data with sequence numbers
            const stopPointsData = trip.stop_points || [];
            const stopPoints = stopPointsData
              .sort((a: any, b: any) => (a.sequence || 0) - (b.sequence || 0))
              .map((point: any, index: number) => ({
                name: point.customer || 'Stop Point',
                coordinates: [point.lng, point.lat],
                sequence: point.sequence || index + 1
              }));

            // Fetch high risk zones
            let highRiskZones = [];
            try {
              const { data: riskZones } = await supabase
                .from('high_risk')
                .select('id, name, coordinates');
              
              highRiskZones = (riskZones || []).map(zone => {
                if (zone.coordinates) {
                  const coordPairs = zone.coordinates.split(' ')
                    .filter(coord => coord.trim())
                    .map(coord => {
                      const [lng, lat, z] = coord.split(',');
                      return [parseFloat(lng), parseFloat(lat)];
                    })
                    .filter(pair => !isNaN(pair[0]) && !isNaN(pair[1]));

                  if (coordPairs.length > 2) {
                    return {
                      name: zone.name,
                      polygon: coordPairs
                    };
                  }
                }
                return null;
              }).filter(Boolean);
            } catch (error) {
              console.error('Error fetching high risk zones:', error);
            }

            handleViewMap(driverName, { ...trip, routeCoords, stopPoints, highRiskZones });
          }}
        >
          <MapPin className="w-3 h-3" /> Track
        </Button>

        <SecureButton
          page="dashboard"
          action="edit"
          size="sm"
          variant="link"
          className="h-8 text-xs border"
          onClick={() => {
            setCurrentTripForNote(trip);
            setNoteText(trip.status_notes || '');
            setNoteOpen(true);
          }}
        >
          <FileText className="w-3 h-3" /> Note
        </SecureButton>

        <SecureButton
          page="dashboard"
          action="edit"
          size="sm"
          variant="link"
          className="h-8 text-xs border"
          onClick={async () => {
            const supabase = createClient();
            const { data: drivers } = await supabase.from('drivers').select('*');
            setAvailableDrivers(drivers || []);
            setCurrentTripForChange(trip);
            setChangeDriverOpen(true);
          }}
        >
          <User className="w-3 h-3" /> Change
        </SecureButton>

        <SecureButton
          page="dashboard"
          action="delete"
          size="sm"
          variant="destructive"
          className="h-8 text-xs border"
          onClick={async () => {
            if (!confirm('Are you sure you want to delete this trip?')) return;
            try {
              const supabase = createClient();
              const { error } = await supabase.from('trips').delete().eq('id', trip.id);
              if (error) throw error;
              alert('Trip deleted successfully');
            } catch (err) {
              console.error('Failed to delete trip:', err);
              alert('Failed to delete trip');
            }
          }}
        >
          <X className="w-3 h-3" /> Cancel
        </SecureButton>
      </div>
    </div>
  )
}

// Enhanced routing components with proper waypoints
function RoutingSection({ userRole, handleViewMap, setCurrentTripForNote, setNoteText, setNoteOpen, setAvailableDrivers, setCurrentTripForChange, setChangeDriverOpen, refreshTrigger, setRefreshTrigger, setPickupTimeOpen, setDropoffTimeOpen, setCurrentTripForTime, setTimeType, setSelectedTime, currentUnauthorizedTrip, setCurrentUnauthorizedTrip, setUnauthorizedStopModalOpen, loadingPhotos, setLoadingPhotos, setCurrentTripPhotos, setPhotosModalOpen, setCurrentTripAlerts, setAlertsModalOpen }: any) {
  const [trips, setTrips] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTrips() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase.from('trips').select('*')
        if (error) throw error
        setTrips(data || [])
        
        // Check for most recent unauthorized stop
        const recentUnauthorized = (data || [])
          .filter(trip => trip.unauthorized_stops_count > 0)
          .sort((a, b) => new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime())[0]
        
        if (recentUnauthorized && !currentUnauthorizedTrip) {
          setCurrentUnauthorizedTrip(recentUnauthorized)
          // Removed automatic modal opening
        }
      } catch (err) {
        console.error('Error fetching trips:', err)
        setTrips([])
      } finally {
        setLoading(false)
      }
    }
    
    fetchTrips()
    
    // Real-time subscription
    const supabase = createClient()
    const channel = supabase
      .channel('trips-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'trips' },
        () => fetchTrips()
      )
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [refreshTrigger])

  // Sort trips to put unauthorized stops at the top
  const tripsList = trips
    .filter(trip => trip.status?.toLowerCase() !== 'delivered')
    .sort((a, b) => {
      // First sort by unauthorized stops (descending)
      const aUnauthorized = a.unauthorized_stops_count || 0
      const bUnauthorized = b.unauthorized_stops_count || 0
      if (aUnauthorized !== bUnauthorized) {
        return bUnauthorized - aUnauthorized
      }
      // Then by creation date (newest first)
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    })

  const STATUS_OPTIONS = [
    { label: "Pending", value: "pending" },
    { label: "Accept", value: "accepted" },
    { label: "Reject", value: "rejected" },
    { label: "Arrived at Loading", value: "arrived-at-loading" },
    { label: "Staging Area", value: "staging-area" },
    { label: "Loading", value: "loading" },
    { label: "On Trip", value: "on-trip" },
    { label: "Completed", value: "completed" },
    { label: "Cancelled", value: "cancelled" },
    { label: "Stopped", value: "stopped" },
    { label: "Offloading", value: "offloading" },
    { label: "Weighing In/Out", value: "weighing" },
    { label: "Delivered", value: "delivered" },
  ]

  // Main workflow statuses for progress tracking
  const WORKFLOW_STATUSES = [
    { label: "In queue", value: "pending" },
    { label: "Leaving depot", value: "accepted" },
    { label: "Leaving Fuchs", value: "arrived-at-loading" },
    { label: "Loading", value: "staging-area" },
    { label: "En-route to delivery", value: "loading" },
    { label: "On-route to Fuchs", value: "on-trip" },
    { label: "Unloading", value: "offloading" },
    { label: "Fuelling", value: "weighing" },
    { label: "Back at depot", value: "depo" },
    { label: "Service", value: "handover" },
    { label: "Completed", value: "delivered" }
  ]

  const getWaypointsWithStops = (trip: any) => {
    const currentStatusIndex = WORKFLOW_STATUSES.findIndex(s => s.value === trip.status?.toLowerCase())
    const baseWaypoints = WORKFLOW_STATUSES.map((status, index) => ({
      position: (index / (WORKFLOW_STATUSES.length - 1)) * 100,
      label: status.label,
      completed: currentStatusIndex > index,
      current: currentStatusIndex === index,
      isStop: false
    }))

    // Insert stops between Loading (index 4) and On Trip (index 5)
    const stops = trip.selected_stop_points || trip.selectedstoppoints || []
    if (stops.length > 0) {
      const loadingPos = baseWaypoints[4].position
      const onTripPos = baseWaypoints[5].position
      const stopSpacing = (onTripPos - loadingPos) / (stops.length + 1)
      
      const stopWaypoints = stops.map((stop: any, index: number) => ({
        position: loadingPos + (stopSpacing * (index + 1)),
        label: `Stop ${index + 1}`,
        completed: currentStatusIndex > 4,
        current: false,
        isStop: true,
        stopId: stop
      }))
      
      // Adjust positions of waypoints after Loading
      const adjustedWaypoints = [...baseWaypoints]
      for (let i = 5; i < adjustedWaypoints.length; i++) {
        adjustedWaypoints[i].position = onTripPos + ((i - 5) / (WORKFLOW_STATUSES.length - 6)) * (100 - onTripPos)
      }
      
      return [...adjustedWaypoints.slice(0, 5), ...stopWaypoints, ...adjustedWaypoints.slice(5)]
    }
    
    return baseWaypoints
  }



  const getTripProgress = (status: string) => {
    const statusIndex = WORKFLOW_STATUSES.findIndex(s => s.value === status?.toLowerCase())
    if (statusIndex === -1) return 0
    return ((statusIndex + 1) / WORKFLOW_STATUSES.length) * 100
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
    <div className="space-y-6">
      {tripsList.map((trip: any) => {
        const waypoints = getWaypointsWithStops(trip)
        const progress = getTripProgress(trip.status)

        const clientDetails = typeof trip.clientdetails === 'string' ? JSON.parse(trip.clientdetails) : trip.clientdetails
        const stopPoints = trip.stop_points || []
        const hasUnauthorizedStops = trip.unauthorized_stops_count > 0

        return (
          <div key={trip.id || trip.trip_id} className="flex gap-4 border-b-gray-500 border-b-2 pb-10">
            {/* Driver Card - 30% */}
            <DriverCard 
              trip={trip} 
              userRole={userRole}
              handleViewMap={handleViewMap}
              setCurrentTripForNote={setCurrentTripForNote}
              setNoteText={setNoteText}
              setNoteOpen={setNoteOpen}
              setAvailableDrivers={setAvailableDrivers}
              setCurrentTripForChange={setCurrentTripForChange}
              setChangeDriverOpen={setChangeDriverOpen}
            />
            {/* Trip Card - 70% */}
            <div className={cn(
              "w-[70%] rounded-xl p-4 bg-white shadow-sm border border-slate-200 transition-transform duration-200 hover:scale-[1.01] text-black",
              trip.unauthorized_stops_count > 0 && trip.status?.toLowerCase() !== 'delivered'
              ? "ring-2 ring-red-400"
              : "ring-0"
            )} style={{ backgroundImage: "linear-gradient(180deg, rgba(255,255,255,1), rgba(249,250,251,1))" }}>
              {/* Top accent */}
              <div className="h-1 w-full rounded-full bg-gradient-to-r from-blue-500 via-blue-400 to-blue-400 mb-3 opacity-100" />

              {/* Alert Banner */}
              {(() => {
                return ((trip.unauthorized_stops_count > 0 && trip.status?.toLowerCase() !== 'delivered') || 
                        (trip.alert_message && ((Array.isArray(trip.alert_message) && trip.alert_message.length > 0) || 
                         (typeof trip.alert_message === 'string' && trip.alert_message.trim() !== ''))));
              })() && (
              <div className="rounded-md p-3 mb-3 text-sm bg-red-50 border border-red-200">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    {(() => {
                      if (trip.alert_message) {
                        let latestAlert = null;
                        if (Array.isArray(trip.alert_message) && trip.alert_message.length > 0) {
                          latestAlert = trip.alert_message[trip.alert_message.length - 1];
                        } else if (typeof trip.alert_message === 'string' && trip.alert_message.trim() !== '') {
                          latestAlert = trip.alert_message;
                        }
                        
                        if (latestAlert) {
                          return (
                            <div>
                              <div className="text-sm font-medium text-red-700 mb-1">
                                {typeof latestAlert === 'object' ? 
                                  (latestAlert.type?.replace('_', ' ').toUpperCase() || 'ALERT') : 
                                  'LATEST ALERT'
                                }
                              </div>
                              <div className="text-sm text-red-600">
                                {typeof latestAlert === 'object' ? latestAlert.message : latestAlert}
                              </div>
                              {typeof latestAlert === 'object' && latestAlert.timestamp && (
                                <div className="text-xs text-red-500 mt-1">
                                  {new Date(latestAlert.timestamp).toLocaleString()}
                                </div>
                              )}
                            </div>
                          );
                        }
                      }
                      
                      if (trip.alert_type) {
                        return (
                          <div className="text-sm font-medium text-red-700">
                            {trip.alert_type.replace('_', ' ').toUpperCase()}
                          </div>
                        );
                      }
                      
                      return (
                        <div className="text-sm font-medium text-red-700">
                          Unauthorized Stop — {trip.unauthorized_stops_count} detected
                        </div>
                      );
                    })()
                    }
                  </div>
                  {trip.alert_message && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 text-xs border-red-300 text-red-700 hover:bg-red-100"
                      onClick={() => {
                        let alerts = [];
                        if (Array.isArray(trip.alert_message)) {
                          alerts = trip.alert_message;
                        } else if (typeof trip.alert_message === 'string' && trip.alert_message.trim() !== '') {
                          alerts = [trip.alert_message];
                        }
                        if (alerts.length > 0) {
                          setCurrentTripAlerts({ tripId: trip.trip_id || trip.id, alerts });
                          setAlertsModalOpen(true);
                        }
                      }}
                    >
                      View All
                    </Button>
                  )}
                </div>
              </div>
              )}

              <div className="p-3">
              {/* Header Section */}
              <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center border border-indigo-200">
              <Truck className="w-4 h-4 text-indigo-700" />
              </div>
              <div className="min-w-0">
              <h3 className="font-semibold text-black text-sm">Trip #{trip.trip_id || trip.id}</h3>
              </div>
              </div>
              </div>
              <div className="flex flex-col items-end">
              <span className={cn(
              "px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wide",
              trip.status?.toLowerCase() === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
              trip.status?.toLowerCase() === 'on-trip' ? 'bg-sky-100 text-sky-800' :
              ['pending', 'accepted'].includes(trip.status?.toLowerCase()) ? 'bg-amber-100 text-amber-800' :
              ['rejected', 'cancelled', 'stopped'].includes(trip.status?.toLowerCase()) ? 'bg-rose-100 text-rose-800' :
              ['completed', 'depo', 'handover'].includes(trip.status?.toLowerCase()) ? 'bg-lime-100 text-lime-800' :
              'bg-slate-100 text-slate-800'
              )}>
              {trip.status || 'Unknown'}
              </span>
              </div>
              </div>

              {/* Route Information */}
              <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-white rounded-lg p-2 border border-slate-100">
              <div className="flex items-center gap-1 mb-1">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
              <span className="text-xs font-medium text-gray-700 uppercase">Pickup</span>
              </div>
              <p className="text-xs font-medium text-black truncate">{trip.origin || 'Not specified'}</p>
              </div>
              <div className="bg-white rounded-lg p-2 border border-slate-100">
              <div className="flex items-center gap-1 mb-1">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
              <span className="text-xs font-medium text-gray-700 uppercase">Drop-off ({stopPoints.length} stops)</span>
              </div>
              {stopPoints.length > 0 ? (
                <select className="w-full text-xs font-medium text-black bg-white border border-slate-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer hover:border-slate-300 transition-colors">
                  {stopPoints.sort((a, b) => (a.sequence || 0) - (b.sequence || 0)).map((stop, idx) => (
                    <option key={idx} value={stop.customer} className="py-1">
                      {idx + 1}. {stop.customer}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-xs font-medium text-black truncate">No stops</p>
              )}
              </div>
              </div>

              {/* Enhanced Timeline */}
              <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold text-black">Trip Progress</h4>
              <span className="text-xs text-gray-700">{Math.round(progress)}% Complete</span>
              </div>
              <div className="relative">
              <div className="flex justify-between items-center">
              {waypoints.map((waypoint, index) => (
              <div key={index} className="flex flex-col items-center relative z-10 group">
              <div className={cn(
              "w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all duration-300",
              waypoint.isStop ? "bg-orange-500 border-orange-600 text-white" :
              waypoint.current ? "bg-blue-500 border-blue-700 text-white" :
              waypoint.completed ? "bg-emerald-600 border-emerald-700 text-white" :
              "bg-slate-100 border-slate-200 text-slate-600"
              )}>
              {waypoint.isStop ? (
                <MapPin className="w-3 h-3" />
              ) : waypoint.completed ? (
                <CheckCircle className="w-3 h-3" />
              ) : waypoint.current ? (
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              ) : (
                index + 1
              )}
              </div>
              <span className={cn(
              "text-xs mt-1 text-center max-w-12 leading-tight",
              waypoint.isStop ? "text-orange-600 font-medium" :
              waypoint.current ? "text-sky-700 font-semibold" :
              waypoint.completed ? "text-emerald-700 font-medium" :
              "text-gray-600"
              )}>
              {waypoint.label.split(' ')[0]}
              </span>
              {waypoint.isStop && (
              <div className="absolute bottom-full mb-1 px-2 py-1 bg-white border rounded text-xs text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                {typeof waypoint.stopId === 'object' ? waypoint.stopId.name : waypoint.stopId}
              </div>
              )}
              </div>
              ))}
              </div>
              <div className="absolute top-3 left-3 right-3 h-1 bg-slate-100 -z-0 rounded">
              <div 
              className="h-full rounded bg-gradient-to-r from-blue-500 via-sky-500 to-blue-400 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
              />
              </div>
              </div>
              </div>

              {/* Cargo Information */}
              {trip.cargo && (
              <div className="bg-white rounded-lg p-2 mb-3 border border-slate-100">
              <div className="flex items-center gap-1 mb-1">
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
              <span className="text-xs font-medium text-gray-700 uppercase">Cargo</span>
              </div>
              <p className="text-sm font-medium text-black">
              {trip.cargo}{trip.cargo_weight && ` (${trip.cargo_weight})`}
              </p>
              </div>
              )}



              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 mt-1">
              <SecureButton 
              page="dashboard"
              action="edit"
              size="sm" 
              variant="outline" 
              className="h-8 text-xs"
              onClick={() => {
              setCurrentTripForTime(trip);
              setTimeType('pickup');
              const pickupLocs = trip.pickup_locations || trip.pickuplocations || [];
              setSelectedTime(pickupLocs[0]?.scheduled_time || '');
              setPickupTimeOpen(true);
              }}
              >
              <Clock className="w-3 h-3 mr-1" />
              {(trip.pickup_locations?.[0]?.scheduled_time || trip.pickuplocations?.[0]?.scheduled_time) ? 'Update Pickup' : 'Set Pickup'}
              </SecureButton>
              <SecureButton 
              page="dashboard"
              action="edit"
              size="sm" 
              variant="outline" 
              className="h-8 text-xs"
              onClick={() => {
              setCurrentTripForTime(trip);
              setTimeType('dropoff');
              const dropoffLocs = trip.dropoff_locations || trip.dropofflocations || [];
              setSelectedTime(dropoffLocs[0]?.scheduled_time || '');
              setDropoffTimeOpen(true);
              }}
              >
              <Clock className="w-3 h-3 mr-1" />
              {(trip.dropoff_locations?.[0]?.scheduled_time || trip.dropofflocations?.[0]?.scheduled_time) ? 'Update Drop-off' : 'Set Drop-off'}
              </SecureButton>
              <Button 
              size="sm"
              variant="link"
              className="h-8 text-xs ml-auto border border-gray-300"
              onClick={async () => {
              setLoadingPhotos(true);
              try {
              const supabase = createClient();
              const tripId = trip.id || trip.trip_id;
              
              // Fetch photos from both folders
              const { data: beforePhotos } = await supabase.storage
              .from('trip-photos')
              .list(`${tripId}/loadBefore`);
              
              const { data: duringPhotos } = await supabase.storage
              .from('trip-photos')
              .list(`${tripId}/loadDuring`);
              
              // Get Supabase URL and construct direct URLs
              const supabaseUrl = supabase.supabaseUrl;
              
              const beforeUrls = beforePhotos?.filter(item => item.name && !item.name.endsWith('/'))
              .map(photo => ({
              url: `${supabaseUrl}/storage/v1/object/public/trip-photos/${tripId}/loadBefore/${photo.name}`,
              name: photo.name
              })) || [];
              
              const duringUrls = duringPhotos?.filter(item => item.name && !item.name.endsWith('/'))
              .map(photo => ({
              url: `${supabaseUrl}/storage/v1/object/public/trip-photos/${tripId}/loadDuring/${photo.name}`,
              name: photo.name
              })) || [];
              
              console.log('Generated URLs:', { beforeUrls, duringUrls });
              
              setCurrentTripPhotos({ 
              tripId, 
              before: beforeUrls, 
              during: duringUrls 
              });
              setPhotosModalOpen(true);
              } catch (err) {
              console.error('Failed to load photos:', err);
              alert('Failed to load photos');
              } finally {
              setLoadingPhotos(false);
              }
              }}
              disabled={loadingPhotos}
              >
              <FileText className="w-3 h-3 mr-1" />
              {loadingPhotos ? 'Loading...' : 'View Loading Pictures'}
              </Button>
              </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Trip Reports Section Component
function TripReportsSection() {
  const [completedTrips, setCompletedTrips] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedTrip, setExpandedTrip] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCompletedTrips() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('trips')
          .select('*')
          .not('status', 'eq', 'pending')
          .order('updated_at', { ascending: false })
        
        if (error) throw error
        setCompletedTrips(data || [])
      } catch (err) {
        console.error('Error fetching completed trips:', err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchCompletedTrips()
  }, [])

  const getTimingStatus = (scheduledTime: string, actualTime: string) => {
    if (!scheduledTime || !actualTime) return 'Unknown'
    
    const scheduled = new Date(scheduledTime)
    const actual = new Date(actualTime)
    const diffMinutes = (actual.getTime() - scheduled.getTime()) / (1000 * 60)
    
    if (diffMinutes <= -15) return 'Early'
    if (diffMinutes >= 15) return 'Late'
    return 'On Time'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Early': return 'text-blue-700 bg-blue-50'
      case 'Late': return 'text-red-700 bg-red-50'
      case 'On Time': return 'text-green-700 bg-green-50'
      default: return 'text-gray-700 bg-gray-50'
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading trip reports...</div>
  }

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h2 className="text-3xl font-bold tracking-tight">Trip Reports</h2>
        <p className="text-muted-foreground">Performance analysis for active, completed and delivered trips</p>
      </div>

      <div className="space-y-3">
        {completedTrips.map((trip) => {
          const clientDetails = typeof trip.clientdetails === 'string' ? JSON.parse(trip.clientdetails) : trip.clientdetails
          const pickupLocations = trip.pickup_locations || trip.pickuplocations || []
          const dropoffLocations = trip.dropoff_locations || trip.dropofflocations || []
          
          const scheduledPickup = pickupLocations[0]?.scheduled_time
          const scheduledDropoff = dropoffLocations[0]?.scheduled_time
          const actualStart = trip.actual_start_time
          const actualEnd = trip.actual_end_time
          
          const startStatus = getTimingStatus(scheduledPickup, actualStart)
          const arrivalStatus = getTimingStatus(scheduledDropoff, actualEnd)
          const unauthorizedStops = trip.unauthorized_stops_count || 0
          
          const isExpanded = expandedTrip === trip.id
          
          return (
            <Card key={trip.id} className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader 
                className="cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => setExpandedTrip(isExpanded ? null : trip.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                      <Truck className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-slate-900">
                        {clientDetails?.name || 'Unknown Client'} - Trip #{trip.trip_id || trip.id}
                      </CardTitle>
                      <p className="text-sm text-slate-600">
                        {trip.origin} → {trip.destination}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={cn('px-2 py-1 text-xs font-medium', 
                      trip.status === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    )}>
                      {trip.status}
                    </Badge>
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 w-4" />}
                  </div>
                </div>
              </CardHeader>
              
              {isExpanded && (
                <CardContent className="pt-0">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h4 className="font-semibold text-slate-900 mb-4">Trip Performance Analysis</h4>
                    
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-100">
                            <TableHead className="font-semibold text-slate-700">Metric</TableHead>
                            <TableHead className="font-semibold text-slate-700">Scheduled</TableHead>
                            <TableHead className="font-semibold text-slate-700">Actual</TableHead>
                            <TableHead className="font-semibold text-slate-700">Status</TableHead>
                            <TableHead className="font-semibold text-slate-700">Notes</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow className="hover:bg-slate-50">
                            <TableCell className="font-medium text-slate-900">Trip Start</TableCell>
                            <TableCell className="text-slate-600">
                              {scheduledPickup ? new Date(scheduledPickup).toLocaleString() : 'Not scheduled'}
                            </TableCell>
                            <TableCell className="text-slate-600">
                              {actualStart ? new Date(actualStart).toLocaleString() : 'Not recorded'}
                            </TableCell>
                            <TableCell>
                              <Badge className={cn('px-2 py-1 text-xs font-medium', getStatusColor(startStatus))}>
                                {startStatus}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-slate-600">
                              {scheduledPickup && actualStart ? 
                                `${Math.round((new Date(actualStart).getTime() - new Date(scheduledPickup).getTime()) / (1000 * 60))} min difference` : 
                                'No timing data'
                              }
                            </TableCell>
                          </TableRow>
                          
                          <TableRow className="hover:bg-slate-50">
                            <TableCell className="font-medium text-slate-900">Trip Arrival</TableCell>
                            <TableCell className="text-slate-600">
                              {scheduledDropoff ? new Date(scheduledDropoff).toLocaleString() : 'Not scheduled'}
                            </TableCell>
                            <TableCell className="text-slate-600">
                              {actualEnd ? new Date(actualEnd).toLocaleString() : 'Not recorded'}
                            </TableCell>
                            <TableCell>
                              <Badge className={cn('px-2 py-1 text-xs font-medium', getStatusColor(arrivalStatus))}>
                                {arrivalStatus}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-slate-600">
                              {scheduledDropoff && actualEnd ? 
                                `${Math.round((new Date(actualEnd).getTime() - new Date(scheduledDropoff).getTime()) / (1000 * 60))} min difference` : 
                                'No timing data'
                              }
                            </TableCell>
                          </TableRow>
                          
                          <TableRow className="hover:bg-slate-50">
                            <TableCell className="font-medium text-slate-900">Unauthorized Stops</TableCell>
                            <TableCell className="text-slate-600">0 expected</TableCell>
                            <TableCell className="text-slate-600">{unauthorizedStops} detected</TableCell>
                            <TableCell>
                              <Badge className={cn('px-2 py-1 text-xs font-medium', 
                                unauthorizedStops === 0 ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'
                              )}>
                                {unauthorizedStops === 0 ? 'Compliant' : 'Non-Compliant'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-slate-600">
                              {unauthorizedStops > 0 ? `${unauthorizedStops} unauthorized stop(s)` : 'No violations'}
                            </TableCell>
                          </TableRow>
                          
                          <TableRow className="hover:bg-slate-50">
                            <TableCell className="font-medium text-slate-900">Distance</TableCell>
                            <TableCell className="text-slate-600">
                              {trip.estimated_distance ? `${trip.estimated_distance} km` : 'Not estimated'}
                            </TableCell>
                            <TableCell className="text-slate-600">
                              {trip.total_distance ? `${trip.total_distance} km` : 'Not recorded'}
                            </TableCell>
                            <TableCell>
                              <Badge className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50">
                                Completed
                              </Badge>
                            </TableCell>
                            <TableCell className="text-slate-600">
                              {trip.estimated_distance && trip.total_distance ? 
                                `${Math.round(((trip.total_distance - trip.estimated_distance) / trip.estimated_distance) * 100)}% variance` : 
                                'No comparison data'
                              }
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                    
                    {trip.notes && (
                      <div className="mt-4 p-3 bg-white rounded border border-slate-200">
                        <h5 className="font-medium text-slate-900 mb-2">Trip Notes</h5>
                        <p className="text-sm text-slate-600">{trip.notes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
        
        {completedTrips.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <Truck className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No trips found</p>
            <p className="text-sm">Trip reports will appear here for active and completed trips</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<string>("routing");
  const [auditData, setAuditData] = useState<any[]>([]);
  const [auditLoading, setAuditLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>("");
  const [mapOpen, setMapOpen] = useState(false);
  const [mapData, setMapData] = useState<any>(null);
  const [noteOpen, setNoteOpen] = useState(false);
  const [currentTripForNote, setCurrentTripForNote] = useState<any>(null);
  const [noteText, setNoteText] = useState('');
  const [changeDriverOpen, setChangeDriverOpen] = useState(false);
  const [currentTripForChange, setCurrentTripForChange] = useState<any>(null);
  const [availableDrivers, setAvailableDrivers] = useState<any[]>([]);
  const [allVehicles, setAllVehicles] = useState<any[]>([]);
  const [driverSearchTerm, setDriverSearchTerm] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [pickupTimeOpen, setPickupTimeOpen] = useState(false);
  const [dropoffTimeOpen, setDropoffTimeOpen] = useState(false);
  const [currentTripForTime, setCurrentTripForTime] = useState<any>(null);
  const [timeType, setTimeType] = useState<'pickup' | 'dropoff'>('pickup');
  const [selectedTime, setSelectedTime] = useState('');
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [tripDetailsOpen, setTripDetailsOpen] = useState(false);
  const [unauthorizedStopModalOpen, setUnauthorizedStopModalOpen] = useState(false);
  const [currentUnauthorizedTrip, setCurrentUnauthorizedTrip] = useState<any>(null);
  const [unauthorizedStopNote, setUnauthorizedStopNote] = useState('');
  const [photosModalOpen, setPhotosModalOpen] = useState(false);
  const [currentTripPhotos, setCurrentTripPhotos] = useState<any>(null);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [trips, setTrips] = useState<any[]>([]);
  const [alertsModalOpen, setAlertsModalOpen] = useState(false);
  const [currentTripAlerts, setCurrentTripAlerts] = useState<any>(null);

  // Get user role from cookies
  useEffect(() => {
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(";").shift();
      return null;
    };
    const role = decodeURIComponent(getCookie("role") || "");
    setUserRole(role);
  }, []);

  // Fetch trips for alerts
  useEffect(() => {
    async function fetchTrips() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.from('trips').select('*');
        if (error) throw error;
        setTrips(data || []);
      } catch (err) {
        console.error('Error fetching trips:', err);
      }
    }
    fetchTrips();
  }, []);

  const handleViewMap = async (driverName: string, trip?: any) => {
    if (trip?.routeCoords && trip.routeCoords.length > 0) {
      const firstPoint = trip.routeCoords[0];
      
      const mapData = {
        routeCoordinates: trip.routeCoords,
        stopPoints: trip.stopPoints || [],
        highRiskZones: trip.highRiskZones || [],
        driverDetails: {
          fullName: driverName,
          tripId: trip.trip_id || trip.id
        }
      };
      setMapData(mapData);
      setMapOpen(true);
    } else {
      alert(`No route data available for this trip`);
    }
  };

  useEffect(() => {
    async function fetchAuditData() {
      try {
        const supabase = createClient()
        const { data: auditTrips, error } = await supabase
          .from('audit')
          .select('*')
          .in('status', ['delivered', 'completed'])
          .order('updated_at', { ascending: false })
        if (error) throw error
        
        const formattedData = (auditTrips || []).map(trip => {
          const clientDetails = typeof trip.clientdetails === 'string' ? JSON.parse(trip.clientdetails) : trip.clientdetails
          const assignments = trip.vehicleassignments || []
          const driver = assignments[0]?.drivers?.[0]
          const vehicle = assignments[0]?.vehicle
          const stopPoints = trip.stop_points || []
          const pickupLocs = trip.pickup_locations || []
          const dropoffLocs = trip.dropoff_locations || []
          
          return {
            id: trip.id,
            tripId: trip.trip_id,
            client: clientDetails?.name || stopPoints[0]?.customer || 'Unknown Client',
            pickup: trip.origin || 'N/A',
            dropOff: trip.destination || stopPoints[0]?.customer || 'N/A',
            totalWeight: trip.cargo_weight || null,
            transporter: 'Dyna',
            driverName: driver?.name || 'Unassigned',
            vehicleReg: vehicle?.name || null,
            timeAccepted: trip.time_accepted ? new Date(trip.time_accepted).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : null,
            timeOnTrip: trip.time_on_trip ? new Date(trip.time_on_trip).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : null,
            timeCompleted: trip.time_completed ? new Date(trip.time_completed).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : null,
            status: trip.status || 'Unknown'
          }
        })
        setAuditData(formattedData)
      } catch (err) {
        console.error('Error fetching audit data:', err)
      } finally {
        setAuditLoading(false)
      }
    }
    
    if (activeTab === 'audit') {
      fetchAuditData()
    }
  }, [activeTab])

  return (
    <>
      <div className="flex-1 space-y-4 p-4 pt-6">
        {/* Top Tabs Navigation */}
        {/* <div className="flex items-center justify-between">
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
              <TabsTrigger
                value="financials"
                className="px-4 py-2 text-sm font-medium rounded-full data-[state=active]:bg-primary data-[state=active]:text-white hover:brightness-95"
              >
                Financials
              </TabsTrigger>
              <TabsTrigger
                value="audit"
                className="px-4 py-2 text-sm font-medium rounded-full data-[state=active]:bg-primary data-[state=active]:text-white hover:brightness-95"
              >
                Audit
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div> */}



        {/* Top Tabs Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v)}
            className="w-full"
          >
            <TabsList className="flex w-fit items-center rounded-lg bg-slate-100 p-1 shadow-sm">
              <TabsTrigger
                value="routing"
                className="px-6 py-2 text-sm font-medium rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                Trip Routing
              </TabsTrigger>
              <TabsTrigger
                value="reports"
                className="px-6 py-2 text-sm font-medium rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                Trip Reports
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
            <RoutingSection 
              userRole={userRole}
              handleViewMap={handleViewMap}
              setCurrentTripForNote={setCurrentTripForNote}
              setNoteText={setNoteText}
              setNoteOpen={setNoteOpen}
              setAvailableDrivers={setAvailableDrivers}
              setCurrentTripForChange={setCurrentTripForChange}
              setChangeDriverOpen={setChangeDriverOpen}
              refreshTrigger={refreshTrigger}
              setRefreshTrigger={setRefreshTrigger}
              setPickupTimeOpen={setPickupTimeOpen}
              setDropoffTimeOpen={setDropoffTimeOpen}
              setCurrentTripForTime={setCurrentTripForTime}
              setTimeType={setTimeType}
              setSelectedTime={setSelectedTime}
              currentUnauthorizedTrip={currentUnauthorizedTrip}
              setCurrentUnauthorizedTrip={setCurrentUnauthorizedTrip}
              setUnauthorizedStopModalOpen={setUnauthorizedStopModalOpen}
              loadingPhotos={loadingPhotos}
              setLoadingPhotos={setLoadingPhotos}
              setCurrentTripPhotos={setCurrentTripPhotos}
              setPhotosModalOpen={setPhotosModalOpen}
              setCurrentTripAlerts={setCurrentTripAlerts}
              setAlertsModalOpen={setAlertsModalOpen}
            />
          </div>
        )}

        {activeTab === "reports" && (
          <TripReportsSection />
        )}

        {activeTab === "financials" && (
          <div className="space-y-4">
            <div className="mb-4">
              <h2 className="text-3xl font-bold tracking-tight">Financials</h2>
              <p className="text-muted-foreground">Track revenue, expenses, and financial performance</p>
            </div>
            <FinancialsPanel />
          </div>
        )}

        {activeTab === "audit" && (
          <div className="space-y-4">
            <div className="mb-4 flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Delivery Audit</h2>
                <p className="text-muted-foreground">Completed trip records and delivery documentation</p>
              </div>
              <Dialog.Root>
                <Dialog.Trigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Summary
                  </Button>
                </Dialog.Trigger>
                <Dialog.Portal>
                  <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
                  <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto z-50">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <Dialog.Title className="text-2xl font-bold">Audit Summary</Dialog.Title>
                        <Dialog.Close asChild>
                          <Button variant="ghost" size="sm">
                            <X className="h-4 w-4" />
                          </Button>
                        </Dialog.Close>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Trips</CardTitle>
                            <Truck className="h-4 w-4 text-muted-foreground" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{auditData.length}</div>
                            <p className="text-xs text-muted-foreground">
                              {auditData.filter(r => r.status?.toLowerCase() === 'delivered').length} delivered
                            </p>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">
                              R{auditData.reduce((sum, record) => {
                                const rate = parseFloat(record.rate?.toString().replace(/[^0-9.-]/g, '') || '0')
                                return sum + rate
                              }, 0).toLocaleString('en-ZA')}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Avg: R{auditData.length > 0 ? (auditData.reduce((sum, record) => {
                                const rate = parseFloat(record.rate?.toString().replace(/[^0-9.-]/g, '') || '0')
                                return sum + rate
                              }, 0) / auditData.length).toLocaleString('en-ZA') : '0'} per trip
                            </p>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Clients Served</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">
                              {new Set(auditData.map(r => r.client)).size}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Unique clients
                            </p>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">
                              {auditData.length > 0 ? Math.round((auditData.filter(r => r.status?.toLowerCase() === 'delivered').length / auditData.length) * 100) : 0}%
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Delivered trips
                            </p>
                          </CardContent>
                        </Card>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Top Clients by Revenue</h3>
                        <div className="space-y-2">
                          {Object.entries(
                            auditData.reduce((acc, record) => {
                              const client = record.client
                              const rate = parseFloat(record.rate?.toString().replace(/[^0-9.-]/g, '') || '0')
                              acc[client] = (acc[client] || 0) + rate
                              return acc
                            }, {})
                          )
                          .sort(([,a], [,b]) => b - a)
                          .slice(0, 5)
                          .map(([client, revenue]) => (
                            <div key={client} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                              <span className="font-medium">{client}</span>
                              <span className="text-green-600 font-semibold">R{revenue.toLocaleString('en-ZA')}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Dialog.Content>
                </Dialog.Portal>
              </Dialog.Root>
            </div>
            <Card className="rounded-lg shadow-sm border">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 border-b-2">
                        <TableHead className="font-semibold text-slate-700">Trip No</TableHead>
                        <TableHead className="font-semibold text-slate-700">Ship-To Party</TableHead>
                        <TableHead className="font-semibold text-slate-700">Location</TableHead>
                        <TableHead className="font-semibold text-slate-700">Total Weight</TableHead>
                        <TableHead className="font-semibold text-slate-700">Transporter</TableHead>
                        <TableHead className="font-semibold text-slate-700">Driver</TableHead>
                        <TableHead className="font-semibold text-slate-700">Vehicle</TableHead>
                        <TableHead className="font-semibold text-slate-700">Time Accepted</TableHead>
                        <TableHead className="font-semibold text-slate-700">Time On Trip</TableHead>
                        <TableHead className="font-semibold text-slate-700">Time Completed</TableHead>
                        <TableHead className="font-semibold text-slate-700">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auditLoading ? (
                        <TableRow>
                          <TableCell colSpan={10} className="text-center py-12">
                            <div className="flex flex-col items-center gap-2">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                              <span className="text-sm text-gray-500">Loading audit records...</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : auditData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={10} className="text-center py-12">
                            <div className="flex flex-col items-center gap-2">
                              <FileText className="w-12 h-12 text-gray-300" />
                              <span className="text-sm font-medium text-gray-500">No completed trips</span>
                              <span className="text-xs text-gray-400">Completed trips will appear here</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : auditData.map((row) => (
                        <TableRow 
                          key={row.id} 
                          className="hover:bg-slate-50 cursor-pointer transition-colors" 
                          onClick={async () => {
                            try {
                              const supabase = createClient()
                              const { data: tripData, error } = await supabase
                                .from('audit')
                                .select('*')
                                .eq('id', row.id)
                                .single()
                              
                              if (error) throw error
                              setSelectedTrip(tripData)
                              setTripDetailsOpen(true)
                            } catch (error) {
                              console.error('Error fetching trip details:', error)
                            }
                          }}
                        >
                          <TableCell className="font-medium text-slate-900">{row.tripId || '-'}</TableCell>
                          <TableCell className="font-medium text-slate-900">{row.client}</TableCell>
                          <TableCell className="text-slate-600">{row.dropOff || row.pickup}</TableCell>
                          <TableCell className="text-slate-600">{row.totalWeight || '-'}</TableCell>
                          <TableCell className="text-slate-600">{row.transporter || 'Dyna'}</TableCell>
                          <TableCell className="text-slate-600">{row.driverName || '-'}</TableCell>
                          <TableCell className="text-slate-600">{row.vehicleReg || '-'}</TableCell>
                          <TableCell className="text-slate-600 text-xs">{row.timeAccepted || '-'}</TableCell>
                          <TableCell className="text-slate-600 text-xs">{row.timeOnTrip || '-'}</TableCell>
                          <TableCell className="text-slate-600 text-xs">{row.timeCompleted || '-'}</TableCell>
                          <TableCell>
                            <span className={cn(
                              "px-2.5 py-1 rounded-md text-xs font-semibold",
                              row.status?.toLowerCase() === "delivered" ? "bg-emerald-100 text-emerald-800" :
                              row.status?.toLowerCase() === "completed" ? "bg-green-100 text-green-800" :
                              "bg-slate-100 text-slate-800"
                            )}>
                              {row.status}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Change Driver Modal */}
      {changeDriverOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Change Driver</h3>
              <Button variant="ghost" size="sm" onClick={() => {
                setChangeDriverOpen(false);
                setDriverSearchTerm('');
              }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Current Trip: {currentTripForChange?.trip_id || currentTripForChange?.id}</p>
                <p className="text-sm text-gray-600 mb-2">Select a new driver:</p>
                <input
                  type="text"
                  placeholder="Search by surname..."
                  value={driverSearchTerm}
                  onChange={(e) => setDriverSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {availableDrivers
                  .filter(driver => 
                    driver.surname?.toLowerCase().includes(driverSearchTerm.toLowerCase()) ||
                    driver.first_name?.toLowerCase().includes(driverSearchTerm.toLowerCase())
                  )
                  .map((driver) => (
                  <div
                    key={driver.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={async () => {
                      if (!confirm(`Assign ${driver.first_name} ${driver.surname} to this trip?`)) return;
                      try {
                        const supabase = createClient();
                        const currentAssignments = currentTripForChange.vehicleassignments || currentTripForChange.vehicle_assignments || [];
                        const updatedAssignments = currentAssignments.map(assignment => ({
                          ...assignment,
                          drivers: [{ id: driver.id, name: `${driver.first_name} ${driver.surname}` }]
                        }));
                        
                        const { error } = await supabase
                          .from('trips')
                          .update({ 
                            vehicleassignments: updatedAssignments,
                            vehicle_assignments: updatedAssignments 
                          })
                          .eq('id', currentTripForChange.id);
                        
                        if (error) throw error;
                        alert('Driver changed successfully');
                        setChangeDriverOpen(false);
                        setRefreshTrigger(prev => prev + 1);
                      } catch (err) {
                        console.error('Failed to change driver:', err);
                        alert('Failed to change driver');
                      }
                    }}
                  >
                    <div>
                      <div className="font-medium">{driver.first_name} {driver.surname}</div>
                      <div className="text-sm text-gray-500">{driver.phone_number}</div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      driver.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {driver.available ? 'Available' : 'Busy'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Time Setting Modal */}
      {(pickupTimeOpen || dropoffTimeOpen) && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">
                Set {timeType === 'pickup' ? 'Pickup' : 'Drop-off'} Time
              </h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setPickupTimeOpen(false);
                  setDropoffTimeOpen(false);
                  setSelectedTime('');
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Trip: {currentTripForTime?.trip_id || currentTripForTime?.id}
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Select {timeType === 'pickup' ? 'pickup' : 'drop-off'} date and time:
                </p>
                <DateTimePicker
                  value={selectedTime}
                  onChange={setSelectedTime}
                  placeholder={`Select ${timeType} time`}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setPickupTimeOpen(false);
                    setDropoffTimeOpen(false);
                    setSelectedTime('');
                  }}
                >
                  Cancel
                </Button>
                {selectedTime && (
                  <Button 
                    variant="destructive" 
                    onClick={async () => {
                      try {
                        const supabase = createClient();
                        const field = timeType === 'pickup' ? 'pickup_locations' : 'dropoff_locations';
                        const locations = currentTripForTime[field] || currentTripForTime[field.replace('_', '')] || [];
                        
                        const updatedLocations = locations.length > 0 
                          ? locations.map((loc, index) => index === 0 ? { ...loc, scheduled_time: null } : loc)
                          : [];
                        
                        const { error } = await supabase
                          .from('trips')
                          .update({ [field]: updatedLocations })
                          .eq('id', currentTripForTime.id);
                        
                        if (error) throw error;
                        
                        alert(`${timeType === 'pickup' ? 'Pickup' : 'Drop-off'} time removed successfully`);
                        setPickupTimeOpen(false);
                        setDropoffTimeOpen(false);
                        setSelectedTime('');
                        setRefreshTrigger(prev => prev + 1);
                      } catch (err) {
                        console.error(`Failed to remove ${timeType} time:`, err);
                        alert(`Failed to remove ${timeType} time`);
                      }
                    }}
                  >
                    Remove
                  </Button>
                )}
                <Button 
                  onClick={async () => {
                    if (!selectedTime) {
                      alert('Please select a time');
                      return;
                    }
                    try {
                      const supabase = createClient();
                      const field = timeType === 'pickup' ? 'pickup_locations' : 'dropoff_locations';
                      const locations = currentTripForTime[field] || currentTripForTime[field.replace('_', '')] || [];
                      
                      const updatedLocations = locations.length > 0 
                        ? locations.map((loc, index) => index === 0 ? { ...loc, scheduled_time: selectedTime } : loc)
                        : [{ scheduled_time: selectedTime }];
                      
                      const { error } = await supabase
                        .from('trips')
                        .update({ [field]: updatedLocations })
                        .eq('id', currentTripForTime.id);
                      
                      if (error) throw error;
                      
                      alert(`${timeType === 'pickup' ? 'Pickup' : 'Drop-off'} time set successfully`);
                      setPickupTimeOpen(false);
                      setDropoffTimeOpen(false);
                      setSelectedTime('');
                      setRefreshTrigger(prev => prev + 1);
                    } catch (err) {
                      console.error(`Failed to set ${timeType} time:`, err);
                      alert(`Failed to set ${timeType} time`);
                    }
                  }}
                >
                  Save Time
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Map Modal */}
      {mapOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-7xl h-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
              <h3 className="text-lg font-semibold">Trip Route Map</h3>
              <Button variant="ghost" size="sm" onClick={() => setMapOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-col lg:flex-row gap-4 p-4 flex-1 min-h-0">
              <div className="w-full lg:w-80 bg-gray-50 p-4 rounded-lg flex-shrink-0 max-h-64 lg:max-h-none overflow-y-auto">
                <h4 className="font-semibold mb-3">Trip Information</h4>
                {mapData?.driverDetails && (
                  <div className="space-y-3 text-sm">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="font-medium text-blue-900">{mapData.driverDetails.fullName || 'Unassigned'}</div>
                    </div>
                    
                    {mapData.stopPoints && mapData.stopPoints.length > 0 && (
                      <div>
                        <h5 className="font-semibold text-gray-700 mb-2">Delivery Stops ({mapData.stopPoints.length})</h5>
                        <div className="space-y-2">
                          {mapData.stopPoints.map((stop, index) => (
                            <div key={index} className="bg-white p-2 rounded border border-gray-200">
                              <div className="flex items-start gap-2">
                                <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                                  {stop.sequence}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-medium text-gray-900 break-words">{stop.name}</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex-1 min-h-0">
                <div 
                  id="driver-map" 
                  className="w-full h-full min-h-[400px] rounded border"
                  ref={(el) => {
                    if (el && mapData) {
                      el.innerHTML = ''
                      
                      const script = document.createElement('script')
                      script.src = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js'
                      script.onload = () => {
                        const link = document.createElement('link')
                        link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css'
                        link.rel = 'stylesheet'
                        document.head.appendChild(link)
                        
                        if (window.mapboxgl) {
                          window.mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
                          
                          const map = new window.mapboxgl.Map({
                            container: el,
                            style: 'mapbox://styles/mapbox/streets-v12',
                            center: [18.4241, -33.9249],
                            zoom: 12
                          })
                          
                          map.on('load', async () => {
                            // Add high risk zones
                            if (mapData.highRiskZones && mapData.highRiskZones.length > 0) {
                              mapData.highRiskZones.forEach((area, index) => {
                                if (!area.polygon || area.polygon.length < 3) return;
                                
                                map.addSource(`risk-zone-${index}`, {
                                  type: 'geojson',
                                  data: {
                                    type: 'Feature',
                                    properties: { name: area.name },
                                    geometry: {
                                      type: 'Polygon',
                                      coordinates: [area.polygon]
                                    }
                                  }
                                });
                                
                                map.addLayer({
                                  id: `risk-zone-${index}-fill`,
                                  type: 'fill',
                                  source: `risk-zone-${index}`,
                                  paint: {
                                    'fill-color': '#ef4444',
                                    'fill-opacity': 0.3
                                  }
                                });
                                
                                map.addLayer({
                                  id: `risk-zone-${index}-border`,
                                  type: 'line',
                                  source: `risk-zone-${index}`,
                                  paint: {
                                    'line-color': '#dc2626',
                                    'line-width': 2
                                  }
                                });
                              });
                            }

                            // Add route line from route_points
                            if (mapData.routeCoordinates && mapData.routeCoordinates.length > 0) {
                              map.addSource('route-line', {
                                type: 'geojson',
                                data: {
                                  type: 'Feature',
                                  properties: {},
                                  geometry: {
                                    type: 'LineString',
                                    coordinates: mapData.routeCoordinates
                                  }
                                }
                              });
                              
                              map.addLayer({
                                id: 'route-line',
                                type: 'line',
                                source: 'route-line',
                                layout: { 'line-join': 'round', 'line-cap': 'round' },
                                paint: { 
                                  'line-color': '#3b82f6', 
                                  'line-width': 4
                                }
                              });
                              
                              // Start marker
                              const startEl = document.createElement('div');
                              startEl.innerHTML = '🚩';
                              startEl.style.fontSize = '28px';
                              new window.mapboxgl.Marker(startEl)
                                .setLngLat(mapData.routeCoordinates[0])
                                .addTo(map);
                              
                              // End marker
                              const endEl = document.createElement('div');
                              endEl.innerHTML = '🏁';
                              endEl.style.fontSize = '28px';
                              new window.mapboxgl.Marker(endEl)
                                .setLngLat(mapData.routeCoordinates[mapData.routeCoordinates.length - 1])
                                .addTo(map);
                            }
                            
                            // Add stop points with sequence numbers
                            if (mapData.stopPoints && mapData.stopPoints.length > 0) {
                              mapData.stopPoints.forEach((stop) => {
                                const stopEl = document.createElement('div');
                                stopEl.style.width = '32px';
                                stopEl.style.height = '32px';
                                stopEl.style.backgroundColor = '#f97316';
                                stopEl.style.color = 'white';
                                stopEl.style.borderRadius = '50%';
                                stopEl.style.display = 'flex';
                                stopEl.style.alignItems = 'center';
                                stopEl.style.justifyContent = 'center';
                                stopEl.style.fontWeight = 'bold';
                                stopEl.style.fontSize = '14px';
                                stopEl.style.border = '3px solid white';
                                stopEl.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
                                stopEl.innerHTML = stop.sequence;
                                
                                const marker = new window.mapboxgl.Marker(stopEl)
                                  .setLngLat(stop.coordinates)
                                  .addTo(map);
                                
                                const popup = new window.mapboxgl.Popup({ offset: 25 })
                                  .setHTML(`<div class="p-2"><strong>Stop ${stop.sequence}</strong><br/>${stop.name}</div>`);
                                marker.setPopup(popup);
                              });
                            }
                            
                            // Fit map to show all elements
                            const bounds = new window.mapboxgl.LngLatBounds();
                            if (mapData.routeCoordinates) {
                              mapData.routeCoordinates.forEach(coord => bounds.extend(coord));
                            }
                            if (mapData.stopPoints) {
                              mapData.stopPoints.forEach(stop => bounds.extend(stop.coordinates));
                            }
                            if (mapData.highRiskZones) {
                              mapData.highRiskZones.forEach(zone => {
                                if (zone.polygon) zone.polygon.forEach(coord => bounds.extend(coord));
                              });
                            }
                            map.fitBounds(bounds, { padding: 50 });
                          })
                        }
                      }
                      
                      if (!document.querySelector('script[src*="mapbox-gl.js"]')) {
                        document.head.appendChild(script)
                      } else if (window.mapboxgl) {
                        script.onload()
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trip Details Modal */}
      {tripDetailsOpen && selectedTrip && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
              <h3 className="text-lg font-semibold">Trip Summary - {selectedTrip.trip_id}</h3>
              <Button variant="ghost" size="sm" onClick={() => {
                setTripDetailsOpen(false)
                setSelectedTrip(null)
              }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Trip Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Order #:</span>
                      <span className="font-medium">{selectedTrip.ordernumber || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Status:</span>
                      <Badge variant={selectedTrip.status === 'delivered' ? 'default' : 'secondary'}>
                        {selectedTrip.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Distance:</span>
                      <span className="font-medium">{selectedTrip.actual_distance?.toFixed(1) || 'N/A'} km</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Financial</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Rate:</span>
                      <span className="font-medium text-green-600">
                        {selectedTrip.rate ? `R${parseFloat(selectedTrip.rate).toLocaleString('en-ZA')}` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Cost:</span>
                      <span className="font-medium text-green-600">
                        R{selectedTrip.actual_total_cost?.toLocaleString('en-ZA', { minimumFractionDigits: 2 }) || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Fuel Price:</span>
                      <span className="font-medium">R{selectedTrip.fuel_price_used || 'N/A'}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Vehicle & Driver</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Vehicle Type:</span>
                      <span className="font-medium">{selectedTrip.vehicle_type || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Updated:</span>
                      <span className="font-medium">
                        {selectedTrip.updated_at ? new Date(selectedTrip.updated_at).toLocaleDateString('en-ZA') : 'N/A'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Route Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-gray-600">Origin</h4>
                      <p className="text-sm bg-green-50 p-2 rounded border-l-2 border-green-500">
                        {selectedTrip.origin || 'N/A'}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-gray-600">Destination</h4>
                      <p className="text-sm bg-red-50 p-2 rounded border-l-2 border-red-500">
                        {selectedTrip.destination || 'N/A'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Client Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Client:</span>
                      <p className="text-sm font-medium">{selectedTrip.selectedclient || selectedTrip.selected_client || 'N/A'}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Cargo Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Cargo Type:</span>
                      <p className="text-sm font-medium">{selectedTrip.cargo || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Weight:</span>
                      <p className="text-sm font-medium">{selectedTrip.cargo_weight || selectedTrip.cargoweight || 'N/A'}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {selectedTrip.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle>Trip Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm bg-blue-50 p-3 rounded">{selectedTrip.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Unauthorized Stop Note Modal */}
      {unauthorizedStopModalOpen && currentUnauthorizedTrip && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-red-800">Unauthorized Stop Detected</h3>
              <Button variant="ghost" size="sm" onClick={() => {
                setUnauthorizedStopModalOpen(false)
                setCurrentUnauthorizedTrip(null)
                setUnauthorizedStopNote('')
              }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4 space-y-4">
              <div className="bg-red-50 p-3 rounded border-l-4 border-red-500">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span className="font-medium text-red-800">Trip #{currentUnauthorizedTrip.trip_id || currentUnauthorizedTrip.id}</span>
                </div>
                <p className="text-sm text-red-700">
                  {currentUnauthorizedTrip.unauthorized_stops_count} unauthorized stop{currentUnauthorizedTrip.unauthorized_stops_count > 1 ? 's' : ''} detected
                </p>
                {(() => {
                  const routePoints = currentUnauthorizedTrip.route_points || []
                  const lastPoint = routePoints[routePoints.length - 1]
                  return lastPoint && (
                    <div className="mt-2 text-xs text-red-600">
                      <div>Last Location: {lastPoint.lat?.toFixed(6)}, {lastPoint.lng?.toFixed(6)}</div>
                      <div>Time: {new Date(lastPoint.datetime).toLocaleString()}</div>
                      <div>Speed: {lastPoint.speed} km/h</div>
                    </div>
                  )
                })()}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Note for Unauthorized Stop:
                </label>
                <textarea
                  value={unauthorizedStopNote}
                  onChange={(e) => setUnauthorizedStopNote(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows={3}
                  placeholder="Enter details about the unauthorized stop..."
                />
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button 
                  variant="outline" 
                  onClick={async () => {
                    try {
                      const supabase = createClient()
                      // Clear unauthorized stops count when dismissing
                      const { error } = await supabase
                        .from('trips')
                        .update({ unauthorized_stops_count: 0 })
                        .eq('id', currentUnauthorizedTrip.id)
                      
                      if (error) throw error
                      
                      setUnauthorizedStopModalOpen(false)
                      setCurrentUnauthorizedTrip(null)
                      setUnauthorizedStopNote('')
                      setRefreshTrigger(prev => prev + 1)
                    } catch (err) {
                      console.error('Failed to dismiss alert:', err)
                      alert('Failed to dismiss alert')
                    }
                  }}
                >
                  Dismiss
                </Button>
                <Button 
                  onClick={async () => {
                    try {
                      const supabase = createClient()
                      const noteToAdd = `[UNAUTHORIZED STOP] ${new Date().toLocaleString()}: ${unauthorizedStopNote}`
                      const existingNotes = currentUnauthorizedTrip.status_notes || ''
                      const updatedNotes = existingNotes ? `${existingNotes}\n${noteToAdd}` : noteToAdd
                      
                      // Clear unauthorized stops count when adding note
                      const { error } = await supabase
                        .from('trips')
                        .update({ 
                          status_notes: updatedNotes,
                          unauthorized_stops_count: 0
                        })
                        .eq('id', currentUnauthorizedTrip.id)
                      
                      if (error) throw error
                      
                      setUnauthorizedStopModalOpen(false)
                      setCurrentUnauthorizedTrip(null)
                      setUnauthorizedStopNote('')
                      setRefreshTrigger(prev => prev + 1)
                    } catch (err) {
                      console.error('Failed to add note:', err)
                      alert('Failed to add note')
                    }
                  }}
                >
                  Add Note
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Photos Modal */}
      {photosModalOpen && currentTripPhotos && (
        <div className="fixed inset-0 bg-gray-900/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <div className="bg-gray-50 border-b px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Loading Documentation</h2>
                  <p className="text-sm text-gray-600">Trip #{currentTripPhotos.tripId}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => {
                  setPhotosModalOpen(false);
                  setCurrentTripPhotos(null);
                }}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="overflow-y-auto max-h-[calc(90vh-80px)] bg-gray-50">
              {(currentTripPhotos.before.length > 0 || currentTripPhotos.during.length > 0) ? (
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="p-6 border-r border-gray-200">
                    <div className="mb-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-1">Before Loading</h3>
                      <p className="text-sm text-gray-500">{currentTripPhotos.before.length} photos</p>
                    </div>
                    {currentTripPhotos.before.length > 0 ? (
                      <div className="grid grid-cols-2 gap-4">
                        {currentTripPhotos.before.map((photo, index) => (
                          <div key={index} className="group cursor-pointer" onClick={() => window.open(photo.url, '_blank')}>
                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                              <img 
                                src={photo.url} 
                                alt={`Before ${index + 1}`}
                                className="w-full h-32 object-cover"
                              />
                              <div className="p-3">
                                <p className="text-xs text-gray-600 truncate">{photo.name}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p className="text-sm">No photos available</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <div className="mb-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-1">During Loading</h3>
                      <p className="text-sm text-gray-500">{currentTripPhotos.during.length} photos</p>
                    </div>
                    {currentTripPhotos.during.length > 0 ? (
                      <div className="grid grid-cols-2 gap-4">
                        {currentTripPhotos.during.map((photo, index) => (
                          <div key={index} className="group cursor-pointer" onClick={() => window.open(photo.url, '_blank')}>
                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                              <img 
                                src={photo.url} 
                                alt={`During ${index + 1}`}
                                className="w-full h-32 object-cover"
                              />
                              <div className="p-3">
                                <p className="text-xs text-gray-600 truncate">{photo.name}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p className="text-sm">No photos available</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="text-gray-400 mb-4">
                    <FileText className="w-12 h-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Photos Available</h3>
                  <p className="text-gray-500">No loading documentation found for this trip.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Alerts Modal */}
      {alertsModalOpen && currentTripAlerts && (
        <div className="fixed inset-0 bg-gray-900/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="bg-gray-50 border-b px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Trip Alerts</h2>
                  <p className="text-sm text-gray-600">Trip #{currentTripAlerts.tripId}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => {
                  setAlertsModalOpen(false);
                  setCurrentTripAlerts(null);
                }}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
              {currentTripAlerts.alerts && currentTripAlerts.alerts.length > 0 ? (
                <div className="space-y-4">
                  {currentTripAlerts.alerts.map((alert, index) => (
                    <div key={index} className="border border-red-200 rounded-lg p-4 bg-red-50">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          {typeof alert === 'object' ? (
                            <>
                              {alert.type && (
                                <div className="text-sm font-semibold text-red-800 uppercase mb-1">
                                  {alert.type.replace('_', ' ')}
                                </div>
                              )}
                              {alert.message && (
                                <div className="text-sm text-red-700 mb-2">
                                  {alert.message}
                                </div>
                              )}
                              {alert.timestamp && (
                                <div className="text-xs text-red-600">
                                  {new Date(alert.timestamp).toLocaleString()}
                                </div>
                              )}
                              {alert.location && (
                                <div className="text-xs text-red-600 mt-1">
                                  Location: {alert.location.lat?.toFixed(6)}, {alert.location.lng?.toFixed(6)}
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="text-sm text-red-700">
                              {alert}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="text-gray-400 mb-4">
                    <AlertTriangle className="w-12 h-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Alerts</h3>
                  <p className="text-gray-500">No alerts found for this trip.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}