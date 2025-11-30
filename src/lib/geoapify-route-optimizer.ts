/**
 * Geoapify Route Optimization Service
 * Uses Geoapify Route Planner SDK for truck routing and customer grouping
 * Rate limit: 5 requests per second
 */

import { RoutePlanner, Agent, Job } from '@geoapify/route-planner-sdk'

const GEOAPIFY_API_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || ''
const RATE_LIMIT_MS = 200 // 5 requests per second = 200ms between requests

enum Mode {
  DRIVE = 'drive',
  TRUCK = 'truck'
}

// Route types for optimization (SDK supports: balanced, short, less_maneuvers)
const RouteType = {
  SHORT: 'short',
  BALANCED: 'balanced',
  LESS_MANEUVERS: 'less_maneuvers'
} as const

let lastRequestTime = 0

/**
 * Rate limiter for Geoapify API (5 requests/second)
 */
async function rateLimitedRequest<T>(fn: () => Promise<T>): Promise<T> {
  const now = Date.now()
  const timeSinceLastRequest = now - lastRequestTime
  
  if (timeSinceLastRequest < RATE_LIMIT_MS) {
    await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_MS - timeSinceLastRequest))
  }
  
  lastRequestTime = Date.now()
  return fn()
}

export interface Customer {
  id: string
  name: string
  latitude: number
  longitude: number
  weight: number
  deliveryDuration?: number // minutes
}

export interface Vehicle {
  id: string
  name: string
  capacity: number
  startLocation: { lat: number; lng: number }
}

export interface OptimizedRoute {
  vehicleId: string
  vehicleName: string
  customers: Customer[]
  totalDistance: number
  totalDuration: number
  sequence: number[]
  geometry?: any
}

/**
 * Optimize routes for multiple vehicles and customers
 * Groups customers by location and assigns to vehicles optimally
 */
export async function optimizeMultiVehicleRoutes(
  vehicles: Vehicle[],
  customers: Customer[],
  depot: { lat: number; lng: number }
): Promise<OptimizedRoute[]> {
  
  const planner = new RoutePlanner({ apiKey: GEOAPIFY_API_KEY })
  
  // Set mode to truck for truck-specific routing
  planner.setMode(Mode.TRUCK)
  
  // Optimize for shortest route (fastest for trucks) and avoid tolls
  planner.setType(RouteType.SHORT)
  
  // Add toll avoidance
  const avoid = new (await import('@geoapify/route-planner-sdk')).Avoid()
  avoid.setType('tolls')
  planner.addAvoid(avoid)
  
  // Add vehicles as agents
  vehicles.forEach(vehicle => {
    console.log(`Adding agent: ${vehicle.id}, capacity: ${vehicle.capacity}, start: [${vehicle.startLocation.lng}, ${vehicle.startLocation.lat}]`)
    const agent = new Agent()
      .setId(vehicle.id)
      .setStartLocation(vehicle.startLocation.lng, vehicle.startLocation.lat)
      .setEndLocation(depot.lng, depot.lat)
      .setPickupCapacity(vehicle.capacity)
    
    planner.addAgent(agent)
  })
  
  // Add customers as jobs (only valid weights)
  let jobCount = 0
  customers.forEach(customer => {
    if (customer.weight > 0) {
      console.log(`Adding job ${customer.id}: weight=${customer.weight}, location=[${customer.longitude}, ${customer.latitude}]`)
      const job = new Job()
        .setId(customer.id)
        .setLocation(customer.longitude, customer.latitude)
        .setPickupAmount(customer.weight)
        .setDuration(customer.deliveryDuration || 300)
      
      planner.addJob(job)
      jobCount++
    }
  })
  
  console.log(`Total: ${vehicles.length} agents, ${jobCount} jobs`)
  
  // Run optimization with rate limiting
  const result = await rateLimitedRequest(() => planner.plan())
  
  // Parse results into optimized routes
  const routes: OptimizedRoute[] = []
  
  for (const agent of result.getAgentSolutions()) {
    const waypoints = agent.getWaypoints()
    if (!waypoints || waypoints.length === 0) continue
    
    const assignedCustomers: Customer[] = []
    const sequence: number[] = []
    
    waypoints.forEach(waypoint => {
      waypoint.getActions().forEach(action => {
        const jobId = action.getJobId()
        if (jobId) {
          const customer = customers.find(c => c.id === jobId)
          if (customer) {
            assignedCustomers.push(customer)
            sequence.push(customers.indexOf(customer))
          }
        }
      })
    })
    
    // Get route geometry from Geoapify
    let geometry = undefined
    try {
      const routeData = await result.getAgentRoute(agent.getAgentId(), {
        mode: Mode.TRUCK,
        type: RouteType.SHORT
      })
      if (routeData?.features?.[0]?.geometry) {
        geometry = routeData.features[0].geometry
      }
    } catch (error) {
      console.log(`Could not fetch geometry for ${agent.getAgentId()}`)
    }
    
    routes.push({
      vehicleId: agent.getAgentId(),
      vehicleName: vehicles.find(v => v.id === agent.getAgentId())?.name || agent.getAgentId(),
      customers: assignedCustomers,
      totalDistance: agent.getDistance() / 1000,
      totalDuration: agent.getTime() / 60,
      sequence,
      geometry
    })
  }
  
  return routes
}

/**
 * Optimize route for a single vehicle
 */
export async function optimizeSingleVehicleRoute(
  vehicle: Vehicle,
  customers: Customer[],
  depot: { lat: number; lng: number }
): Promise<OptimizedRoute | null> {
  const routes = await optimizeMultiVehicleRoutes([vehicle], customers, depot)
  return routes[0] || null
}

/**
 * Group customers by geographic clusters
 * Returns customer groups that should be delivered together
 */
export async function groupCustomersByLocation(
  customers: Customer[],
  maxGroupSize: number = 10
): Promise<Customer[][]> {
  if (customers.length <= maxGroupSize) {
    return [customers]
  }
  
  const planner = new RoutePlanner({ apiKey: GEOAPIFY_API_KEY })
  planner.setMode(Mode.TRUCK)
  planner.setType(RouteType.SHORT)
  
  // Add toll avoidance
  const avoid = new (await import('@geoapify/route-planner-sdk')).Avoid()
  avoid.setType('tolls')
  planner.addAvoid(avoid)
  
  // Create a single agent with large capacity to get optimal sequence
  const agent = new Agent()
    .setId('grouping-agent')
    .setStartLocation(customers[0].longitude, customers[0].latitude)
    .setPickupCapacity(999999)
  
  planner.addAgent(agent)
  
  customers.forEach(customer => {
    const job = new Job()
      .setId(customer.id)
      .setLocation(customer.latitude, customer.longitude)
      .setPickupAmount(customer.weight)
    
    planner.addJob(job)
  })
  
  const result = await rateLimitedRequest(() => planner.plan())
  const route = result.getAgents()[0]?.getRoute()
  
  if (!route) return [customers]
  
  // Get optimized sequence
  const optimizedSequence: Customer[] = []
  route.getWaypoints().forEach(waypoint => {
    waypoint.getActions().forEach(action => {
      const jobId = action.getJobId()
      if (jobId) {
        const customer = customers.find(c => c.id === jobId)
        if (customer) optimizedSequence.push(customer)
      }
    })
  })
  
  // Split into groups of maxGroupSize
  const groups: Customer[][] = []
  for (let i = 0; i < optimizedSequence.length; i += maxGroupSize) {
    groups.push(optimizedSequence.slice(i, i + maxGroupSize))
  }
  
  return groups
}

/**
 * Calculate route distance and duration between two points
 */
export async function calculateTruckRoute(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
): Promise<{ distance: number; duration: number; geometry: any }> {
  const planner = new RoutePlanner({ apiKey: GEOAPIFY_API_KEY })
  planner.setMode(Mode.TRUCK)
  planner.setType(RouteType.SHORT)
  
  // Add toll avoidance
  const avoid = new (await import('@geoapify/route-planner-sdk')).Avoid()
  avoid.setType('tolls')
  planner.addAvoid(avoid)
  
  const agent = new Agent()
    .setId('route-calc')
    .setStartLocation(from.lng, from.lat)
    .setEndLocation(to.lng, to.lat)
  
  planner.addAgent(agent)
  
  const result = await rateLimitedRequest(() => planner.plan())
  const route = result.getAgents()[0]?.getRoute()
  
  if (!route) {
    throw new Error('Failed to calculate route')
  }
  
  return {
    distance: route.getDistance() / 1000, // km
    duration: route.getDuration() / 60, // minutes
    geometry: route.getGeometry()
  }
}
