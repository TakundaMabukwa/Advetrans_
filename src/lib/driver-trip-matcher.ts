import { createClient } from '@/lib/supabase/client'

export interface DriverTripMatch {
  tripId: string
  ordernumber: string
  status: string
  origin: string
  destination: string
  startdate: string
}

export async function findActiveTripsForDriver(driverPlate: string): Promise<DriverTripMatch[]> {
  const supabase = createClient()
  
  try {
    // Get all active trips
    const { data: trips, error } = await supabase
      .from('trips')
      .select('id, trip_id, ordernumber, status, origin, destination, startdate, vehicle_assignments, vehicleassignments')
      .in('status', ['pending', 'in-progress', 'loading', 'on-trip'])
      .order('created_at', { ascending: false })

    if (error) throw error

    const matchedTrips: DriverTripMatch[] = []

    for (const trip of trips || []) {
      // Check both possible field names for vehicle assignments
      const assignments = trip.vehicle_assignments || trip.vehicleassignments || []
      
      // Look for driver's plate in vehicle assignments
      const hasMatch = assignments.some((assignment: any) => {
        if (!assignment.vehicle) return false
        
        const vehicle = assignment.vehicle
        return (
          vehicle.plate === driverPlate ||
          vehicle.id === driverPlate ||
          vehicle.name?.includes(driverPlate) ||
          vehicle.registration === driverPlate
        )
      })

      if (hasMatch) {
        matchedTrips.push({
          tripId: trip.trip_id || trip.id,
          ordernumber: trip.ordernumber,
          status: trip.status,
          origin: trip.origin || 'Unknown',
          destination: trip.destination || 'Unknown',
          startdate: trip.startdate
        })
      }
    }

    return matchedTrips
  } catch (error) {
    console.error('Error finding trips for driver:', error)
    return []
  }
}

export async function getRouteForTrip(ordernumber: string) {
  const supabase = createClient()
  
  try {
    const { data: route, error } = await supabase
      .from('routes')
      .select('route_geometry, route_data, distance_km, duration_minutes')
      .eq('order_number', ordernumber)
      .single()

    if (error || !route) return null

    // Extract coordinates from route geometry
    if (route.route_geometry?.coordinates) {
      return {
        coordinates: route.route_geometry.coordinates,
        distance: route.distance_km,
        duration: route.duration_minutes,
        routeData: route.route_data
      }
    }

    return null
  } catch (error) {
    console.error('Error fetching route:', error)
    return null
  }
}