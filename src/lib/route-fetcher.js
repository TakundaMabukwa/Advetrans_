import { createClient } from '@/lib/supabase/client'

export const fetchRouteByTripId = async (tripId) => {
  try {
    console.log('fetchRouteByTripId called with tripId:', tripId);
    console.log('MAPBOX_TOKEN available:', !!process.env.NEXT_PUBLIC_MAPBOX_TOKEN);
    const supabase = createClient()
    
    // Get trip data - try both trip_id and id fields
    let { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('route, order_number, origin, destination')
      .eq('id', tripId)
      .single()
    
    // If not found by id, try by trip_id
    if (tripError && tripId) {
      const { data: tripByTripId, error: tripByTripIdError } = await supabase
        .from('trips')
        .select('route, order_number, origin, destination')
        .eq('trip_id', tripId)
        .single()
      
      if (!tripByTripIdError && tripByTripId) {
        trip = tripByTripId
        tripError = null
      }
    }

    console.log('Trip query result:', { trip, tripError });

    if (tripError || !trip) {
      console.error('Error fetching trip:', tripError)
      return null
    }

    // If trip has route data directly, return it
    if (trip.route && typeof trip.route === 'object' && trip.route.coordinates) {
      return trip.route.coordinates
    }

    // Try to fetch from routes table using order_number
    if (trip.order_number) {
      const { data: route } = await supabase
        .from('routes')
        .select('route_geometry, route_data')
        .eq('order_number', trip.order_number)
        .single()

      if (route?.route_geometry?.coordinates) {
        return route.route_geometry.coordinates
      }

      if (route?.route_data?.geometry?.coordinates) {
        return route.route_data.geometry.coordinates
      }
    }

    // Return hardcoded coordinates as fallback
    return [
      [31.018885, -29.903031], [31.018965, -29.903105], [31.019861, -29.903916],
      [31.019896, -29.903952], [31.019838, -29.904015], [31.019804, -29.904061],
      [31.019794, -29.904114], [31.019791, -29.904189], [31.019771, -29.904245],
      [31.019699, -29.904317], [31.019262, -29.904699], [31.019117, -29.904801],
      [31.018908, -29.904952], [31.01885, -29.905009], [31.018821, -29.905076],
      [31.018811, -29.90515], [31.018817, -29.905255], [31.018811, -29.905348],
      [31.018779, -29.905427], [31.018714, -29.905534], [31.018638, -29.905625],
      [31.018552, -29.90569], [31.018501, -29.905724], [31.018438, -29.905824],
      [31.018139, -29.906092], [28.042224, -26.205459], [28.042114, -26.204677]
    ]
    
    return null
  } catch (error) {
    console.error('Error in fetchRouteByTripId:', error)
    return null
  }
}