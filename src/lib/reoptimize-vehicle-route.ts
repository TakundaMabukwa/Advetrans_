import { optimizeMultiVehicleRoutes, type Customer, type Vehicle as GeoVehicle } from './geoapify-route-optimizer'

const DEPOT_LAT = -33.9249
const DEPOT_LON = 18.6369

export async function reoptimizeVehicleRoute(orders: any[]) {
  const validOrders = orders.filter(o => o.latitude && o.longitude)
  
  if (validOrders.length === 0) {
    return { orders, distance: 0, duration: 0, geometry: null }
  }

  if (validOrders.length === 1) {
    return { orders, distance: 0, duration: 0, geometry: null }
  }

  try {
    const customers: Customer[] = validOrders.map((o, idx) => ({
      id: `job-${idx}`,
      name: o.customerName || o.customer_name,
      latitude: o.latitude,
      longitude: o.longitude,
      weight: Math.round(o.totalWeight || o.total_weight || 0),
      deliveryDuration: 300
    }))

    const vehicle: GeoVehicle = {
      id: 'route-optimizer',
      name: 'Route Optimizer',
      capacity: 999999,
      startLocation: { lat: DEPOT_LAT, lng: DEPOT_LON }
    }

    const routes = await optimizeMultiVehicleRoutes([vehicle], customers, { lat: DEPOT_LAT, lng: DEPOT_LON })

    if (routes.length > 0 && routes[0].customers.length === customers.length) {
      const optimized = routes[0].customers.map(c =>
        orders.find(o => (o.customerName || o.customer_name) === c.name)
      ).filter(Boolean)

      return {
        orders: optimized,
        distance: routes[0].totalDistance,
        duration: routes[0].totalDuration,
        geometry: routes[0].geometry
      }
    }
  } catch (error) {
    console.error('Route optimization failed:', error)
  }

  return { orders, distance: 0, duration: 0, geometry: null }
}
