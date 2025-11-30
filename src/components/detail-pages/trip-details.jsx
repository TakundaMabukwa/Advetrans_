'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

// context
import { useGlobalContext } from '@/context/global-context/context'

// hooks
import { useToast } from '@/hooks/use-toast'
import { format, parseISO } from 'date-fns'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  Clipboard,
  FileText,
  MapPin,
  Package,
  Truck,
  User,
  DollarSign,
  MoreVertical,
  PlusCircle,
  RefreshCw,
  Edit,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import DetailActionBar from '@/components/layout/detail-action-bar'
import { ProgressWithWaypoints } from '@/components/ui/progress-with-waypoints'
import DetailCard from '../ui/detail-card'
import { Separator } from '../ui/separator'
import DisplayMap from '../map/display-map'

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  try {
    return format(new Date(dateString), 'MMM d, yyyy')
  } catch (error) {
    return dateString
  }
}

// Helper function to format datetime
const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return 'N/A'
  try {
    return format(parseISO(dateTimeString), 'MMM d, yyyy h:mm a')
  } catch (error) {
    return dateTimeString
  }
}

// Status badge component
const StatusBadge = ({ status }) => {
  // Safety check for undefined or null status
  if (!status) {
    return (
      <Badge variant="secondary">
        <Clipboard className="h-3.5 w-3.5 mr-1" />
        Unknown
      </Badge>
    )
  }

  const getStatusProps = () => {
    switch (status) {
      case 'completed':
        return {
          variant: 'outline',
          className:
            'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200',
          icon: <CheckCircle className="h-3.5 w-3.5 mr-1" />,
        }
      case 'in-progress':
        return {
          className: 'bg-blue-500 hover:bg-blue-600',
          icon: <RefreshCw className="h-3.5 w-3.5 mr-1 animate-spin" />,
        }
      case 'pending':
        return {
          variant: 'outline',
          className:
            'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900 dark:text-amber-200',
          icon: <Clock className="h-3.5 w-3.5 mr-1" />,
        }
      case 'cancelled':
        return {
          variant: 'destructive',
          icon: <AlertCircle className="h-3.5 w-3.5 mr-1" />,
        }
      default:
        return {
          variant: 'secondary',
          icon: <Clipboard className="h-3.5 w-3.5 mr-1" />,
        }
    }
  }

  const { variant, className, icon } = getStatusProps()

  return (
    <Badge variant={variant} className={className}>
      {icon}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}

// Helper to parse JSON fields safely
const parseJsonField = (field, fallback = undefined) => {
  if (!field) return fallback
  if (typeof field === 'string') {
    try {
      return JSON.parse(field)
    } catch {
      return fallback
    }
  }
  return field
}

// Helper to display any value safely
const displayValue = (val) => {
  if (val === null || val === undefined) return 'N/A'
  if (typeof val === 'object') {
    // If it's an array of objects with name, join names
    if (
      Array.isArray(val) &&
      val.length &&
      typeof val[0] === 'object' &&
      val[0].name
    ) {
      return val.map((v) => v.name).join(', ')
    }
    // If it's an object with name
    if (val.name) return val.name
    // Otherwise, show JSON
    return JSON.stringify(val)
  }
  return String(val)
}

// Helper to display pickup/dropoff locations as addresses
const displayLocationsAddresses = (locations) => {
  if (!locations || !Array.isArray(locations) || locations.length === 0) return "N/A";
  return (
    <ul className="list-disc pl-4 space-y-1">
      {locations.map((loc, idx) => (
        <li key={idx} className="text-sm text-blue-900 font-medium">
          {loc.address || loc.location || "Unknown Address"}
        </li>
      ))}
    </ul>
  );
};

// Helper to display cost centre as name if object
const displayCostCentre = (val) => {
  if (!val) return "N/A";
  if (typeof val === "object" && val.name) return val.name;
  try {
    // If it's a JSON string, parse and get name
    const parsed = typeof val === "string" ? JSON.parse(val) : val;
    if (parsed && parsed.name) return parsed.name;
  } catch { }
  return String(val);
};

export default function TripDetails({ id }) {
  const router = useRouter()
  const { toast } = useToast()
  const { trips, tripsDispatch } = useGlobalContext()

  // Try to find trip in context
  const [trip, setTrip] = useState(() => trips?.data?.find((t) => t.id === id))
  const [loading, setLoading] = useState(!trip)

  // Status update state
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [statusUpdate, setStatusUpdate] = useState({
    status: trip?.status || 'pending',
    statusNotes: trip?.statusNotes || '',
  })
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [locations, setLocations] = useState([])

  const handleGoBack = () => {
    router.back()
  }

  // Fetch trip data from Supabase if not found in context
  useEffect(() => {
    if (!trip && id) {
      setLoading(true)
      // Dynamically import supabase client for client-side usage
      import('@/lib/supabase/client')
        .then(({ createClient }) => {
          const supabase = createClient()
          supabase
            .from('trips')
            .select('*')
            .eq('id', id)
            .single()
            .then(({ data, error }) => {
              if (error || !data) {
                toast({
                  title: 'Error',
                  description: 'Could not load trip details.',
                  variant: 'destructive',
                })
              } else {
                setTrip(data)
              }
            })
            .finally(() => setLoading(false))
        })
        .catch(() => {
          toast({
            title: 'Error',
            description: 'Could not load trip details.',
            variant: 'destructive',
          })
          setLoading(false)
        })
    }
  }, [id, trip, toast])

  // Update statusUpdate state when trip changes
  useEffect(() => {
    setStatusUpdate({
      status: trip?.status || 'pending',
      statusNotes: trip?.statusNotes || '',
    })
  }, [trip])

  // Handle status update
  const handleStatusUpdate = async () => {
    if (!trip) return

    setUpdatingStatus(true)
    try {
      const response = await fetch(`/api/trips/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('firebaseIdToken')}`,
        },
        body: JSON.stringify(statusUpdate),
      })

      if (response.ok) {
        toast({
          title: 'Status Updated',
          description: `Trip status has been updated to ${statusUpdate.status}`,
        })
        setStatusDialogOpen(false)

        // Refresh trip data
        // You might want to dispatch an action to refresh the trip data
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.message || 'Failed to update status',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update trip status',
        variant: 'destructive',
      })
    } finally {
      setUpdatingStatus(false)
    }
  }

  // Check if status can be updated (not in progress from other places)
  const canUpdateStatus = () => {
    // If trip is in progress, only allow updates from the trip form
    // For now, we'll allow updates from the detail page
    return true
  }

  // Define the ordered statuses for progress
  const TRIP_STATUSES = [
    'pending',           // In queue
    'loading',           // Loading
    'leaving-depot',     // Leaving depot
    'on-trip',           // En-route to delivery
    'on-route-to-fuchs', // On-route to Fuchs
    'unloading',         // Unloading
    'back-at-depot',     // Back at depot
    'fuelling',          // Fuelling
    'service',           // Service
    'maintenance',       // Maintenance
    'completed',         // Completed
  ]

  // Calculate progress based on status
  const calculateProgress = () => {
    if (!trip?.status) return 0
    const idx = TRIP_STATUSES.indexOf(trip.status)
    if (idx === -1) return 0
    return Math.round((idx / (TRIP_STATUSES.length - 1)) * 100)
  }

  // Calculate total expenses
  const calculateTotalExpenses = () => {
    if (!trip?.expenses || trip?.expenses.length === 0) return 'R 0'

    const total = trip?.expenses.reduce((sum, expense) => {
      const amount = Number.parseFloat(expense.amount.replace(/[^0-9.]/g, ''))
      return sum + (isNaN(amount) ? 0 : amount)
    }, 0)

    return `R ${total.toLocaleString()}`
  }

  // Parse all relevant fields for display
  const parsedTrip = trip
    ? {
      ...trip,
      vehicleAssignments:
        parseJsonField(trip.vehicleAssignments) ||
        parseJsonField(trip.vehicle_assignments) ||
        [],
      clientDetails:
        parseJsonField(trip.clientDetails) ||
        parseJsonField(trip.client_details) ||
        {},
      pickupLocations:
        parseJsonField(trip.pickupLocations) ||
        parseJsonField(trip.pickup_locations) ||
        [],
      dropoffLocations:
        parseJsonField(trip.dropoffLocations) ||
        parseJsonField(trip.dropoff_locations) ||
        [],
      waypoints: parseJsonField(trip.waypoints) || [],
      selectedStopPoints:
        parseJsonField(trip.selectedStopPoints) ||
        parseJsonField(trip.selected_stop_points) ||
        [],
      stopPoints:
        parseJsonField(trip.stopPoints) ||
        parseJsonField(trip.stop_points) ||
        [],
      drivers: parseJsonField(trip.drivers) || [],
      vehicles: parseJsonField(trip.vehicles) || [],
      costCentre:
        parseJsonField(trip.costCentre) ||
        parseJsonField(trip.cost_centre) ||
        trip.costCentre ||
        trip.cost_centre,
    }
    : null

  const trip_information = [
    { label: 'Start Date', value: formatDate(parsedTrip?.startDate) },
    { label: 'End Date', value: formatDate(parsedTrip?.endDate) },
    { label: 'Origin', value: parsedTrip?.origin || 'N/A' },
    { label: 'Destination', value: parsedTrip?.destination || 'N/A' },
    { label: 'Cost Centre', value: displayCostCentre(parsedTrip?.costCentre) },
    { label: 'Cargo', value: parsedTrip?.cargo || 'N/A' },
    { label: 'Cargo Weight', value: parsedTrip?.cargoWeight || parsedTrip?.cargo_weight || 'N/A' },
    { label: 'Pickup Locations', value: displayLocationsAddresses(parsedTrip?.pickupLocations) },
    { label: 'Dropoff Locations', value: displayLocationsAddresses(parsedTrip?.dropoffLocations) },
    { label: 'Waypoints', value: displayValue(parsedTrip?.waypoints) },
    { label: 'Notes', value: parsedTrip?.notes || 'N/A' },
  ]
  const client_information = [
    { label: 'Client', value: parsedTrip?.clientDetails?.name || 'N/A' },
    { label: 'Contact Person', value: parsedTrip?.clientDetails?.contactPerson || 'N/A' },
    { label: 'Email', value: parsedTrip?.clientDetails?.email || 'N/A' },
    { label: 'Phone', value: parsedTrip?.clientDetails?.phone || 'N/A' },
    { label: 'Address', value: parsedTrip?.clientDetails?.address || 'N/A' },
  ]
  const financial_summary = [
    { label: 'Fuel Used', value: parsedTrip?.fuelUsed || 'N/A' },
    { label: 'Total Expenses', value: calculateTotalExpenses() },
  ]

  // useEffect(() => {
  //   // If trip is not found, redirect to trips list
  //   if (!trip) {
  //     return []
  //   }

  //   // Extract pickup and dropoff locations
  //   const pickupLocations =
  //     trip.pickupLocations?.map((location) => ({
  //       label: location.address,
  //       value: location.address,
  //     })) || []
  //   const dropoffLocations =
  //     trip.dropoffLocations?.map((location) => ({
  //       label: location.address,
  //       value: location.address,
  //     })) || []
  //   setLocations([...pickupLocations, ...dropoffLocations])
  // }, [trip])

  console.log('locations :>> ', locations)

  // If loading, show skeleton or loading state
  if (loading) {
    return (
      <div className="p-8">
        <Skeleton className="h-8 w-1/3 mb-4" />
        <Skeleton className="h-64 w-full mb-4" />
        <Skeleton className="h-32 w-full mb-4" />
      </div>
    )
  }

  // If trip still not found, show not found message
  if (!trip) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Trip not found.
      </div>
    )
  }

  return (
    <div className=" space-y-6">
      {/* Header */}
      <DetailActionBar
        id={id}
        title={parsedTrip?.clientDetails?.name}
        description={id}
      />

      {/* Trip Progress */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Trip Progress</CardTitle>
            <div className="flex items-center gap-2">
              <StatusBadge status={trip?.status} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <ProgressWithWaypoints
              value={calculateProgress()}
              waypoints={[
                { position: 0, label: 'In queue' },
                { position: 10, label: 'Loading' },
                { position: 20, label: 'Leaving depot' },
                { position: 30, label: 'En-route to delivery' },
                { position: 40, label: 'On-route to Fuchs' },
                { position: 50, label: 'Unloading' },
                { position: 60, label: 'Back at depot' },
                { position: 70, label: 'Fuelling' },
                { position: 80, label: 'Service' },
                { position: 90, label: 'Maintenance' },
                { position: 100, label: 'Completed' },
              ]}
              showLabels={true}
              className="w-full"
            />
            
            {/* Stops Section - Always show for debugging */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Trip Stops</h4>
              <div className="flex flex-wrap gap-2">
                {parsedTrip?.selectedStopPoints && parsedTrip.selectedStopPoints.length > 0 ? (
                  parsedTrip.selectedStopPoints.map((stop, index) => (
                    <div key={index} className="group relative inline-block">
                      <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium cursor-pointer hover:bg-blue-200 transition-colors">
                        Stop {index + 1}
                      </div>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        {stop.name || stop.address || (stop.lat && stop.lng ? `${stop.lat.toFixed(4)}, ${stop.lng.toFixed(4)}` : `Stop ${index + 1}`)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-600">No stops configured for this trip</div>
                )}
              </div>
            </div>

            <div className="flex justify-between text-xs text-muted-foreground mt-5">
              <span>Origin: {trip?.origin}</span>
              <span>Destination: {trip?.destination}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <DetailCard
          title={`Trip Information`}
          description={'DInformation about this trip'}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trip_information.map((info) => (
              <div key={info.label}>
                <dt className="text-sm font-medium text-gray-500">
                  {info.label}
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {/* Only render as React node for pickup/dropoff, else as string */}
                  {(info.label === "Pickup Locations" || info.label === "Dropoff Locations")
                    ? info.value
                    : displayValue(info.value)}
                </dd>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          <div className="mb-4">
            <label className="text-sm font-medium text-gray-500">
              Client Information
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {client_information.map((info) => (
              <div key={info.label}>
                <dt className="text-sm font-medium text-gray-500">
                  {info.label}
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{info.value}</dd>
              </div>
            ))}
          </div>
        </DetailCard>
        <DetailCard
          title={`Trip Overview`}
          description={'Map view of this trip'}
        >
          <div className=" h-[250] rounded-lg bg-gray-100 flex items-center justify-center">
            <DisplayMap address={locations} tripId={trip?.trip_id} />
          </div>

          <Separator className="my-4" />

          <div className="mb-4">
            <label className="text-sm font-medium text-gray-500">
              Financial Summary
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {financial_summary.map((info) => (
              <div key={info.label}>
                <dt className="text-sm font-medium text-gray-500">
                  {info.label}
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{displayValue(info.value)}</dd>
              </div>
            ))}
          </div>
        </DetailCard>
      </div>

      {/* Vehicle Assignments */}
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Assignments</CardTitle>
          <CardDescription>
            Vehicles, drivers, and trailers assigned to this trip
          </CardDescription>
        </CardHeader>
        <CardContent>
          {parsedTrip?.vehicleAssignments && parsedTrip?.vehicleAssignments.length > 0 ? (
            <div className="space-y-4">
              {parsedTrip.vehicleAssignments.map((assignment, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-medium text-sm text-gray-500">
                        Vehicle
                      </h4>
                      <p className="text-sm">
                        {displayValue(assignment.vehicle)}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-gray-500">
                        Drivers
                      </h4>
                      <p className="text-sm">
                        {displayValue(assignment.drivers)}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-gray-500">
                        Trailers
                      </h4>
                      <p className="text-sm">
                        {displayValue(assignment.trailers) || 'None'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No vehicle assignments have been made for this trip.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs for Waypoints, Expenses, Notes */}
      <Tabs defaultValue="waypoints" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="waypoints">Waypoints</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="notes">Notes & Documents</TabsTrigger>
        </TabsList>

        {/* Waypoints Tab */}
        <TabsContent value="waypoints" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>Trip Waypoints</CardTitle>
                <Button variant="outline" size="sm">
                  <PlusCircle className="h-4 w-4 mr-2" /> Add Waypoint
                </Button>
              </div>
              <CardDescription>
                Scheduled stops and checkpoints for this trip
              </CardDescription>
            </CardHeader>
            <CardContent>
              {trip?.waypoints && trip?.waypoints.length > 0 ? (
                <div className="relative">
                  {/* Timeline */}
                  <div className="absolute left-0 top-0 bottom-0 w-px bg-border ml-6"></div>

                  {/* Waypoints */}
                  <div className="space-y-8 relative">
                    {/* Origin */}
                    <div className="flex gap-4 items-start">
                      <div className="w-3 h-3 rounded-full bg-primary mt-1.5 z-10"></div>
                      <div className="flex-1">
                        <div className="font-medium">{trip?.origin}</div>
                        <div className="text-sm text-muted-foreground">
                          Departure: {formatDate(trip?.startDate)}
                        </div>
                      </div>
                    </div>

                    {/* Waypoints */}
                    {trip?.waypoints.map((waypoint, index) => (
                      <div key={index} className="flex gap-4 items-start">
                        <div className="w-3 h-3 rounded-full bg-primary mt-1.5 z-10"></div>
                        <div className="flex-1">
                          <div className="font-medium">{waypoint.location}</div>
                          <div className="text-sm text-muted-foreground">
                            Arrival: {formatDateTime(waypoint.arrivalTime)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Departure: {formatDateTime(waypoint.departureTime)}
                          </div>
                          {waypoint.notes && (
                            <div className="text-sm mt-1 p-2 bg-muted rounded-md">
                              {waypoint.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Destination */}
                    <div className="flex gap-4 items-start">
                      <div className="w-3 h-3 rounded-full bg-primary mt-1.5 z-10"></div>
                      <div className="flex-1">
                        <div className="font-medium">{trip?.destination}</div>
                        <div className="text-sm text-muted-foreground">
                          Arrival:{' '}
                          {trip?.endDate
                            ? formatDate(trip?.endDate)
                            : 'Expected arrival date not set'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No waypoints have been added to this trip.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>Trip Expenses</CardTitle>
                <Button variant="outline" size="sm">
                  <PlusCircle className="h-4 w-4 mr-2" /> Add Expense
                </Button>
              </div>
              <CardDescription>
                Financial records and expenses for this trip
              </CardDescription>
            </CardHeader>
            <CardContent>
              {trip?.expenses && trip?.expenses.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trip?.expenses.map((expense, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium capitalize">
                          {expense.type}
                        </TableCell>
                        <TableCell>{expense.amount}</TableCell>
                        <TableCell>{formatDate(expense.date)}</TableCell>
                        <TableCell>{expense.notes}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No expenses have been recorded for this trip.
                </div>
              )}
            </CardContent>
            {trip?.expenses && trip?.expenses.length > 0 && (
              <CardFooter className="flex justify-between border-t px-6 py-4">
                <div className="font-medium">Total</div>
                <div className="font-bold">{calculateTotalExpenses()}</div>
              </CardFooter>
            )}
          </Card>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Trip Notes</CardTitle>
              <CardDescription>
                Additional information and documentation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-md">
                  <h3 className="font-medium mb-2">Trip Notes</h3>
                  <p className="text-sm text-muted-foreground">
                    {trip?.notes || 'No notes have been added for this trip.'}
                  </p>
                </div>

                <div className="p-4 border rounded-md">
                  <h3 className="font-medium mb-2">Documents</h3>
                  <p className="text-sm text-muted-foreground">
                    No documents have been attached to this trip.
                  </p>
                  <Button variant="outline" size="sm" className="mt-2">
                    <PlusCircle className="h-4 w-4 mr-2" /> Attach Document
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

