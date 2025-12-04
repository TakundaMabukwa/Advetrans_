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
 * Enhanced municipality and region mapping for route planning
 */
function getMunicipalityAndRegionForRoutes(zone: string): { municipality: string; region: string } {
  const municipalityMap: Record<string, { municipality: string; region: string }> = {
    // City of Cape Town Municipality
    'Mfuleni': { municipality: 'City of Cape Town', region: 'Cape Town Metro' },
    'Khayelitsha': { municipality: 'City of Cape Town', region: 'Cape Town Metro' },
    'Mitchells Plain': { municipality: 'City of Cape Town', region: 'Cape Town Metro' },
    'Cape Town CBD': { municipality: 'City of Cape Town', region: 'Cape Town Metro' },
    'Bellville': { municipality: 'City of Cape Town', region: 'Cape Town Metro' },
    'Parow': { municipality: 'City of Cape Town', region: 'Cape Town Metro' },
    'Goodwood': { municipality: 'City of Cape Town', region: 'Cape Town Metro' },
    'Table View': { municipality: 'City of Cape Town', region: 'Cape Town Metro' },
    'Milnerton': { municipality: 'City of Cape Town', region: 'Cape Town Metro' },
    'Wynberg': { municipality: 'City of Cape Town', region: 'Cape Town Metro' },
    'Claremont': { municipality: 'City of Cape Town', region: 'Cape Town Metro' },
    'Constantia': { municipality: 'City of Cape Town', region: 'Cape Town Metro' },
    'Durbanville': { municipality: 'City of Cape Town', region: 'Cape Town Metro' },
    'Brackenfell': { municipality: 'City of Cape Town', region: 'Cape Town Metro' },
    'Kuils River': { municipality: 'City of Cape Town', region: 'Cape Town Metro' },
    
    // Stellenbosch Municipality
    'Stellenbosch': { municipality: 'Stellenbosch', region: 'Boland' },
    'Somerset West': { municipality: 'Stellenbosch', region: 'Boland' },
    'Strand': { municipality: 'Stellenbosch', region: 'Boland' },
    
    // Drakenstein Municipality
    'Paarl': { municipality: 'Drakenstein', region: 'Boland' },
    'Wellington': { municipality: 'Drakenstein', region: 'Boland' },
    
    // Other municipalities
    'Worcester': { municipality: 'Breede Valley', region: 'Boland' },
    'Ceres': { municipality: 'Witzenberg', region: 'Boland' },
    'Robertson': { municipality: 'Langeberg', region: 'Boland' },
    'Swellendam': { municipality: 'Swellendam', region: 'Overberg' },
    'Hermanus': { municipality: 'Overstrand', region: 'Overberg' },
    'Caledon': { municipality: 'Theewaterskloof', region: 'Overberg' },
    'George': { municipality: 'George', region: 'Garden Route' },
    'Mossel Bay': { municipality: 'Mossel Bay', region: 'Garden Route' },
    'Knysna': { municipality: 'Knysna', region: 'Garden Route' },
    'Plettenberg Bay': { municipality: 'Bitou', region: 'Garden Route' },
    'Kimberley': { municipality: 'Sol Plaatje', region: 'Northern Cape' },
    'Durban': { municipality: 'eThekwini', region: 'KwaZulu-Natal' }
  }
  
  return municipalityMap[zone] || { municipality: 'Unknown', region: 'Other' }
}

/**
 * Get municipality from coordinates using Geoapify reverse geocoding
 */
async function getMunicipalityFromCoordinates(lat: number, lon: number): Promise<string> {
  try {
    const response = await fetch(
      `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&apiKey=${process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY}`
    )
    
    if (!response.ok) return 'Unknown'
    
    const data = await response.json()
    const feature = data.features?.[0]
    
    if (!feature) return 'Unknown'
    
    // Extract city, county, or district for municipality mapping
    const city = feature.properties?.city
    const county = feature.properties?.county
    const district = feature.properties?.district
    const state = feature.properties?.state
    
    const placeName = city || county || district || state || 'Unknown'
    const mapping = getMunicipalityAndRegionForRoutes(placeName)
    
    return `${placeName} (${mapping.municipality})`
  } catch (error) {
    console.error('Reverse geocoding error:', error)
    return 'Unknown'
  }
}

/**
 * STEP 1: Map all order locations by municipality and region
 */
async function mapOrderLocations(orders: Order[]): Promise<Map<string, Order[]>> {
  console.log(`\n=== STEP 1: MAPPING ORDER LOCATIONS BY MUNICIPALITY ===`)
  
  const locationMap = new Map<string, Order[]>()
  
  // Get municipalities for all orders with coordinates
  for (const order of orders) {
    if (!order.latitude || !order.longitude) continue
    
    let municipality = 'Unknown'
    
    // Use existing location_group if available
    if (order.location_group) {
      const mapping = getMunicipalityAndRegionForRoutes(order.location_group)
      municipality = `${order.location_group} (${mapping.municipality})`
    } else {
      // Reverse geocode to get municipality
      municipality = await getMunicipalityFromCoordinates(order.latitude, order.longitude)
    }
    
    if (!locationMap.has(municipality)) {
      locationMap.set(municipality, [])
    }
    locationMap.get(municipality)!.push(order)
  }
  
  console.log(`Found ${locationMap.size} distinct municipalities:`)
  for (const [municipality, orders] of locationMap) {
    const weight = orders.reduce((sum, o) => sum + (o.totalWeight || 0), 0)
    console.log(`  ${municipality}: ${orders.length} orders, ${Math.round(weight)}kg`)
  }
  
  return locationMap
}

/**
 * STEP 2: Analyze distances between municipalities and identify mergeable pairs
 */
function analyzeMunicipalityDistances(locationMap: Map<string, Order[]>): Map<string, { location: string; distance: number }[]> {
  console.log(`\n=== STEP 2: ANALYZING MUNICIPALITY DISTANCES ===`)
  
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
 * STEP 3: Group nearby municipalities into combined routes
 * Merges municipalities that are close to each other or in same region
 */
function groupNearbyMunicipalities(
  locationMap: Map<string, Order[]>,
  distanceMatrix: Map<string, { location: string; distance: number }[]>,
  maxDistance: number = 100,
  targetWeight: number = 3000
): PlannedRoute[] {
  console.log(`\n=== STEP 3: MERGING NEARBY MUNICIPALITIES ===`)
  console.log(`Max merge distance: ${maxDistance}km`)
  
  const routes: PlannedRoute[] = []
  const used = new Set<string>()
  
  // Calculate centroids for all regions
  const regionCentroids = new Map<string, { lat: number; lon: number }>()
  for (const [region, orders] of locationMap) {
    const centroid = calculateCentroid(orders)
    if (centroid) regionCentroids.set(region, centroid)
  }
  
  console.log(`\nMunicipalities found:`)
  for (const [municipality, orders] of locationMap) {
    const totalWeight = orders.reduce((sum, o) => sum + (o.totalWeight || 0), 0)
    console.log(`  ${municipality}: ${orders.length} orders, ${Math.round(totalWeight)}kg`)
  }
  
  // Sort municipalities by weight (heaviest first)
  const sortedMunicipalities = Array.from(locationMap.entries())
    .sort((a, b) => {
      const weightA = a[1].reduce((sum, o) => sum + (o.totalWeight || 0), 0)
      const weightB = b[1].reduce((sum, o) => sum + (o.totalWeight || 0), 0)
      return weightB - weightA
    })
  
  console.log(`\n=== MERGING PROCESS ===`)
  
  for (const [municipality, orders] of sortedMunicipalities) {
    if (used.has(municipality)) continue
    
    const municipalityWeight = orders.reduce((sum, o) => sum + (o.totalWeight || 0), 0)
    const centroid = regionCentroids.get(municipality)
    if (!centroid) continue
    
    console.log(`\nStarting with ${municipality} (${Math.round(municipalityWeight)}kg, ${orders.length} orders)`)
    
    // Start with this municipality
    let mergedOrders = [...orders]
    let mergedWeight = municipalityWeight
    const mergedMunicipalities = [municipality]
    used.add(municipality)
    
    // Find nearby municipalities to merge
    for (const [nearMunicipality, nearOrders] of sortedMunicipalities) {
      if (used.has(nearMunicipality)) continue
      
      const nearCentroid = regionCentroids.get(nearMunicipality)
      if (!nearCentroid) continue
      
      // Check if same region first (prioritize regional grouping)
      const currentMapping = getMunicipalityAndRegionForRoutes(municipality.split(' (')[0] || municipality)
      const nearMapping = getMunicipalityAndRegionForRoutes(nearMunicipality.split(' (')[0] || nearMunicipality)
      const sameRegion = currentMapping.region === nearMapping.region
      
      // Calculate distance between municipality centroids
      const distance = haversineDistance(
        centroid.lat, centroid.lon,
        nearCentroid.lat, nearCentroid.lon
      )
      
      // Allow longer distances for same region
      const maxAllowedDistance = sameRegion ? maxDistance * 1.5 : maxDistance
      
      if (distance > maxAllowedDistance) continue
      
      const nearWeight = nearOrders.reduce((sum, o) => sum + (o.totalWeight || 0), 0)
      const combinedWeight = mergedWeight + nearWeight
      
      // Check if combined weight is reasonable (not too heavy)
      if (combinedWeight <= targetWeight * 1.5) {
        mergedOrders.push(...nearOrders)
        mergedWeight = combinedWeight
        mergedMunicipalities.push(nearMunicipality)
        used.add(nearMunicipality)
        const regionNote = sameRegion ? ' [same region]' : ''
        console.log(`  ✓ Merged ${nearMunicipality} (${Math.round(distance)}km away, +${Math.round(nearWeight)}kg)${regionNote} → Total: ${Math.round(mergedWeight)}kg`)
      } else {
        console.log(`  ✗ Skipped ${nearMunicipality} (${Math.round(distance)}km away, would be ${Math.round(combinedWeight)}kg - too heavy)`)
      }
    }
    
    // Create merged route
    const finalCentroid = calculateCentroid(mergedOrders)
    if (!finalCentroid) continue
    
    const routeName = mergedMunicipalities.length > 1
      ? `${mergedMunicipalities[0].split(' (')[0]} +${mergedMunicipalities.length - 1}`
      : mergedMunicipalities[0].split(' (')[0]
    
    routes.push({
      id: `route-${routes.length + 1}`,
      name: routeName,
      orders: mergedOrders,
      totalWeight: mergedWeight,
      estimatedDistance: 0,
      centroid: finalCentroid,
      region: mergedMunicipalities.join(' + ')
    })
    
    console.log(`  → Created route: ${routeName} (${mergedOrders.length} orders, ${Math.round(mergedWeight)}kg)`)
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
 * STEP 5: Best-Fit Vehicle Assignment Per Regional Group
 * Strategy: For each region, find best vehicle considering capacity, drums, and restrictions
 */
export function assignVehiclesToRoutes(
  routes: PlannedRoute[],
  vehicles: Vehicle[]
): Map<PlannedRoute, Vehicle> {
  console.log(`\n=== STEP 5: BEST-FIT VEHICLE ASSIGNMENT PER REGION ===`)
  
  const assignments = new Map<PlannedRoute, Vehicle>()
  const usedVehicles = new Set<string>()
  
  // Sort routes by weight (heaviest first for priority)
  const sortedRoutes = [...routes].sort((a, b) => b.totalWeight - a.totalWeight)
  
  console.log(`\nRegional groups (sorted by weight):`)
  sortedRoutes.forEach((route, i) => {
    const drumCount = route.orders.reduce((sum, o) => sum + (o.drums || 0), 0)
    console.log(`  ${i + 1}. ${route.region}: ${Math.round(route.totalWeight)}kg, ${route.orders.length} orders${drumCount > 0 ? `, ${drumCount} drums` : ''}`)
  })
  
  console.log(`\n=== FINDING BEST-FIT VEHICLES ===`)
  
  for (const route of sortedRoutes) {
    const weight = route.totalWeight
    const drumCount = route.orders.reduce((sum, o) => sum + (o.drums || 0), 0)
    const hasDrums = drumCount > 0
    
    console.log(`\n${route.region} (${Math.round(weight)}kg${hasDrums ? `, ${drumCount} drums` : ''}):`)
    
    // Find all compatible vehicles
    const compatibleVehicles = vehicles
      .filter(v => !usedVehicles.has(v.registration_number))
      .map(vehicle => {
        // Use remainingCapacity if available (for auto-assign), otherwise use full capacity
        const availableCapacity = (vehicle as any).remainingCapacity ?? vehicle.load_capacity
        const maxCapacity = availableCapacity * 0.95
        
        // Check capacity
        if (weight > maxCapacity) {
          const usedWeight = (vehicle as any).usedCapacity ?? 0
          console.log(`  ✗ ${vehicle.registration_number}: insufficient capacity (${Math.round(maxCapacity)}kg available${usedWeight > 0 ? `, ${Math.round(usedWeight)}kg used` : ''} < ${Math.round(weight)}kg needed)`)
          return null
        }
        
        // Check drum restrictions
        if (hasDrums) {
          const restrictions = (vehicle.restrictions || '').toLowerCase()
          
          // Hard no drums restriction
          if (restrictions.includes('no') && restrictions.includes('210') && 
              restrictions.includes('drum') && !restrictions.includes('ideally')) {
            console.log(`  ✗ ${vehicle.registration_number}: no drums allowed`)
            return null
          }
          
          // Max drum limit
          const maxDrumMatch = restrictions.match(/max\s+(\d+)x?\s+210/i)
          if (maxDrumMatch) {
            const maxDrums = parseInt(maxDrumMatch[1])
            if (drumCount > maxDrums) {
              console.log(`  ✗ ${vehicle.registration_number}: drum limit exceeded (${drumCount} > ${maxDrums})`)
              return null
            }
          }
        }
        
        const utilization = (weight / availableCapacity) * 100
        return { vehicle, utilization, availableCapacity }
      })
      .filter(Boolean)
      .sort((a, b) => b!.utilization - a!.utilization) // Best utilization first
    
    if (compatibleVehicles.length > 0) {
      const best = compatibleVehicles[0]!
      assignments.set(route, best.vehicle)
      usedVehicles.add(best.vehicle.registration_number)
      console.log(`  ✓ ASSIGNED: ${best.vehicle.registration_number} (${Math.round(best.utilization)}% utilization)`)
    } else {
      console.log(`  ✗ NO COMPATIBLE VEHICLE FOUND`)
    }
  }
  
  console.log(`\n=== ASSIGNMENT SUMMARY ===`)
  console.log(`Regions: ${routes.length}`)
  console.log(`Vehicles assigned: ${usedVehicles.size}/${vehicles.length}`)
  console.log(`Routes assigned: ${assignments.size}/${routes.length}`)
  
  if (assignments.size > 0) {
    const avgUtil = Array.from(assignments.entries()).reduce((sum, [route, vehicle]) => {
      return sum + (route.totalWeight / vehicle.load_capacity) * 100
    }, 0) / assignments.size
    console.log(`Average utilization: ${Math.round(avgUtil)}%`)
  }
  
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
  
  // Validate we have customers to optimize
  if (customers.length === 0) {
    console.log('No orders with valid coordinates for Geoapify optimization')
    return []
  }
  
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
  console.log(`║  REGIONAL GROUPING WITH PROXIMITY MERGING              ║`)
  console.log(`╚════════════════════════════════════════════════════════╝`)
  
  // Use regional grouping with proximity merging
  const { maxRegionDistance = 100, targetRouteWeight = 3500 } = options
  
  const locationMap = await mapOrderLocations(orders)
  const distanceMatrix = analyzeMunicipalityDistances(locationMap)
  const routes = groupNearbyMunicipalities(locationMap, distanceMatrix, maxRegionDistance, targetRouteWeight)
  await optimizeRouteSequences(routes)
  assignVehiclesToRoutes(routes, vehicles)
  
  return routes
}
