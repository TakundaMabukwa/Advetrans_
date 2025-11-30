/**
 * Route Planner - Plan optimal routes BEFORE assigning vehicles
 * Strategy: Map locations → Group regions → Create routes → Assign vehicles
 */

import type { Order, Vehicle } from './vehicle-assignment-rules'

export interface PlannedRoute {
  id: string
  name: string
  orders: Order[]
  totalWeight: number
  estimatedDistance: number
  centroid: { lat: number; lon: number }
  region: string
}

/**
 * Haversine distance
 */
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Calculate centroid of orders
 */
function calculateCentroid(orders: Order[]): { lat: number; lon: number } | null {
  const valid = orders.filter(o => o.latitude && o.longitude)
  if (valid.length === 0) return null
  
  const sumLat = valid.reduce((sum, o) => sum + o.latitude!, 0)
  const sumLon = valid.reduce((sum, o) => sum + o.longitude!, 0)
  
  return {
    lat: sumLat / valid.length,
    lon: sumLon / valid.length
  }
}

/**
 * STEP 1: Map all order locations and identify geographic clusters
 */
function mapOrderLocations(orders: Order[]): Map<string, Order[]> {
  console.log(`\n=== STEP 1: MAPPING ORDER LOCATIONS ===`)
  
  const locationMap = new Map<string, Order[]>()
  
  for (const order of orders) {
    if (!order.latitude || !order.longitude) continue
    
    const location = order.location_group || order.locationGroup || 'Unknown'
    if (!locationMap.has(location)) {
      locationMap.set(location, [])
    }
    locationMap.get(location)!.push(order)
  }
  
  console.log(`Found ${locationMap.size} distinct locations:`)
  for (const [location, orders] of locationMap) {
    const weight = orders.reduce((sum, o) => sum + (o.totalWeight || 0), 0)
    console.log(`  ${location}: ${orders.length} orders, ${Math.round(weight)}kg`)
  }
  
  return locationMap
}

/**
 * STEP 2: Analyze distances between regions and identify mergeable pairs
 */
function analyzeRegionDistances(locationMap: Map<string, Order[]>): Map<string, { location: string; distance: number }[]> {
  console.log(`\n=== STEP 2: ANALYZING REGION DISTANCES ===`)
  
  const distanceMatrix = new Map<string, { location: string; distance: number }[]>()
  const locations = Array.from(locationMap.keys())
  
  for (const location1 of locations) {
    const orders1 = locationMap.get(location1)!
    const centroid1 = calculateCentroid(orders1)
    if (!centroid1) continue
    
    const distances: { location: string; distance: number }[] = []
    
    for (const location2 of locations) {
      if (location1 === location2) continue
      
      const orders2 = locationMap.get(location2)!
      const centroid2 = calculateCentroid(orders2)
      if (!centroid2) continue
      
      const distance = haversineDistance(
        centroid1.lat, centroid1.lon,
        centroid2.lat, centroid2.lon
      )
      
      distances.push({ location: location2, distance })
    }
    
    distances.sort((a, b) => a.distance - b.distance)
    distanceMatrix.set(location1, distances)
    
    if (distances.length > 0) {
      console.log(`  ${location1} → nearest: ${distances[0].location} (${Math.round(distances[0].distance)}km)`)
    }
  }
  
  return distanceMatrix
}

/**
 * STEP 3: Group nearby regions into combined routes
 */
function groupNearbyRegions(
  locationMap: Map<string, Order[]>,
  distanceMatrix: Map<string, { location: string; distance: number }[]>,
  maxDistance: number = 150,
  targetWeight: number = 3000
): PlannedRoute[] {
  console.log(`\n=== STEP 3: GROUPING NEARBY REGIONS ===`)
  console.log(`Max distance: ${maxDistance}km, Target weight: ${targetWeight}kg`)
  
  const routes: PlannedRoute[] = []
  const used = new Set<string>()
  
  // Sort locations by weight (HEAVIEST FIRST - priority to heavy regions)
  const sortedLocations = Array.from(locationMap.entries())
    .sort((a, b) => {
      const weightA = a[1].reduce((sum, o) => sum + (o.totalWeight || 0), 0)
      const weightB = b[1].reduce((sum, o) => sum + (o.totalWeight || 0), 0)
      return weightB - weightA // Heaviest first
    })
  
  console.log(`\nRegions sorted by weight (heaviest first):`)
  sortedLocations.forEach(([loc, orders], i) => {
    const weight = orders.reduce((sum, o) => sum + (o.totalWeight || 0), 0)
    console.log(`  ${i + 1}. ${loc}: ${Math.round(weight)}kg (${orders.length} orders)`)
  })
  
  for (const [location, orders] of sortedLocations) {
    if (used.has(location)) continue
    
    const locationWeight = orders.reduce((sum, o) => sum + (o.totalWeight || 0), 0)
    console.log(`\nBuilding route from ${location} (${Math.round(locationWeight)}kg)...`)
    
    // Start new route
    const routeOrders = [...orders]
    let routeWeight = locationWeight
    const mergedLocations = [location]
    used.add(location)
    
    // Try to merge with nearby locations
    const nearbyLocations = distanceMatrix.get(location) || []
    
    for (const { location: nearLocation, distance } of nearbyLocations) {
      if (used.has(nearLocation)) continue
      if (distance > maxDistance) break // Sorted by distance, so we can stop
      
      const nearOrders = locationMap.get(nearLocation)!
      const nearWeight = nearOrders.reduce((sum, o) => sum + (o.totalWeight || 0), 0)
      
      // Merge if within distance and weight limits
      if (routeWeight + nearWeight <= targetWeight * 1.3) { // Allow 30% over target
        routeOrders.push(...nearOrders)
        routeWeight += nearWeight
        mergedLocations.push(nearLocation)
        used.add(nearLocation)
        
        console.log(`  ✓ Added ${nearLocation} (${Math.round(distance)}km, +${Math.round(nearWeight)}kg) → Total: ${Math.round(routeWeight)}kg`)
      } else {
        console.log(`  ✗ Skipped ${nearLocation} (would exceed: ${Math.round(routeWeight + nearWeight)}kg > ${Math.round(targetWeight * 1.3)}kg)`)
      }
    }
    
    // Create route
    const centroid = calculateCentroid(routeOrders)
    if (!centroid) continue
    
    const routeName = mergedLocations.length > 1 
      ? `${mergedLocations[0]} + ${mergedLocations.length - 1} more`
      : mergedLocations[0]
    
    routes.push({
      id: `route-${routes.length + 1}`,
      name: routeName,
      orders: routeOrders,
      totalWeight: routeWeight,
      estimatedDistance: 0, // Will be calculated later
      centroid,
      region: mergedLocations.join(' + ')
    })
    
    console.log(`  Route ${routes.length}: ${routeName} (${routeOrders.length} orders, ${Math.round(routeWeight)}kg)`)
  }
  
  return routes
}

/**
 * STEP 4: Optimize route sequences and calculate distances
 */
async function optimizeRouteSequences(routes: PlannedRoute[]): Promise<PlannedRoute[]> {
  console.log(`\n=== STEP 4: OPTIMIZING ROUTE SEQUENCES ===`)
  
  const DEPOT_LAT = -33.9249
  const DEPOT_LON = 18.6369
  
  for (const route of routes) {
    // Calculate estimated round-trip distance
    let totalDistance = 0
    const validOrders = route.orders.filter(o => o.latitude && o.longitude)
    
    if (validOrders.length > 0) {
      // Depot to first order
      totalDistance += haversineDistance(
        DEPOT_LAT, DEPOT_LON,
        validOrders[0].latitude!, validOrders[0].longitude!
      )
      
      // Between orders (simplified - actual routing will be done later)
      for (let i = 0; i < validOrders.length - 1; i++) {
        totalDistance += haversineDistance(
          validOrders[i].latitude!, validOrders[i].longitude!,
          validOrders[i + 1].latitude!, validOrders[i + 1].longitude!
        )
      }
      
      // Last order back to depot
      totalDistance += haversineDistance(
        validOrders[validOrders.length - 1].latitude!,
        validOrders[validOrders.length - 1].longitude!,
        DEPOT_LAT, DEPOT_LON
      )
    }
    
    route.estimatedDistance = Math.round(totalDistance)
    console.log(`  ${route.name}: ~${route.estimatedDistance}km round trip`)
  }
  
  return routes
}

/**
 * STEP 5: Weight-Based Vehicle Assignment
 * Strategy: Heaviest routes get largest vehicles, descending order
 */
export function assignVehiclesToRoutes(
  routes: PlannedRoute[],
  vehicles: Vehicle[]
): Map<PlannedRoute, Vehicle> {
  console.log(`\n=== STEP 5: WEIGHT-BASED VEHICLE ASSIGNMENT ===`)
  console.log(`Strategy: Heaviest routes → Largest vehicles`)
  
  const assignments = new Map<PlannedRoute, Vehicle>()
  
  // Sort routes by weight (HEAVIEST FIRST)
  const sortedRoutes = [...routes].sort((a, b) => b.totalWeight - a.totalWeight)
  
  // Sort vehicles by capacity (LARGEST FIRST)
  const availableVehicles = [...vehicles].sort((a, b) => b.load_capacity - a.load_capacity)
  
  console.log(`\nRoutes (sorted by weight):`)
  sortedRoutes.forEach((r, i) => console.log(`  ${i + 1}. ${r.name}: ${Math.round(r.totalWeight)}kg (${r.orders.length} orders)`))
  
  console.log(`\nVehicles (sorted by capacity):`)
  availableVehicles.forEach((v, i) => console.log(`  ${i + 1}. ${v.registration_number}: ${v.load_capacity}kg capacity`))
  
  console.log(`\n=== MATCHING ROUTES TO VEHICLES ===`)
  
  for (let i = 0; i < sortedRoutes.length; i++) {
    const route = sortedRoutes[i]
    
    // Find smallest vehicle that can fit this route (best-fit)
    let bestVehicle: Vehicle | null = null
    let bestUtilization = 0
    
    for (const vehicle of availableVehicles) {
      // Skip if already assigned
      if (Array.from(assignments.values()).includes(vehicle)) continue
      
      // Check if route fits (95% capacity limit)
      const maxCapacity = vehicle.load_capacity * 0.95
      if (route.totalWeight > maxCapacity) continue
      
      // Calculate utilization
      const utilization = (route.totalWeight / vehicle.load_capacity) * 100
      
      // Prefer higher utilization (better fit)
      if (utilization > bestUtilization) {
        bestUtilization = utilization
        bestVehicle = vehicle
      }
    }
    
    if (bestVehicle) {
      assignments.set(route, bestVehicle)
      console.log(`  ✓ Route ${i + 1}: ${route.name} (${Math.round(route.totalWeight)}kg) → ${bestVehicle.registration_number} (${Math.round(bestUtilization)}% full)`)
    } else {
      console.log(`  ✗ Route ${i + 1}: ${route.name} (${Math.round(route.totalWeight)}kg) - NO VEHICLE AVAILABLE`)
      const remaining = availableVehicles.filter(v => !Array.from(assignments.values()).includes(v))
      console.log(`     Remaining vehicles: ${remaining.map(v => `${v.registration_number}(${v.load_capacity}kg)`).join(', ') || 'NONE'}`)
    }
  }
  
  console.log(`\n=== ASSIGNMENT SUMMARY ===`)
  console.log(`Routes assigned: ${assignments.size}/${sortedRoutes.length}`)
  console.log(`Vehicles used: ${assignments.size}/${availableVehicles.length}`)
  const avgUtil = Array.from(assignments.entries()).reduce((sum, [route, vehicle]) => {
    return sum + (route.totalWeight / vehicle.load_capacity) * 100
  }, 0) / assignments.size
  console.log(`Average utilization: ${Math.round(avgUtil)}%`)
  
  return assignments
}

/**
 * Use Geoapify to optimize multi-vehicle routing
 */
async function optimizeWithGeoapify(
  orders: Order[],
  vehicles: Vehicle[]
): Promise<PlannedRoute[]> {
  console.log(`\n=== GEOAPIFY MULTI-VEHICLE OPTIMIZATION ===`)
  
  const DEPOT_LAT = -33.9249
  const DEPOT_LON = 18.6369
  
  // Convert orders to Geoapify customers
  const customers = orders
    .filter(o => o.latitude && o.longitude)
    .map((o, idx) => ({
      id: `order-${idx}`,
      name: o.customerName,
      latitude: o.latitude!,
      longitude: o.longitude!,
      weight: Math.round(o.totalWeight || 0),
      deliveryDuration: 300
    }))
  
  // Convert vehicles to Geoapify format (sorted by capacity)
  const geoVehicles = vehicles
    .sort((a, b) => b.load_capacity - a.load_capacity)
    .map((v, idx) => ({
      id: v.registration_number,
      name: v.registration_number,
      capacity: Math.round(v.load_capacity * 0.95), // 95% limit
      startLocation: { lat: DEPOT_LAT, lng: DEPOT_LON }
    }))
  
  console.log(`Optimizing ${customers.length} orders across ${geoVehicles.length} vehicles...`)
  
  try {
    const { optimizeMultiVehicleRoutes } = await import('./geoapify-route-optimizer')
    const optimizedRoutes = await optimizeMultiVehicleRoutes(
      geoVehicles,
      customers,
      { lat: DEPOT_LAT, lng: DEPOT_LON }
    )
    
    console.log(`\n✓ Geoapify assigned ${optimizedRoutes.length} routes`)
    
    // Convert back to PlannedRoute format
    const routes: PlannedRoute[] = optimizedRoutes.map((route, idx) => {
      const routeOrders = route.customers.map(c => 
        orders.find(o => o.customerName === c.name)
      ).filter(Boolean) as Order[]
      
      const totalWeight = routeOrders.reduce((sum, o) => sum + (o.totalWeight || 0), 0)
      const centroid = calculateCentroid(routeOrders)
      
      console.log(`  Route ${idx + 1} (${route.vehicleId}): ${routeOrders.length} orders, ${Math.round(totalWeight)}kg, ${Math.round(route.totalDistance)}km`)
      
      return {
        id: `route-${idx + 1}`,
        name: `Route ${idx + 1}`,
        orders: routeOrders,
        totalWeight,
        estimatedDistance: route.totalDistance,
        centroid: centroid || { lat: DEPOT_LAT, lon: DEPOT_LON },
        region: routeOrders[0]?.location_group || 'Mixed'
      }
    })
    
    return routes
  } catch (error) {
    console.error('Geoapify optimization failed:', error)
    console.log('Falling back to manual route planning...')
    return []
  }
}

/**
 * MAIN: Plan routes before assigning vehicles
 */
export async function planRoutesFirst(
  orders: Order[],
  vehicles: Vehicle[],
  options: {
    maxRegionDistance?: number
    targetRouteWeight?: number
  } = {}
): Promise<PlannedRoute[]> {
  console.log(`\n╔════════════════════════════════════════════════════════╗`)
  console.log(`║  GEOAPIFY-POWERED ROUTE OPTIMIZATION                   ║`)
  console.log(`╚════════════════════════════════════════════════════════╝`)
  
  // Try Geoapify first
  const geoapifyRoutes = await optimizeWithGeoapify(orders, vehicles)
  
  if (geoapifyRoutes.length > 0) {
    // Assign vehicles to optimized routes
    const vehicleAssignments = assignVehiclesToRoutes(geoapifyRoutes, vehicles)
    
    console.log(`\n=== GEOAPIFY OPTIMIZATION SUMMARY ===`)
    console.log(`Routes created: ${geoapifyRoutes.length}`)
    console.log(`Vehicles used: ${vehicleAssignments.size}`)
    const avgUtil = Array.from(vehicleAssignments.entries()).reduce((sum, [route, vehicle]) => {
      return sum + (route.totalWeight / vehicle.load_capacity) * 100
    }, 0) / vehicleAssignments.size
    console.log(`Average utilization: ${Math.round(avgUtil)}%`)
    
    return geoapifyRoutes
  }
  
  // Fallback to manual planning
  console.log(`\n=== FALLBACK: MANUAL ROUTE PLANNING ===`)
  const { maxRegionDistance = 100, targetRouteWeight = 2500 } = options
  
  const locationMap = mapOrderLocations(orders)
  const distanceMatrix = analyzeRegionDistances(locationMap)
  const routes = groupNearbyRegions(locationMap, distanceMatrix, maxRegionDistance, targetRouteWeight)
  await optimizeRouteSequences(routes)
  assignVehiclesToRoutes(routes, vehicles)
  
  return routes
}
