import { createClient } from '@/lib/supabase/client'
import { optimizeMultiVehicleRoutes, groupCustomersByLocation, type Customer, type Vehicle as GeoVehicle } from './geoapify-route-optimizer'
import { binPackingOptimizer } from './bin-packing-optimizer'
import { planRoutesFirst, assignVehiclesToRoutes, type PlannedRoute } from './route-planner'

export interface Order {
  customerName: string
  totalWeight: number
  drums?: number
  netWeight?: number
  location?: string
  locationGroup?: string
  latitude?: number
  longitude?: number
}

export interface Vehicle {
  id: number
  registration_number: string
  load_capacity: number
  restrictions?: string
  description?: string
}

export interface Driver {
  id: number
  first_name: string
  surname: string
  available: boolean
  distance?: number
  license_code?: string
}

export interface VehicleAssignment {
  vehicle: Vehicle
  assignedOrders: Order[]
  totalWeight: number
  capacity: number
  utilization: number
  destinationGroup?: string
  assignedDrivers?: Driver[]
  routeDistance?: number
  routeDuration?: number
  startingWeight?: number
}

// Vehicle pairing configuration - vehicles that always work together
const VEHICLE_PAIRS: Record<string, string[]> = {
  'CN30435': ['CN30435', 'Mission Trailer'],
  'Mission Trailer': ['CN30435', 'Mission Trailer']
}

/**
 * Get paired vehicles that work as a unit
 */
export function getPairedVehicles(vehicleReg: string): string[] {
  return VEHICLE_PAIRS[vehicleReg] || [vehicleReg]
}

/**
 * Check if vehicle is part of a pair
 */
export function isVehiclePaired(vehicleReg: string): boolean {
  return vehicleReg in VEHICLE_PAIRS
}

/**
 * Allocate orders to paired vehicles until both reach capacity
 * NEW RULE: If Mission Trailer is picked, get CN30435 and allocate to both
 */
export function allocateOrdersToPairedVehicles(
  orders: Order[],
  pairedAssignments: VehicleAssignment[],
  allAssignments: VehicleAssignment[]
): Order[] {
  if (pairedAssignments.length !== 2) return orders
  
  const missionTrailer = pairedAssignments.find(a => a.vehicle.registration_number === 'Mission Trailer')
  const cn30435 = pairedAssignments.find(a => a.vehicle.registration_number === 'CN30435')
  
  if (!missionTrailer || !cn30435) return orders
  
  console.log(`\n🔗 PAIRED ALLOCATION: Mission Trailer + CN30435`)
  console.log(`  Mission Trailer capacity: ${missionTrailer.capacity}kg`)
  console.log(`  CN30435 capacity: ${cn30435.capacity}kg`)
  console.log(`  Combined capacity: ${missionTrailer.capacity + cn30435.capacity}kg`)
  
  const remainingOrders = [...orders]
  const combinedCapacity = missionTrailer.capacity + cn30435.capacity
  let combinedWeight = missionTrailer.totalWeight + cn30435.totalWeight
  
  // Get destination from whichever vehicle has orders first
  const sharedDestination = missionTrailer.destinationGroup || cn30435.destinationGroup
  
  // Filter orders that can go to this destination and fit restrictions
  const compatibleOrders = remainingOrders.filter(order => {
    // Check destination compatibility
    if (sharedDestination && (order.locationGroup || order.location_group)) {
      const orderLocation = order.locationGroup || order.location_group
      if (orderLocation !== sharedDestination) return false
    }
    
    // Check if either vehicle can handle this order
    return canAssignOrderToVehicle(order, missionTrailer, allAssignments) ||
           canAssignOrderToVehicle(order, cn30435, allAssignments)
  })
  
  console.log(`  Compatible orders for ${sharedDestination || 'route'}: ${compatibleOrders.length}`)
  
  // Allocate orders alternating between vehicles until both reach capacity
  let currentVehicle = cn30435 // Start with CN30435 (vehicle, not trailer)
  let allocatedCount = 0
  
  for (const order of compatibleOrders) {
    const orderWeight = order.totalWeight || (order.drums || 0) * 200
    
    // Check if order fits in combined remaining capacity
    if (combinedWeight + orderWeight > combinedCapacity * 0.95) {
      console.log(`  ⚠️ Combined capacity reached, stopping allocation`)
      break
    }
    
    // Try to assign to current vehicle first
    const currentCapacityRemaining = currentVehicle.capacity * 0.95 - currentVehicle.totalWeight
    
    if (currentCapacityRemaining >= orderWeight && 
        canAssignOrderToVehicle(order, currentVehicle, allAssignments)) {
      // Assign to current vehicle
      currentVehicle.assignedOrders.push(order)
      currentVehicle.totalWeight += orderWeight
      currentVehicle.utilization = (currentVehicle.totalWeight / currentVehicle.capacity) * 100
      currentVehicle.destinationGroup = order.locationGroup || order.location_group || sharedDestination
      
      combinedWeight += orderWeight
      allocatedCount++
      
      console.log(`  ✓ ${order.customerName} → ${currentVehicle.vehicle.registration_number} (${Math.round(currentVehicle.utilization)}% full)`)
      
      // Remove from remaining orders
      const index = remainingOrders.indexOf(order)
      if (index > -1) remainingOrders.splice(index, 1)
      
      // Switch to other vehicle for next order (alternating allocation)
      currentVehicle = currentVehicle === cn30435 ? missionTrailer : cn30435
    } else {
      // Try the other vehicle
      const otherVehicle = currentVehicle === cn30435 ? missionTrailer : cn30435
      const otherCapacityRemaining = otherVehicle.capacity * 0.95 - otherVehicle.totalWeight
      
      if (otherCapacityRemaining >= orderWeight && 
          canAssignOrderToVehicle(order, otherVehicle, allAssignments)) {
        // Assign to other vehicle
        otherVehicle.assignedOrders.push(order)
        otherVehicle.totalWeight += orderWeight
        otherVehicle.utilization = (otherVehicle.totalWeight / otherVehicle.capacity) * 100
        otherVehicle.destinationGroup = order.locationGroup || order.location_group || sharedDestination
        
        combinedWeight += orderWeight
        allocatedCount++
        
        console.log(`  ✓ ${order.customerName} → ${otherVehicle.vehicle.registration_number} (${Math.round(otherVehicle.utilization)}% full)`)
        
        // Remove from remaining orders
        const index = remainingOrders.indexOf(order)
        if (index > -1) remainingOrders.splice(index, 1)
        
        // Keep current vehicle for next iteration
      } else {
        console.log(`  ✗ ${order.customerName} - doesn't fit in either paired vehicle`)
      }
    }
  }
  
  // Ensure both vehicles have same destination
  const finalDestination = missionTrailer.destinationGroup || cn30435.destinationGroup
  if (finalDestination) {
    missionTrailer.destinationGroup = finalDestination
    cn30435.destinationGroup = finalDestination
  }
  
  console.log(`  🔗 Paired allocation complete: ${allocatedCount} orders allocated`)
  console.log(`  Mission Trailer: ${missionTrailer.assignedOrders.length} orders, ${Math.round(missionTrailer.utilization)}% full`)
  console.log(`  CN30435: ${cn30435.assignedOrders.length} orders, ${Math.round(cn30435.utilization)}% full`)
  console.log(`  Combined utilization: ${Math.round((combinedWeight / combinedCapacity) * 100)}%`)
  
  return remainingOrders
}

/**
 * Check if an order can be assigned to a vehicle
 * Paired vehicles share destination and work together until both reach capacity
 */
export function canAssignOrderToVehicle(
  order: Order,
  assignment: VehicleAssignment,
  allAssignments?: VehicleAssignment[]
): boolean {
  const orderWeight = order.totalWeight || (order.drums || 0) * 200
  const hasDrums = (order.drums || 0) > 0
  const drumCount = order.drums || 0
  const customerName = (order.customerName || '').toLowerCase()
  const restrictions = (assignment.vehicle.restrictions || '').toLowerCase()
  const vehicleReg = assignment.vehicle.registration_number

  // NEW RULE: If Mission Trailer is picked, check combined capacity with CN30435
  if (isVehiclePaired(vehicleReg) && allAssignments) {
    const pairedRegs = getPairedVehicles(vehicleReg)
    const pairedAssignments = allAssignments.filter(a => 
      pairedRegs.includes(a.vehicle.registration_number)
    )
    
    // Calculate combined capacity and weight for paired vehicles
    const combinedCapacity = pairedAssignments.reduce((sum, a) => sum + a.capacity, 0)
    const combinedWeight = pairedAssignments.reduce((sum, a) => sum + a.totalWeight, 0)
    
    // Check if order fits in combined capacity (enforce 95% limit)
    if (combinedWeight + orderWeight > combinedCapacity * 0.95) {
      return false
    }
    
    // If either vehicle in the pair has orders, both must go to same destination
    const hasOrdersInPair = pairedAssignments.some(a => a.assignedOrders.length > 0)
    if (hasOrdersInPair && (order.locationGroup || order.location_group)) {
      const orderLocation = order.locationGroup || order.location_group
      
      for (const paired of pairedAssignments) {
        if (paired.assignedOrders.length > 0 && paired.destinationGroup) {
          if (paired.destinationGroup !== orderLocation) {
            return false
          }
        }
      }
    }
  } else {
    // For non-paired vehicles, check individual capacity (enforce 95% limit)
    // CRITICAL: Use max capacity, not current totalWeight
    const maxAllowedWeight = assignment.capacity * 0.95
    if (assignment.totalWeight + orderWeight > maxAllowedWeight) {
      console.log(`  ✗ ${order.customerName} exceeds capacity: ${Math.round(assignment.totalWeight + orderWeight)}kg > ${Math.round(maxAllowedWeight)}kg (${assignment.vehicle.registration_number})`)
      return false
    }
  }

  // Check customer restrictions
  if (!checkCustomerRestrictions(customerName, restrictions)) {
    return false
  }

  // Check drum restrictions - reject immediately if vehicle can't support drums
  if (hasDrums) {
    if (!checkDrumRestrictions(drumCount, assignment, restrictions)) {
      return false
    }
  }

  // For paired vehicles without locationGroup, still enforce same destination
  if (isVehiclePaired(vehicleReg) && allAssignments) {
    const pairedRegs = getPairedVehicles(vehicleReg)
    const pairedAssignments = allAssignments.filter(a => 
      pairedRegs.includes(a.vehicle.registration_number) && a.vehicle.registration_number !== vehicleReg
    )
    
    for (const paired of pairedAssignments) {
      if (paired.assignedOrders.length > 0 && assignment.assignedOrders.length > 0) {
        // Both have orders - check if they're going to same general area
        const thisFirstOrder = assignment.assignedOrders[0]
        const pairedFirstOrder = paired.assignedOrders[0]
        
        if (thisFirstOrder.latitude && thisFirstOrder.longitude && 
            pairedFirstOrder.latitude && pairedFirstOrder.longitude) {
          const distance = haversineDistance(
            thisFirstOrder.latitude, thisFirstOrder.longitude,
            pairedFirstOrder.latitude, pairedFirstOrder.longitude
          )
          
          // If paired vehicles are going to different areas (>50km apart), reject
          if (distance > 50) {
            return false
          }
        }
      }
    }
  }

  return true
}

/**
 * Check customer-based restrictions
 * Parses restrictions like "no suzuki", "no hertz", "no avis"
 */
function checkCustomerRestrictions(
  customerName: string,
  restrictions: string
): boolean {
  // Extract restriction keywords
  const noPattern = /no\s+(\w+)/gi
  let match

  while ((match = noPattern.exec(restrictions)) !== null) {
    const restrictedCustomer = match[1].toLowerCase()
    if (customerName.includes(restrictedCustomer)) {
      return false
    }
  }

  return true
}

/**
 * Check drum-based restrictions
 * Handles: "no 210lt drums", "max 4x 210lt drums", "ideally no 210lt drums"
 */
function checkDrumRestrictions(
  drumCount: number,
  assignment: VehicleAssignment,
  restrictions: string
): boolean {
  // Check absolute drum prohibition
  if (restrictions.includes('no') && 
      restrictions.includes('210') && 
      restrictions.includes('drum') &&
      !restrictions.includes('ideally')) {
    return false
  }

  // Check max drum capacity
  const maxDrumMatch = restrictions.match(/max\s+(\d+)x?\s+210/i)
  if (maxDrumMatch) {
    const maxDrums = parseInt(maxDrumMatch[1])
    const currentDrums = assignment.assignedOrders.reduce(
      (sum, o) => sum + (o.drums || 0),
      0
    )
    if (currentDrums + drumCount > maxDrums) {
      return false
    }
  }

  // "ideally no drums" - deprioritize but don't block
  // This is handled in the sorting logic, not here

  return true
}

/**
 * Calculate priority score for vehicle assignment
 * Lower score = higher priority
 */
export function calculateVehiclePriority(
  assignment: VehicleAssignment,
  order: Order
): number {
  const restrictions = (assignment.vehicle.restrictions || '').toLowerCase()
  const hasDrums = (order.drums || 0) > 0
  let score = 0

  // Deprioritize vehicles with "ideally" restrictions
  if (hasDrums && restrictions.includes('ideally') && restrictions.includes('no') && restrictions.includes('drum')) {
    score += 1000
  }

  // Best-fit: prefer vehicles with less available space (better utilization)
  const availableSpace = assignment.capacity - assignment.totalWeight
  score += availableSpace

  return score
}

/**
 * Sort vehicles by priority for assignment
 * Paired vehicles are sorted independently but share destination
 */
export function sortVehiclesByPriority(
  vehicles: VehicleAssignment[],
  order: Order
): VehicleAssignment[] {
  return [...vehicles].sort((a, b) => {
    const scoreA = calculateVehiclePriority(a, order)
    const scoreB = calculateVehiclePriority(b, order)
    return scoreA - scoreB
  })
}

/**
 * Fetch available drivers from database
 */
export async function fetchAvailableDrivers(): Promise<Driver[]> {
  const supabase = createClient()
  
  try {
    const { data: driversData, error } = await supabase
      .from('drivers')
      .select('id, first_name, surname, available, license_code')
      .order('first_name')
    
    if (error) {
      console.error('Error fetching drivers:', error)
      return []
    }
    
    const drivers = driversData || []
    const availableDrivers = drivers.filter(d => d.available === true)
    
    if (availableDrivers.length === 0 && drivers.length > 0) {
      console.warn('No drivers marked as available, using all drivers')
      return drivers
    }
    
    return availableDrivers
  } catch (error) {
    console.error('Error fetching drivers:', error)
    return []
  }
}

/**
 * Reset all drivers to available status (for new day assignment)
 */
export async function resetAllDriversAvailable(): Promise<void> {
  const supabase = createClient()
  
  try {
    const { error } = await supabase
      .from('drivers')
      .update({ available: true })
      .neq('id', 0)
    
    if (error) {
      console.error('Error resetting driver availability:', error)
    } else {
      console.log('✓ Reset all drivers to available status')
    }
  } catch (error) {
    console.error('Error resetting driver availability:', error)
  }
}

/**
 * Check if driver has required license for vehicle
 * SA License Hierarchy: A/A1 (motorcycles) < B (light) < EB (light+trailer) < C1 (medium) < EC1 (medium+trailer) < C (heavy) < EC (heavy+trailer)
 */
function hasRequiredLicense(driver: Driver, vehicle: Vehicle): boolean {
  const license = (driver.license_code || '').toUpperCase().trim()
  const vehicleType = (vehicle.vehicle_type || vehicle.description || '').toLowerCase()
  const capacity = parseInt(vehicle.load_capacity?.toString()) || 0
  
  // Parse license codes (handle multiple: "Code 10, Code 14" or "B, C1, EC")
  const hasCode = (code: string) => license.includes(code.toUpperCase())
  
  // EC (Code 14) - Articulated heavy vehicles (truck + trailer) > 16,000kg
  if (vehicle.registration_number === 'CN30435' || vehicle.registration_number === 'Mission Trailer') {
    return hasCode('EC') || hasCode('CODE 14')
  }
  
  // C (Code 14) - Heavy vehicles > 16,000kg
  if (vehicleType.includes('taut') || capacity > 16000) {
    return hasCode('EC') || hasCode('C') || hasCode('CODE 14')
  }
  
  // EC1 - Medium articulated vehicles (truck + trailer) 3,501-16,000kg
  if ((vehicleType.includes('trailer') || vehicleType.includes('combo')) && capacity > 3500 && capacity <= 16000) {
    return hasCode('EC') || hasCode('EC1') || hasCode('C') || hasCode('CODE 14')
  }
  
  // C1 (Code 14) - Medium vehicles 3,501-16,000kg
  if (vehicleType.includes('8t') || vehicleType.includes('9m') || vehicleType.includes('14 ton') || 
      vehicleType.includes('14m') || vehicleType.includes('15m') || (capacity > 3500 && capacity <= 16000)) {
    return hasCode('EC') || hasCode('EC1') || hasCode('C') || hasCode('C1') || hasCode('CODE 14')
  }
  
  // EB - Light vehicles with trailer ≤ 3,500kg
  if ((vehicleType.includes('trailer') || vehicleType.includes('bakkie')) && capacity <= 3500) {
    return hasCode('EC') || hasCode('EC1') || hasCode('C') || hasCode('C1') || hasCode('EB') || hasCode('B') || hasCode('CODE 10') || hasCode('CODE 14')
  }
  
  // B (Code 10) - Light vehicles ≤ 3,500kg
  if (vehicleType.includes('bakkie') || vehicleType.includes('1 ton') || capacity <= 3500) {
    return hasCode('EC') || hasCode('EC1') || hasCode('C') || hasCode('C1') || hasCode('EB') || hasCode('B') || hasCode('CODE 10') || hasCode('CODE 14')
  }
  
  // Default: require C1 or higher for unknown commercial vehicles
  return hasCode('EC') || hasCode('EC1') || hasCode('C') || hasCode('C1') || hasCode('CODE 14')
}

/**
 * Assign drivers to a vehicle based on requirements and license codes
 * Returns assigned drivers and updates available drivers pool
 * PAIRED VEHICLES: CN30435 (bakkie) + Mission Trailer share the same driver
 */
export function assignDriversToVehicle(
  vehicle: Vehicle,
  availableDrivers: Driver[],
  requiredDriverCount: number = 1,
  allAssignments?: VehicleAssignment[]
): { assignedDrivers: Driver[], remainingDrivers: Driver[] } {
  // Mission Trailer ALWAYS shares drivers with CN30435 (bakkie)
  if (vehicle.registration_number === 'Mission Trailer') {
    // Find CN30435 assignment and use its drivers
    const bakkieAssignment = allAssignments?.find(a => a.vehicle.registration_number === 'CN30435')
    if (bakkieAssignment?.assignedDrivers && bakkieAssignment.assignedDrivers.length > 0) {
      console.log(`Mission Trailer using CN30435's driver(s): ${bakkieAssignment.assignedDrivers.map(d => `${d.first_name} ${d.surname}`).join(', ')}`)
      return { assignedDrivers: bakkieAssignment.assignedDrivers, remainingDrivers: availableDrivers }
    }
    // If CN30435 has no drivers yet, wait for it to be assigned first
    return { assignedDrivers: [], remainingDrivers: availableDrivers }
  }
  
  // CN30435 assigns drivers that will be shared with Mission Trailer
  if (vehicle.registration_number === 'CN30435') {
    // Check if Mission Trailer already has drivers assigned
    const trailerAssignment = allAssignments?.find(a => a.vehicle.registration_number === 'Mission Trailer')
    if (trailerAssignment?.assignedDrivers && trailerAssignment.assignedDrivers.length > 0) {
      console.log(`CN30435 using Mission Trailer's driver(s): ${trailerAssignment.assignedDrivers.map(d => `${d.first_name} ${d.surname}`).join(', ')}`)
      return { assignedDrivers: trailerAssignment.assignedDrivers, remainingDrivers: availableDrivers }
    }
  }
  
  // Filter drivers by license qualification
  const qualifiedDrivers = availableDrivers.filter(d => hasRequiredLicense(d, vehicle))
  
  // Sort qualified drivers by distance if available (closest first)
  const sortedDrivers = [...qualifiedDrivers].sort((a, b) => {
    if (a.distance !== undefined && b.distance !== undefined) {
      return a.distance - b.distance
    }
    if (a.distance !== undefined) return -1
    if (b.distance !== undefined) return 1
    return 0
  })
  
  // Take required number of drivers
  const assignedDrivers = sortedDrivers.slice(0, requiredDriverCount)
  const remainingDrivers = availableDrivers.filter(d => !assignedDrivers.includes(d))
  
  return { assignedDrivers, remainingDrivers }
}

/**
 * Calculate Haversine distance between two points in kilometers
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
 * Find nearest neighbor with capacity check
 */
function findNearestOrder(
  currentOrder: Order,
  remainingOrders: Order[],
  vehicle: VehicleAssignment,
  allAssignments: VehicleAssignment[]
): Order | null {
  if (!currentOrder.latitude || !currentOrder.longitude || remainingOrders.length === 0) {
    return null
  }
  
  let nearest: Order | null = null
  let minDistance = Infinity
  
  for (const order of remainingOrders) {
    if (order.latitude && order.longitude) {
      // Check if order can be assigned before calculating distance
      if (!canAssignOrderToVehicle(order, vehicle, allAssignments)) continue
      
      const distance = haversineDistance(
        currentOrder.latitude, currentOrder.longitude,
        order.latitude, order.longitude
      )
      if (distance < minDistance) {
        minDistance = distance
        nearest = order
      }
    }
  }
  
  return nearest
}

/**
 * Calculate centroid of a group of orders
 */
function calculateCentroid(orders: Order[]): { lat: number, lon: number } | null {
  const validOrders = orders.filter(o => o.latitude && o.longitude)
  if (validOrders.length === 0) return null
  
  const sumLat = validOrders.reduce((sum, o) => sum + o.latitude!, 0)
  const sumLon = validOrders.reduce((sum, o) => sum + o.longitude!, 0)
  
  return {
    lat: sumLat / validOrders.length,
    lon: sumLon / validOrders.length
  }
}

/**
 * Map zones to broader regions for better vehicle utilization
 */
function getRegionForZone(zone: string): string {
  const regionMap: Record<string, string> = {
    // Cape Town Metro
    'Mfuleni': 'Cape Town Metro',
    'Khayelitsha': 'Cape Town Metro',
    'Mitchells Plain': 'Cape Town Metro',
    'Cape Town CBD': 'Cape Town Metro',
    'Bellville': 'Cape Town Metro',
    'Parow': 'Cape Town Metro',
    'Goodwood': 'Cape Town Metro',
    'Table View': 'Cape Town Metro',
    'Milnerton': 'Cape Town Metro',
    
    // Northern Suburbs
    'Durbanville': 'Northern Suburbs',
    'Brackenfell': 'Northern Suburbs',
    'Kuils River': 'Northern Suburbs',
    
    // Southern Suburbs
    'Wynberg': 'Southern Suburbs',
    'Claremont': 'Southern Suburbs',
    'Constantia': 'Southern Suburbs',
    
    // West Coast
    'Porterville': 'West Coast',
    'Piketberg': 'West Coast',
    'Vredenburg': 'West Coast',
    
    // Boland
    'Stellenbosch': 'Boland',
    'Paarl': 'Boland',
    'Worcester': 'Boland',
    'Ceres': 'Boland',
    'Robertson': 'Boland',
    
    // Overberg
    'Somerset West': 'Overberg',
    'Strand': 'Overberg',
    'Hermanus': 'Overberg',
    'Caledon': 'Overberg',
    'Bredasdorp': 'Overberg',
    'Betty\'s Bay': 'Overberg',
    
    // Garden Route
    'Swellendam': 'Garden Route',
    'George': 'Garden Route',
    'Mossel Bay': 'Garden Route',
    'Oudtshoorn': 'Garden Route',
    'Knysna': 'Garden Route',
    'Plettenberg Bay': 'Garden Route',
    
    // KZN
    'Field\'s Hill': 'KwaZulu-Natal',
    'Durban': 'KwaZulu-Natal',
    'Pietermaritzburg': 'KwaZulu-Natal',
    
    // Northern Cape
    'Kimberley': 'Northern Cape',
    
    // Other
    'New Orleans': 'Other',
    'Theewaterskloof NU': 'Overberg'
  }
  
  return regionMap[zone] || 'Other'
}

/**
 * Generate region name based on geographic location
 * Uses proximity to known Cape Town areas
 */
function getRegionName(lat: number, lon: number): string {
  const regions = [
    { name: 'Cape Town CBD', lat: -33.9249, lon: 18.4241, radius: 5 },
    { name: 'Northern Suburbs', lat: -33.8600, lon: 18.6300, radius: 15 },
    { name: 'Southern Suburbs', lat: -34.0300, lon: 18.4600, radius: 12 },
    { name: 'Atlantic Seaboard', lat: -33.9400, lon: 18.3800, radius: 8 },
    { name: 'Bellville', lat: -33.8900, lon: 18.6300, radius: 10 },
    { name: 'Stellenbosch', lat: -33.9321, lon: 18.8602, radius: 15 },
    { name: 'Paarl', lat: -33.7340, lon: 18.9644, radius: 15 },
    { name: 'Worcester', lat: -33.6500, lon: 19.4500, radius: 20 },
    { name: 'Ceres', lat: -33.3690, lon: 19.3120, radius: 25 },
    { name: 'Robertson', lat: -33.8000, lon: 19.8833, radius: 20 },
    { name: 'Swellendam', lat: -34.0333, lon: 20.4333, radius: 20 },
    { name: 'George', lat: -33.9630, lon: 22.4610, radius: 25 },
    { name: 'Mossel Bay', lat: -34.1833, lon: 22.1333, radius: 20 },
    { name: 'Oudtshoorn', lat: -33.5833, lon: 22.2000, radius: 20 },
    { name: 'Knysna', lat: -34.0364, lon: 23.0471, radius: 20 },
    { name: 'Plettenberg Bay', lat: -34.0500, lon: 23.3667, radius: 15 },
    { name: 'Somerset West', lat: -34.0781, lon: 18.8419, radius: 12 },
    { name: 'Strand', lat: -34.1167, lon: 18.8167, radius: 10 },
    { name: 'Hermanus', lat: -34.4167, lon: 19.2333, radius: 15 },
    { name: 'Caledon', lat: -34.2333, lon: 19.4333, radius: 15 },
    { name: 'Bredasdorp', lat: -34.5333, lon: 20.0333, radius: 15 },
    { name: 'Mitchells Plain', lat: -34.0514, lon: 18.6286, radius: 8 },
    { name: 'Khayelitsha', lat: -34.0500, lon: 18.6700, radius: 10 },
    { name: 'Table View', lat: -33.8167, lon: 18.4833, radius: 8 },
    { name: 'Milnerton', lat: -33.8667, lon: 18.5000, radius: 8 },
    { name: 'Durbanville', lat: -33.8333, lon: 18.6500, radius: 10 },
    { name: 'Brackenfell', lat: -33.8667, lon: 18.7000, radius: 8 },
    { name: 'Kuils River', lat: -33.9333, lon: 18.6833, radius: 8 },
    { name: 'Goodwood', lat: -33.9167, lon: 18.5500, radius: 6 },
    { name: 'Parow', lat: -33.9000, lon: 18.5833, radius: 6 },
    { name: 'Wynberg', lat: -34.0000, lon: 18.4667, radius: 6 },
    { name: 'Claremont', lat: -33.9833, lon: 18.4667, radius: 5 },
    { name: 'Constantia', lat: -34.0333, lon: 18.4667, radius: 8 },
    { name: 'Hout Bay', lat: -34.0333, lon: 18.3500, radius: 8 },
    { name: 'Fish Hoek', lat: -34.1333, lon: 18.4333, radius: 6 },
    { name: 'Simons Town', lat: -34.1917, lon: 18.4333, radius: 6 }
  ]
  
  // Find closest region within radius
  let closestRegion = null
  let minDistance = Infinity
  
  for (const region of regions) {
    const distance = haversineDistance(lat, lon, region.lat, region.lon)
    if (distance <= region.radius && distance < minDistance) {
      minDistance = distance
      closestRegion = region.name
    }
  }
  
  // If no match, use distance-based naming
  if (!closestRegion) {
    const capeTownDistance = haversineDistance(lat, lon, -33.9249, 18.4241)
    if (capeTownDistance < 50) {
      return 'Cape Town Area'
    } else if (capeTownDistance < 100) {
      return 'Western Cape (50-100km)'
    } else if (capeTownDistance < 200) {
      return 'Western Cape (100-200km)'
    } else {
      return 'Western Cape (200km+)'
    }
  }
  
  return closestRegion
}

/**
 * Optimize ROUND TRIP route using Geoapify Route Planner (truck mode)
 * Solves TSP for FASTEST route: Depot → Customers → Depot
 * Optimizes for speed and avoids tolls
 */
async function optimizeRouteWithDepot(
  orders: Order[],
  depotLat: number,
  depotLon: number
): Promise<{ orders: Order[], distance: number, duration: number, geometry?: any }> {
  const validOrders = orders.filter(o => o.latitude && o.longitude)
  const invalidOrders = orders.filter(o => !o.latitude || !o.longitude)
  
  if (validOrders.length === 0) {
    return { orders, distance: 0, duration: 0 }
  }
  
  if (validOrders.length === 1) {
    const { distance, duration } = calculateRouteMetrics(orders, depotLat, depotLon)
    return { orders, distance, duration }
  }
  
  try {
    const customers: Customer[] = validOrders.map((o, idx) => ({
      id: `job-${idx}`,
      name: o.customerName,
      latitude: o.latitude!,
      longitude: o.longitude!,
      weight: Math.round(o.totalWeight || (o.drums || 0) * 200),
      deliveryDuration: 300
    }))
    
    const vehicle: GeoVehicle = {
      id: 'route-optimizer',
      name: 'Route Optimizer',
      capacity: 999999,
      startLocation: { lat: depotLat, lng: depotLon }
    }
    
    console.log(`  Optimizing ${customers.length} stops with Geoapify truck mode...`)
    const routes = await optimizeMultiVehicleRoutes([vehicle], customers, { lat: depotLat, lng: depotLon })
    
    if (routes.length > 0 && routes[0].customers.length === customers.length) {
      const optimized = routes[0].customers.map(c => 
        orders.find(o => o.customerName === c.name)
      ).filter(Boolean) as Order[]
      
      console.log(`  ✓ Optimized: ${routes[0].totalDistance.toFixed(1)}km, ${routes[0].totalDuration.toFixed(0)}min`)
      
      return {
        orders: [...optimized, ...invalidOrders],
        distance: routes[0].totalDistance,
        duration: routes[0].totalDuration,
        geometry: routes[0].geometry
      }
    }
  } catch (error) {
    console.error(`  ✗ Geoapify optimization failed:`, error)
  }
  
  // Fallback: nearest neighbor + metrics
  console.log(`  Using nearest neighbor fallback`)
  const optimized = optimizeRouteNearestNeighbor(orders, depotLat, depotLon)
  const { distance, duration } = calculateRouteMetrics(optimized, depotLat, depotLon)
  
  return { orders: optimized, distance, duration }
}



/**
 * Fallback: Nearest neighbor with 2-opt improvement for ROUND TRIP
 */
function optimizeRouteNearestNeighbor(
  orders: Order[],
  depotLat: number,
  depotLon: number
): Order[] {
  const validOrders = orders.filter(o => o.latitude && o.longitude)
  const invalidOrders = orders.filter(o => !o.latitude || !o.longitude)
  
  if (validOrders.length === 0) return orders
  if (validOrders.length === 1) return orders
  
  console.log(`  Using nearest neighbor + 2-opt for ${validOrders.length} stops`)
  
  // Build route: always pick nearest unvisited customer
  const route: Order[] = []
  const unvisited = [...validOrders]
  let currentLat = depotLat
  let currentLon = depotLon
  
  while (unvisited.length > 0) {
    // Find nearest customer from current position
    let nearestIdx = 0
    let minDist = haversineDistance(currentLat, currentLon, unvisited[0].latitude!, unvisited[0].longitude!)
    
    for (let i = 1; i < unvisited.length; i++) {
      const dist = haversineDistance(currentLat, currentLon, unvisited[i].latitude!, unvisited[i].longitude!)
      if (dist < minDist) {
        minDist = dist
        nearestIdx = i
      }
    }
    
    const nearest = unvisited[nearestIdx]
    route.push(nearest)
    unvisited.splice(nearestIdx, 1)
    currentLat = nearest.latitude!
    currentLon = nearest.longitude!
  }
  
  // 2-opt: Eliminate crossings by reversing segments
  let improved = true
  let iterations = 0
  const maxIterations = Math.min(100, route.length * 2)
  
  while (improved && iterations++ < maxIterations) {
    improved = false
    for (let i = 0; i < route.length - 1; i++) {
      for (let j = i + 1; j < route.length; j++) {
        // Calculate total distance with current order
        const d1 = i === 0 ? 
          haversineDistance(depotLat, depotLon, route[i].latitude!, route[i].longitude!) :
          haversineDistance(route[i-1].latitude!, route[i-1].longitude!, route[i].latitude!, route[i].longitude!)
        const d2 = j === route.length - 1 ?
          haversineDistance(route[j].latitude!, route[j].longitude!, depotLat, depotLon) :
          haversineDistance(route[j].latitude!, route[j].longitude!, route[j+1].latitude!, route[j+1].longitude!)
        
        // Calculate distance if we reverse segment [i...j]
        const d3 = i === 0 ?
          haversineDistance(depotLat, depotLon, route[j].latitude!, route[j].longitude!) :
          haversineDistance(route[i-1].latitude!, route[i-1].longitude!, route[j].latitude!, route[j].longitude!)
        const d4 = j === route.length - 1 ?
          haversineDistance(route[i].latitude!, route[i].longitude!, depotLat, depotLon) :
          haversineDistance(route[i].latitude!, route[i].longitude!, route[j+1].latitude!, route[j+1].longitude!)
        
        if (d3 + d4 < d1 + d2) {
          // Reverse segment [i...j]
          const segment = route.slice(i, j + 1).reverse()
          route.splice(i, j - i + 1, ...segment)
          improved = true
        }
      }
    }
  }
  
  console.log(`  ✓ 2-opt completed in ${iterations} iterations`)
  
  return [...route, ...invalidOrders]
}



/**
 * Calculate ROUND TRIP metrics: Depot → All Customers → Depot
 * Returns total distance and estimated duration
 */
function calculateRouteMetrics(
  orders: Order[],
  depotLat: number,
  depotLon: number
): { distance: number; duration: number } {
  const validOrders = orders.filter(o => o.latitude && o.longitude)
  
  if (validOrders.length === 0) {
    return { distance: 0, duration: 0 }
  }
  
  let totalDistance = 0
  
  // 1. Depot → First Customer
  totalDistance += haversineDistance(
    depotLat, depotLon,
    validOrders[0].latitude!, validOrders[0].longitude!
  )
  
  // 2. Customer → Customer (all stops)
  for (let i = 0; i < validOrders.length - 1; i++) {
    totalDistance += haversineDistance(
      validOrders[i].latitude!, validOrders[i].longitude!,
      validOrders[i + 1].latitude!, validOrders[i + 1].longitude!
    )
  }
  
  // 3. Last Customer → Depot (COMPLETE THE ROUND TRIP)
  totalDistance += haversineDistance(
    validOrders[validOrders.length - 1].latitude!,
    validOrders[validOrders.length - 1].longitude!,
    depotLat, depotLon
  )
  
  // Duration: 60 km/h average + 15 min per stop
  const drivingTime = totalDistance / 60 // hours
  const stopTime = validOrders.length * 0.25 // 15 min per stop in hours
  const totalDuration = (drivingTime + stopTime) * 60 // Convert to minutes
  
  return {
    distance: Math.round(totalDistance * 10) / 10,
    duration: Math.round(totalDuration)
  }
}



/**
 * Enhanced vehicle assignment with GEOGRAPHIC CLUSTERING
 * PRIORITY: 1) Geographic proximity 2) Vehicle restrictions 3) Capacity optimization
 * When items are already assigned, uses vehicle's current weight as starting point
 */
export async function assignVehiclesWithDrivers(
  orders: Order[],
  vehicles: Vehicle[],
  requiredDriversPerVehicle: number = 1,
  maxOrdersToAssign?: number
): Promise<VehicleAssignment[]> {
  // ═══════════════════════════════════════════════════════════════
  // NEW APPROACH: ROUTE-FIRST PLANNING
  // 1. Map locations → 2. Group regions → 3. Plan routes → 4. Assign vehicles
  // ═══════════════════════════════════════════════════════════════
  
  console.log(`\n╔═══════════════════════════════════════════════════════════╗`)
  console.log(`║           ROUTE-FIRST VEHICLE ASSIGNMENT                  ║`)
  console.log(`╚═══════════════════════════════════════════════════════════╝`)
  
  // Fetch available drivers
  const availableDrivers = await fetchAvailableDrivers()
  console.log(`Fetched ${availableDrivers.length} available drivers for assignment`)
  let remainingDrivers = [...availableDrivers]
  
  // Initialize vehicle assignments (check for existing loads)
  const assignments: VehicleAssignment[] = vehicles.map(vehicle => {
    const existingOrders = orders.filter(o => (o as any).assigned_vehicle_id === vehicle.id)
    const existingWeight = existingOrders.reduce((sum, o) => sum + (o.totalWeight || (o.drums || 0) * 200), 0)
    const capacity = parseInt(vehicle.load_capacity?.toString()) || 0
    
    return {
      vehicle,
      assignedOrders: existingOrders,
      totalWeight: existingWeight,
      capacity,
      utilization: capacity > 0 ? (existingWeight / capacity) * 100 : 0,
      destinationGroup: undefined,
      assignedDrivers: [],
      startingWeight: existingWeight
    }
  })
  
  // ROUTE-FIRST PLANNING: Plan optimal routes before assigning vehicles
  const plannedRoutes = await planRoutesFirst(orders, vehicles, {
    maxRegionDistance: 100, // Merge regions within 100km (tighter grouping)
    targetRouteWeight: 2500 // Target 2500kg per route (smaller routes = more vehicles)
  })
  
  // Assign vehicles to planned routes
  const routeVehicleMap = assignVehiclesToRoutes(plannedRoutes, vehicles)
  
  // Apply planned routes to assignments
  console.log(`\n=== APPLYING PLANNED ROUTES TO VEHICLES ===`)
  for (const [route, vehicle] of routeVehicleMap) {
    const assignment = assignments.find(a => a.vehicle.id === vehicle.id)
    if (assignment) {
      assignment.assignedOrders = route.orders
      assignment.totalWeight = route.totalWeight
      assignment.utilization = (route.totalWeight / assignment.capacity) * 100
      assignment.destinationGroup = route.region
      console.log(`  ✓ ${vehicle.registration_number}: ${route.name} (${route.orders.length} orders, ${Math.round(assignment.utilization)}%)`)  
    }
  }
  
  // Track unassigned orders from route planning
  const assignedOrders = new Set(Array.from(routeVehicleMap.keys()).flatMap(r => r.orders))
  let unassignedOrders = orders.filter(o => !assignedOrders.has(o))
  console.log(`Unassigned after route planning: ${unassignedOrders.length} orders`)
  
  console.log(`\n=== VEHICLE CAPACITY SUMMARY ===`)
  const activeVehicles = assignments.filter(a => a.assignedOrders.length > 0)
  console.log(`Active vehicles: ${activeVehicles.length}/${assignments.length}`)
  for (const assignment of activeVehicles) {
    console.log(`  ${assignment.vehicle.registration_number}: ${assignment.assignedOrders.length} orders, ${Math.round(assignment.totalWeight)}kg, ${Math.round(assignment.utilization)}% full`)
  }
  
  // Skip all old logic - route-first planning already handled everything
  console.log(`\n=== SKIPPING OLD ASSIGNMENT LOGIC (Using Route-First Results) ===`)
  
  // Assign drivers to vehicles with orders
  console.log(`\n=== DRIVER ASSIGNMENT ===`)
  
  // Sort assignments to ensure CN30435 is processed before Mission Trailer
  const sortedAssignments = [...assignments].sort((a, b) => {
    if (a.vehicle.registration_number === 'CN30435') return -1
    if (b.vehicle.registration_number === 'CN30435') return 1
    if (a.vehicle.registration_number === 'Mission Trailer') return 1
    if (b.vehicle.registration_number === 'Mission Trailer') return -1
    return 0
  })
  
  for (const vehicle of sortedAssignments) {
    if (vehicle.assignedOrders.length > 0 && vehicle.assignedDrivers!.length === 0 && remainingDrivers.length > 0) {
      const { assignedDrivers, remainingDrivers: newRemainingDrivers } = assignDriversToVehicle(
        vehicle.vehicle,
        remainingDrivers,
        requiredDriversPerVehicle,
        assignments
      )
      vehicle.assignedDrivers = assignedDrivers
      
      if (vehicle.vehicle.registration_number !== 'Mission Trailer') {
        remainingDrivers = newRemainingDrivers
      }
      
      if (assignedDrivers.length > 0) {
        console.log(`${vehicle.vehicle.registration_number}: ${assignedDrivers.map(d => `${d.first_name} ${d.surname}`).join(', ')}`)
      }
    }
  }
  
  // Optimize route sequences
  console.log('\n=== ROUTE SEQUENCE OPTIMIZATION ===')
  const DEPOT_LAT = -33.9249
  const DEPOT_LON = 18.6369
  
  for (const assignment of assignments) {
    if (assignment.assignedOrders.length > 0) {
      console.log(`${assignment.vehicle.registration_number}: ${assignment.assignedOrders.length} stops`)
      
      const result = await optimizeRouteWithDepot(
        assignment.assignedOrders,
        DEPOT_LAT,
        DEPOT_LON
      )
      
      assignment.assignedOrders = result.orders
      assignment.routeDistance = result.distance
      assignment.routeDuration = result.duration
      
      if (result.geometry) {
        (assignment as any).routeGeometry = result.geometry
      }
    }
  }
  
  return assignments
}

// OLD CODE BELOW - DISABLED
/*
  // Apply order limit if specified
  if (maxOrdersToAssign && maxOrdersToAssign > 0) {
    console.log(`\n⚠️ LIMITING ASSIGNMENT TO ${maxOrdersToAssign} ORDERS`)
    sortedOrders = sortedOrders.slice(0, maxOrdersToAssign)
  }
  
  // STEP 0: SMART GEOGRAPHIC CLUSTERING (Optimize for fewer vehicles)
  console.log(`\n=== STEP 0: SMART GEOGRAPHIC CLUSTERING ===`)
  const ordersWithCoords = orders.filter(o => o.latitude && o.longitude)
  const clusters: Order[][] = []
  const clustered = new Set<Order>()
  
  // Calculate total weight to determine optimal cluster size
  const totalWeight = ordersWithCoords.reduce((sum, o) => sum + (o.totalWeight || 0), 0)
  const avgVehicleCapacity = vehicles.reduce((sum, v) => sum + v.load_capacity, 0) / vehicles.length
  const estimatedVehiclesNeeded = Math.ceil(totalWeight / (avgVehicleCapacity * 0.85))
  
  console.log(`Total weight: ${Math.round(totalWeight)}kg, Avg vehicle capacity: ${Math.round(avgVehicleCapacity)}kg`)
  console.log(`Estimated vehicles needed: ${estimatedVehiclesNeeded}`)
  
  // Use adaptive clustering radius based on order density
  const INITIAL_RADIUS = 40 // Start with 40km radius for better consolidation
  
  for (const order of ordersWithCoords) {
    if (clustered.has(order)) continue
    
    const cluster: Order[] = [order]
    clustered.add(order)
    let clusterWeight = order.totalWeight || 0
    
    // Build cluster until it reaches ~80% of average vehicle capacity or radius limit
    const targetWeight = avgVehicleCapacity * 0.80
    
    // Find all orders within radius of cluster centroid
    let addedToCluster = true
    while (addedToCluster && clusterWeight < targetWeight) {
      addedToCluster = false
      const centroid = calculateCentroid(cluster)
      if (!centroid) break
      
      // Find nearest unclustered order to centroid
      let nearestOrder: Order | null = null
      let minDist = Infinity
      
      for (const other of ordersWithCoords) {
        if (clustered.has(other)) continue
        
        const dist = haversineDistance(
          centroid.lat, centroid.lon,
          other.latitude!, other.longitude!
        )
        
        if (dist <= INITIAL_RADIUS && dist < minDist) {
          minDist = dist
          nearestOrder = other
        }
      }
      
      if (nearestOrder) {
        cluster.push(nearestOrder)
        clustered.add(nearestOrder)
        clusterWeight += nearestOrder.totalWeight || 0
        addedToCluster = true
      }
    }
    
    clusters.push(cluster)
  }
  
  // Reverse geocode cluster centroids to get suburb names
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
  for (let idx = 0; idx < clusters.length; idx++) {
    const cluster = clusters[idx]
    const centroid = calculateCentroid(cluster)
    const clusterWeight = cluster.reduce((s, o) => s + (o.totalWeight || 0), 0)
    let zoneName = `Zone ${idx + 1}`
    
    if (centroid && mapboxToken) {
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${centroid.lon},${centroid.lat}.json?access_token=${mapboxToken}&types=place,locality,neighborhood`
        )
        const data = await response.json()
        if (data.features?.[0]) {
          zoneName = data.features[0].text || data.features[0].place_name?.split(',')[0] || zoneName
        }
      } catch (error) {
        console.error(`Failed to reverse geocode cluster ${idx + 1}:`, error)
      }
    }
    
    cluster.forEach(order => {
      order.location_group = zoneName
      ;(order as any).location_group = zoneName
      ;(order as any).locationGroup = zoneName
    })
    
    const vehiclesNeeded = Math.ceil(clusterWeight / (avgVehicleCapacity * 0.85))
    console.log(`Cluster ${idx + 1}: ${zoneName} (${cluster.length} orders, ${Math.round(clusterWeight)}kg, ~${vehiclesNeeded} vehicle${vehiclesNeeded > 1 ? 's' : ''})`)
  }
  
  console.log(`\nCreated ${clusters.length} optimized clusters (target: ${estimatedVehiclesNeeded} vehicles)`)
  console.log(`Clustering strategy: Build clusters up to ${Math.round(avgVehicleCapacity * 0.80)}kg within ${INITIAL_RADIUS}km radius`)
  
  // Sort orders by priority
  let sortedOrders = [...orders].sort((a, b) => {
    const priorityA = (a as any).priority || 0
    const priorityB = (b as any).priority || 0
    return priorityB - priorityA
  })
  

  
  // STEP 1: Filter compatible vehicles for each order
  console.log(`\n=== STEP 1: FILTER COMPATIBLE VEHICLES ===`)
  const validOrders = sortedOrders.filter(o => o.latitude && o.longitude)
  
  // Analyze which vehicles can handle which orders
  const orderVehicleCompatibility = new Map<Order, Vehicle[]>()
  for (const order of validOrders) {
    const compatibleVehicles: Vehicle[] = []
    const orderWeight = order.totalWeight || (order.drums || 0) * 200
    const hasDrums = (order.drums || 0) > 0
    const drumCount = order.drums || 0
    
    for (const assignment of assignments) {
      const vehicle = assignment.vehicle
      const restrictions = (vehicle.restrictions || '').toLowerCase()
      const customerName = (order.customerName || '').toLowerCase()
      
      // Check capacity - use remaining capacity after starting weight
      const remainingCapacity = assignment.capacity - (assignment.startingWeight || 0)
      if (orderWeight > remainingCapacity) continue
      
      // Check customer restrictions
      const noPattern = /no\s+(\w+)/gi
      let customerBlocked = false
      let match
      while ((match = noPattern.exec(restrictions)) !== null) {
        const restrictedCustomer = match[1].toLowerCase()
        if (customerName.includes(restrictedCustomer)) {
          customerBlocked = true
          break
        }
      }
      if (customerBlocked) continue
      
      // Check drum restrictions
      if (hasDrums) {
        // Absolute prohibition
        if (restrictions.includes('no') && restrictions.includes('210') && 
            restrictions.includes('drum') && !restrictions.includes('ideally')) {
          continue
        }
        
        // Max drum capacity
        const maxDrumMatch = restrictions.match(/max\s+(\d+)x?\s+210/i)
        if (maxDrumMatch) {
          const maxDrums = parseInt(maxDrumMatch[1])
          if (drumCount > maxDrums) continue
        }
      }
      
      compatibleVehicles.push(vehicle)
    }
    
    orderVehicleCompatibility.set(order, compatibleVehicles)
    if (compatibleVehicles.length === 0) {
      console.log(`  ⚠️ ${order.customerName}: No compatible vehicles (${orderWeight}kg${hasDrums ? `, ${drumCount} drums` : ''})`)
    }
  }
  
  console.log(`  Analyzed ${validOrders.length} orders for vehicle compatibility`)
  
  // STEP 2A: Separate orders by restrictions (drums, customer restrictions)
  console.log(`\n=== STEP 2A: SEPARATE ORDERS BY RESTRICTIONS ===`)
  const drumOrders: Order[] = []
  const customerRestrictedOrders: Order[] = []
  const unrestrictedOrders: Order[] = []
  
  for (const order of validOrders) {
    const hasDrums = (order.drums || 0) > 0
    const customerName = (order.customerName || '').toLowerCase()
    
    // Check customer restrictions
    let hasCustomerRestriction = false
    for (const assignment of assignments) {
      const restrictions = (assignment.vehicle.restrictions || '').toLowerCase()
      const noPattern = /no\s+(\w+)/gi
      let match
      while ((match = noPattern.exec(restrictions)) !== null) {
        const restrictedCustomer = match[1].toLowerCase()
        if (customerName.includes(restrictedCustomer)) {
          hasCustomerRestriction = true
          break
        }
      }
      if (hasCustomerRestriction) break
    }
    
    if (hasDrums) {
      drumOrders.push(order)
    } else if (hasCustomerRestriction) {
      customerRestrictedOrders.push(order)
    } else {
      unrestrictedOrders.push(order)
    }
  }
  
  console.log(`Separated: ${drumOrders.length} drum orders, ${customerRestrictedOrders.length} customer-restricted, ${unrestrictedOrders.length} unrestricted`)
  
  // Assign drum orders to vehicles that accept drums
  console.log(`\n=== ASSIGNING REMAINING DRUM ORDERS ===`)
  const stillUnassigned: Order[] = []
  
  for (const order of drumOrders) {
    const orderWeight = order.totalWeight || (order.drums || 0) * 200
    const zone = order.location_group || 'Unknown'
    let assigned = false
    
    // Find vehicles that can accept drums in same zone, sorted by capacity
    const drumVehicles = assignments
      .filter(a => canAssignOrderToVehicle(order, a, assignments))
      .sort((a, b) => b.capacity - a.capacity)
    
    for (const vehicle of drumVehicles) {
      const maxAllowed = vehicle.capacity * 0.95
      const newWeight = vehicle.totalWeight + orderWeight
      
      // CRITICAL: Enforce capacity limit strictly
      if (newWeight <= maxAllowed && canAssignOrderToVehicle(order, vehicle, assignments)) {
        vehicle.assignedOrders.push(order)
        vehicle.totalWeight = newWeight
        vehicle.utilization = (vehicle.totalWeight / vehicle.capacity) * 100
        vehicle.destinationGroup = zone
        console.log(`  ✓ ${order.customerName} → ${vehicle.vehicle.registration_number} [DRUMS: ${order.drums}] (${orderWeight}kg, ${Math.round(vehicle.utilization)}% full)`)
        assigned = true
        break
      } else {
        console.log(`  ✗ ${order.customerName} would exceed ${vehicle.vehicle.registration_number} capacity: ${Math.round(newWeight)}kg > ${Math.round(maxAllowed)}kg`)
      }
    }
    
    if (!assigned) {
      stillUnassigned.push(order)
      console.log(`  ✗ ${order.customerName} - No vehicle accepts ${order.drums} drums`)
    }
  }
  
  // Assign customer-restricted orders
  console.log(`\n=== ASSIGNING CUSTOMER-RESTRICTED ORDERS ===`)
  for (const order of customerRestrictedOrders) {
    const orderWeight = order.totalWeight || (order.drums || 0) * 200
    const zone = order.location_group || 'Unknown'
    let assigned = false
    
    const compatibleVehicles = assignments
      .filter(a => canAssignOrderToVehicle(order, a, assignments))
      .sort((a, b) => b.capacity - a.capacity)
    
    for (const vehicle of compatibleVehicles) {
      const maxAllowed = vehicle.capacity * 0.95
      const newWeight = vehicle.totalWeight + orderWeight
      
      // CRITICAL: Enforce capacity limit strictly
      if (newWeight <= maxAllowed && canAssignOrderToVehicle(order, vehicle, assignments)) {
        vehicle.assignedOrders.push(order)
        vehicle.totalWeight = newWeight
        vehicle.utilization = (vehicle.totalWeight / vehicle.capacity) * 100
        vehicle.destinationGroup = zone
        console.log(`  ✓ ${order.customerName} → ${vehicle.vehicle.registration_number} (${orderWeight}kg, ${Math.round(vehicle.utilization)}% full)`)
        assigned = true
        break
      } else {
        console.log(`  ✗ ${order.customerName} would exceed ${vehicle.vehicle.registration_number} capacity: ${Math.round(newWeight)}kg > ${Math.round(maxAllowed)}kg`)
      }
    }
    
    if (!assigned) {
      stillUnassigned.push(order)
      console.log(`  ✗ ${order.customerName} - No compatible vehicle`)
    }
  }
  
  // Update unassignedOrders with stillUnassigned
  unassignedOrders = stillUnassigned
  
  // STEP 2B: BIN PACKING OPTIMIZATION (Minimize Vehicles)
  console.log(`\n=== STEP 2B: BIN PACKING OPTIMIZATION (Minimize Vehicles) ===`)
  
  // Use bin packing optimizer for better vehicle utilization
  const binPackedAssignments = binPackingOptimizer(unrestrictedOrders, vehicles, 0.85)
  
  // Apply bin packing results to assignments
  for (let i = 0; i < assignments.length; i++) {
    const binPacked = binPackedAssignments[i]
    if (binPacked.assignedOrders.length > 0) {
      assignments[i].assignedOrders = binPacked.assignedOrders
      assignments[i].totalWeight = binPacked.totalWeight
      assignments[i].utilization = binPacked.utilization
      assignments[i].destinationGroup = binPacked.destinationGroup
    }
  }
  
  // Remove assigned orders from unassigned list
  const binPackedOrders = new Set(binPackedAssignments.flatMap(a => a.assignedOrders))
  const remainingAfterBinPacking = unrestrictedOrders.filter(o => !binPackedOrders.has(o))
  unassignedOrders.push(...remainingAfterBinPacking)
  
  console.log(`Bin packing complete: ${binPackedAssignments.filter(a => a.assignedOrders.length > 0).length} vehicles used`)
  
  // FALLBACK: CLARKE-WRIGHT SAVINGS ALGORITHM (if bin packing leaves orders)
  console.log(`\n=== FALLBACK: CLARKE-WRIGHT FOR REMAINING ORDERS ===`)
  
  const remainingUnassigned: Order[] = []
  
  if (unrestrictedOrders.length > 0) {
    const DEPOT_LAT = -33.9249
    const DEPOT_LON = 18.6369
    
    // Filter orders with valid coordinates
    const validOrders = unrestrictedOrders.filter(o => o.latitude && o.longitude)
    console.log(`Processing ${validOrders.length} orders with coordinates`)
    
    // Step 1: Calculate savings matrix (Clarke-Wright)
    const savings = []
    for (let i = 0; i < validOrders.length; i++) {
      for (let j = i + 1; j < validOrders.length; j++) {
        const orderI = validOrders[i]
        const orderJ = validOrders[j]
        
        const distDepotI = haversineDistance(DEPOT_LAT, DEPOT_LON, orderI.latitude!, orderI.longitude!)
        const distDepotJ = haversineDistance(DEPOT_LAT, DEPOT_LON, orderJ.latitude!, orderJ.longitude!)
        const distIJ = haversineDistance(orderI.latitude!, orderI.longitude!, orderJ.latitude!, orderJ.longitude!)
        
        // Savings = distance saved by combining routes
        const savingsValue = distDepotI + distDepotJ - distIJ
        
        savings.push({
          i, j, orderI, orderJ, savings: savingsValue,
          weightI: orderI.totalWeight || (orderI.drums || 0) * 200,
          weightJ: orderJ.totalWeight || (orderJ.drums || 0) * 200
        })
      }
    }
    
    // Step 2: Sort savings in descending order
    savings.sort((a, b) => b.savings - a.savings)
    console.log(`Generated ${savings.length} savings pairs, max savings: ${Math.round(savings[0]?.savings || 0)}km`)
    
    // Step 3: Build routes using savings
    const routes = []
    const assignedOrderIds = new Set()
    
    for (const saving of savings) {
      // Skip if either order already assigned
      if (assignedOrderIds.has(saving.i) || assignedOrderIds.has(saving.j)) continue
      
      const totalWeight = saving.weightI + saving.weightJ
      
      // Find compatible vehicle for this route - PRIORITIZE PAIRED VEHICLES
      let bestVehicle = null
      
      // SPECIAL RULE: Only pair Mission Trailer + CN30435 if there's enough load (>800kg total)
      const isKimberleyRoute = saving.orderI.location_group === 'Kimberley' || saving.orderJ.location_group === 'Kimberley'
      const hasEnoughLoadForPairing = totalWeight >= 800 // Minimum load to justify pairing
      
      if (isKimberleyRoute && hasEnoughLoadForPairing) {
        // NEW RULE: Only pair if there's sufficient load to justify both vehicles
        const missionTrailer = assignments.find(v => v.vehicle.registration_number === 'Mission Trailer')
        const cn30435 = assignments.find(v => v.vehicle.registration_number === 'CN30435')
        
        if (missionTrailer && cn30435 && 
            missionTrailer.assignedOrders.length === 0 && cn30435.assignedOrders.length === 0) {
          // Check combined capacity of paired vehicles
          const combinedCapacity = missionTrailer.capacity + cn30435.capacity
          if (combinedCapacity * 0.95 >= totalWeight &&
              canAssignOrderToVehicle(saving.orderI, missionTrailer, assignments) &&
              canAssignOrderToVehicle(saving.orderJ, missionTrailer, assignments)) {
            
            // Assign to CN30435 first (vehicle, not trailer)
            bestVehicle = cn30435
            console.log(`  🔗 Paired assignment: CN30435 + Mission Trailer for Kimberley route (${totalWeight}kg load)`)
          }
        }
      }
      
      // For lighter Kimberley loads or other routes, use single vehicles
      if (!bestVehicle && isKimberleyRoute) {
        const missionTrailer = assignments.find(v => v.vehicle.registration_number === 'Mission Trailer')
        const cn30435 = assignments.find(v => v.vehicle.registration_number === 'CN30435')
        
        if (cn30435 && cn30435.assignedOrders.length === 0 && 
            cn30435.capacity * 0.95 >= totalWeight &&
            canAssignOrderToVehicle(saving.orderI, cn30435, assignments) &&
            canAssignOrderToVehicle(saving.orderJ, cn30435, assignments)) {
          bestVehicle = cn30435
        } else if (missionTrailer && missionTrailer.assignedOrders.length === 0 && 
            missionTrailer.capacity * 0.95 >= totalWeight &&
            canAssignOrderToVehicle(saving.orderI, missionTrailer, assignments) &&
            canAssignOrderToVehicle(saving.orderJ, missionTrailer, assignments)) {
          bestVehicle = missionTrailer
        }
      }
      
      // If no paired vehicle selected, use normal logic
      if (!bestVehicle) {
        for (const vehicle of assignments) {
          if (vehicle.assignedOrders.length > 0) continue // Skip used vehicles
          const remainingCapacity = vehicle.capacity * 0.95 - vehicle.totalWeight
          if (remainingCapacity < totalWeight) continue // Skip insufficient capacity
          
          // Check restrictions for both orders
          if (!canAssignOrderToVehicle(saving.orderI, vehicle, assignments)) continue
          if (!canAssignOrderToVehicle(saving.orderJ, vehicle, assignments)) continue
          
          bestVehicle = vehicle
          break
        }
      }
      
      if (bestVehicle) {
        // Create new route
        const route = [saving.orderI, saving.orderJ]
        bestVehicle.assignedOrders = route
        bestVehicle.totalWeight = totalWeight
        bestVehicle.utilization = (totalWeight / bestVehicle.capacity) * 100
        bestVehicle.destinationGroup = saving.orderI.location_group || saving.orderJ.location_group
        
        // NEW RULE: Only prepare Mission Trailer for pairing if CN30435 has enough load to justify both vehicles
        if (bestVehicle.vehicle.registration_number === 'CN30435' && totalWeight >= 800) {
          const missionTrailer = assignments.find(v => v.vehicle.registration_number === 'Mission Trailer')
          if (missionTrailer && missionTrailer.assignedOrders.length === 0) {
            missionTrailer.destinationGroup = bestVehicle.destinationGroup
            console.log(`  🔗 Prepared Mission Trailer for pairing with CN30435 (${bestVehicle.destinationGroup}) - sufficient load: ${totalWeight}kg`)
          }
        }
        
        routes.push({ vehicle: bestVehicle, orders: route })
        assignedOrderIds.add(saving.i)
        assignedOrderIds.add(saving.j)
        
        console.log(`  ✓ Route: ${saving.orderI.customerName} + ${saving.orderJ.customerName} → ${bestVehicle.vehicle.registration_number} (${Math.round(bestVehicle.utilization)}% full, saves ${Math.round(saving.savings)}km)`)
      }
    }
    
    // Step 4: Assign remaining single orders to existing routes or new vehicles
    const remainingSingleOrders = validOrders.filter((_, idx) => !assignedOrderIds.has(idx))
    console.log(`\nAssigning ${remainingSingleOrders.length} remaining orders...`)
    
    // NEW RULE: Only use paired vehicles if there's sufficient combined load
    const missionTrailer = assignments.find(v => v.vehicle.registration_number === 'Mission Trailer')
    const cn30435 = assignments.find(v => v.vehicle.registration_number === 'CN30435')
    
    if (missionTrailer && cn30435 && 
        (missionTrailer.assignedOrders.length > 0 || cn30435.assignedOrders.length > 0)) {
      
      const combinedWeight = missionTrailer.totalWeight + cn30435.totalWeight
      const combinedCapacity = missionTrailer.capacity + cn30435.capacity
      const combinedUtilization = (combinedWeight / combinedCapacity) * 100
      
      // Only use pairing if there's enough load to justify both vehicles (>50% combined utilization)
      if (combinedUtilization >= 50 || combinedWeight >= 800) {
        console.log(`\n🔗 Checking paired vehicles for additional capacity...`)
        
        const pairedAssignments = [missionTrailer, cn30435]
        const remainingAfterPaired = allocateOrdersToPairedVehicles(
          remainingSingleOrders, 
          pairedAssignments, 
          assignments
        )
        
        // Update remaining orders after paired allocation
        const allocatedByPaired = remainingSingleOrders.filter(o => !remainingAfterPaired.includes(o))
        console.log(`  Paired vehicles allocated ${allocatedByPaired.length} additional orders`)
      } else {
        console.log(`\n🔗 Skipping pairing - insufficient load (${Math.round(combinedUtilization)}% combined utilization, ${combinedWeight}kg total)`)
        
        // If pairing not justified, clear the empty vehicle
        if (missionTrailer.assignedOrders.length === 0) {
          missionTrailer.destinationGroup = undefined
        }
        if (cn30435.assignedOrders.length === 0) {
          cn30435.destinationGroup = undefined
        }
      }
    }
    
    // Continue with normal assignment for remaining orders
    const finalRemaining = validOrders.filter((_, idx) => !assignedOrderIds.has(idx) && 
      !assignments.some(a => a.assignedOrders.includes(validOrders[idx])))
    
    // Group remaining orders by destination
    const ordersByDestination = new Map<string, Order[]>()
    for (const order of finalRemaining) {
      const dest = order.location_group || 'Unknown'
      if (!ordersByDestination.has(dest)) {
        ordersByDestination.set(dest, [])
      }
      ordersByDestination.get(dest)!.push(order)
    }
    
    console.log(`\nGrouping ${finalRemaining.length} remaining orders by destination:`)
    for (const [dest, destOrders] of ordersByDestination) {
      console.log(`  ${dest}: ${destOrders.length} orders`)
    }
    
    // Assign a vehicle to each destination group
    for (const [dest, destOrders] of ordersByDestination) {
      const totalWeight = destOrders.reduce((sum, o) => sum + (o.totalWeight || (o.drums || 0) * 200), 0)
      
      // Find available vehicle that can handle all orders for this destination
      const availableVehicle = assignments.find(v => 
        v.assignedOrders.length === 0 && 
        (v.capacity * 0.95 - v.totalWeight) >= totalWeight &&
        destOrders.every(order => canAssignOrderToVehicle(order, v, assignments))
      )
      
      if (availableVehicle) {
        // Assign all orders for this destination to the vehicle
        availableVehicle.assignedOrders = [...destOrders]
        availableVehicle.totalWeight = totalWeight
        availableVehicle.utilization = (totalWeight / availableVehicle.capacity) * 100
        availableVehicle.destinationGroup = dest
        
        routes.push({ vehicle: availableVehicle, orders: destOrders })
        console.log(`  ✓ Assigned ${dest} route → ${availableVehicle.vehicle.registration_number} (${destOrders.length} orders, ${Math.round(availableVehicle.utilization)}% full)`)
      } else {
        // If can't fit all orders in one vehicle, try to split
        console.log(`  ⚠️ ${dest}: ${destOrders.length} orders too heavy for single vehicle (${totalWeight}kg)`)
        
        // Sort orders by weight (heaviest first)
        const sortedOrders = [...destOrders].sort((a, b) => {
          const weightA = a.totalWeight || (a.drums || 0) * 200
          const weightB = b.totalWeight || (b.drums || 0) * 200
          return weightB - weightA
        })
        
        // Try to fill vehicles for this destination
        for (const order of sortedOrders) {
          const orderWeight = order.totalWeight || (order.drums || 0) * 200
          
          // Try to add to existing vehicle going to same destination
          let assigned = false
          for (const route of routes) {
            if (route.vehicle.destinationGroup === dest) {
              const remainingCapacity = route.vehicle.capacity * 0.95 - route.vehicle.totalWeight
              if (remainingCapacity >= orderWeight && canAssignOrderToVehicle(order, route.vehicle, assignments)) {
                route.vehicle.assignedOrders.push(order)
                route.vehicle.totalWeight += orderWeight
                route.vehicle.utilization = (route.vehicle.totalWeight / route.vehicle.capacity) * 100
                console.log(`    ✓ Added ${order.customerName} to existing ${dest} route (${Math.round(route.vehicle.utilization)}% full)`)
                assigned = true
                break
              }
            }
          }
          
          // If not assigned, create new vehicle for this destination
          if (!assigned) {
            const newVehicle = assignments.find(v => 
              v.assignedOrders.length === 0 && 
              (v.capacity * 0.95 - v.totalWeight) >= orderWeight &&
              canAssignOrderToVehicle(order, v, assignments)
            )
            
            if (newVehicle) {
              newVehicle.assignedOrders = [order]
              newVehicle.totalWeight = orderWeight
              newVehicle.utilization = (orderWeight / newVehicle.capacity) * 100
              newVehicle.destinationGroup = dest
              routes.push({ vehicle: newVehicle, orders: [order] })
              console.log(`    ✓ New ${dest} route → ${newVehicle.vehicle.registration_number} (${Math.round(newVehicle.utilization)}% full)`)
            } else {
              unassignedOrders.push(order)
              console.log(`    ✗ ${order.customerName} - No available vehicle`)
            }
          }
        }
      }
    }
    
    // Handle orders without coordinates
    const ordersWithoutCoords = unrestrictedOrders.filter(o => !o.latitude || !o.longitude)
    for (const order of ordersWithoutCoords) {
      const orderWeight = order.totalWeight || (order.drums || 0) * 200
      const availableVehicle = assignments.find(v => 
        (v.capacity * 0.95 - v.totalWeight) >= orderWeight &&
        canAssignOrderToVehicle(order, v, assignments)
      )
      
      if (availableVehicle) {
        availableVehicle.assignedOrders.push(order)
        availableVehicle.totalWeight += orderWeight
        availableVehicle.utilization = (availableVehicle.totalWeight / availableVehicle.capacity) * 100
        console.log(`  ✓ ${order.customerName} → ${availableVehicle.vehicle.registration_number} (no coords)`)
      } else {
        remainingUnassigned.push(order)
      }
    }
    
    console.log(`\nClarke-Wright Results: ${routes.length} routes created, ${remainingUnassigned.length} unassigned`)
  }
  
  unassignedOrders.push(...remainingUnassigned)
  
  // STEP 2C: ROUTE EXTENSION (Fill remaining capacity with nearby orders)
  console.log(`\n=== STEP 2C: ROUTE EXTENSION OPTIMIZATION ===`)
  
  // NEW RULE: Only extend paired vehicles if pairing is justified
  const missionTrailer = assignments.find(v => v.vehicle.registration_number === 'Mission Trailer')
  const cn30435 = assignments.find(v => v.vehicle.registration_number === 'CN30435')
  
  if (missionTrailer && cn30435 && 
      (missionTrailer.assignedOrders.length > 0 || cn30435.assignedOrders.length > 0) &&
      unassignedOrders.length > 0) {
    
    const combinedWeight = missionTrailer.totalWeight + cn30435.totalWeight
    const combinedCapacity = missionTrailer.capacity + cn30435.capacity
    const combinedUtilization = (combinedWeight / combinedCapacity) * 100
    
    // Only extend if pairing is justified (>50% utilization or >800kg load)
    if ((combinedUtilization >= 50 || combinedWeight >= 800) && combinedUtilization < 85) {
      console.log(`\n🔗 Extending paired vehicle routes...`)
      console.log(`  Combined utilization: ${Math.round(combinedUtilization)}% - extending routes`)
      
      const pairedAssignments = [missionTrailer, cn30435]
      const remainingAfterExtension = allocateOrdersToPairedVehicles(
        unassignedOrders,
        pairedAssignments,
        assignments
      )
      
      // Update unassigned orders
      const newlyAssigned = unassignedOrders.filter(o => !remainingAfterExtension.includes(o))
      unassignedOrders.length = 0
      unassignedOrders.push(...remainingAfterExtension)
      
      console.log(`  Extended paired routes with ${newlyAssigned.length} additional orders`)
    } else if (combinedUtilization < 50 && combinedWeight < 800) {
      console.log(`\n🔗 Pairing not justified - insufficient load (${Math.round(combinedUtilization)}% utilization, ${combinedWeight}kg)`)
      
      // Clear empty vehicle from pairing
      if (missionTrailer.assignedOrders.length === 0) {
        missionTrailer.destinationGroup = undefined
      }
      if (cn30435.assignedOrders.length === 0) {
        cn30435.destinationGroup = undefined
      }
    }
  }
  
  // Find vehicles with remaining capacity (under 85% full)
  const vehiclesWithCapacity = assignments.filter(a => 
    a.assignedOrders.length > 0 && a.utilization < 85
  )
  
  for (const vehicle of vehiclesWithCapacity) {
    const remainingCapacity = vehicle.capacity * 0.95 - vehicle.totalWeight
    console.log(`\n${vehicle.vehicle.registration_number}: ${Math.round(vehicle.utilization)}% full, ${Math.round(remainingCapacity)}kg remaining`)
    
    // Find unassigned orders that could fit and are nearby
    const nearbyOrders = unassignedOrders.filter(order => {
      const orderWeight = order.totalWeight || (order.drums || 0) * 200
      
      // Must fit in remaining capacity
      if (orderWeight > remainingCapacity) return false
      
      // Must pass vehicle restrictions
      if (!canAssignOrderToVehicle(order, vehicle, assignments)) return false
      
      // Check proximity to existing orders
      if (order.latitude && order.longitude && vehicle.assignedOrders.length > 0) {
        const minDistance = Math.min(...vehicle.assignedOrders
          .filter(o => o.latitude && o.longitude)
          .map(o => haversineDistance(order.latitude!, order.longitude!, o.latitude!, o.longitude!))
        )
        
        // Must be within 75km of existing orders
        return minDistance <= 75
      }
      
      return true
    })
    
    // Sort by proximity and weight efficiency
    nearbyOrders.sort((a, b) => {
      const weightA = a.totalWeight || (a.drums || 0) * 200
      const weightB = b.totalWeight || (b.drums || 0) * 200
      
      // Prefer heavier orders for better space utilization
      return weightB - weightA
    })
    
    // Add orders until capacity is reached
    let currentCapacity = remainingCapacity
    const ordersToAdd = []
    
    for (const order of nearbyOrders) {
      const orderWeight = order.totalWeight || (order.drums || 0) * 200
      if (orderWeight <= currentCapacity) {
        ordersToAdd.push(order)
        currentCapacity -= orderWeight
        
        // Stop if we're at 90%+ utilization
        const newUtilization = ((vehicle.totalWeight + (remainingCapacity - currentCapacity)) / vehicle.capacity) * 100
        if (newUtilization >= 90) break
      }
    }
    
    // Add the selected orders
    for (const order of ordersToAdd) {
      const orderWeight = order.totalWeight || (order.drums || 0) * 200
      vehicle.assignedOrders.push(order)
      vehicle.totalWeight += orderWeight
      vehicle.utilization = (vehicle.totalWeight / vehicle.capacity) * 100
      
      // Remove from unassigned
      const index = unassignedOrders.indexOf(order)
      if (index > -1) unassignedOrders.splice(index, 1)
      
      console.log(`  ✓ Added ${order.customerName} → ${vehicle.vehicle.registration_number} (${Math.round(vehicle.utilization)}% full)`)
    }
  }
  
  // STEP 2D: VEHICLE CONSOLIDATION - Merge underutilized vehicles
  console.log(`\n=== STEP 2D: VEHICLE CONSOLIDATION (Reduce Fleet Size) ===`)
  
  // Find underutilized vehicles (less than 50% capacity or few orders)
  const underutilizedVehicles = assignments
    .filter(a => a.assignedOrders.length > 0 && (a.utilization < 50 || a.assignedOrders.length <= 2))
    .sort((a, b) => a.utilization - b.utilization) // Least utilized first
  
  console.log(`Found ${underutilizedVehicles.length} underutilized vehicles for consolidation`)
  
  for (const sourceVehicle of underutilizedVehicles) {
    if (sourceVehicle.assignedOrders.length === 0) continue // Skip if already emptied
    
    console.log(`\nConsolidating ${sourceVehicle.vehicle.registration_number} (${Math.round(sourceVehicle.utilization)}% full, ${sourceVehicle.assignedOrders.length} orders)`)
    
    // Find best target vehicle to merge into
    const targetCandidates = assignments
      .filter(a => 
        a !== sourceVehicle && 
        a.assignedOrders.length > 0 && 
        a.utilization < 85 // Has remaining capacity
      )
      .map(target => {
        const combinedWeight = target.totalWeight + sourceVehicle.totalWeight
        const newUtilization = (combinedWeight / target.capacity) * 100
        
        // Skip if would exceed capacity
        if (newUtilization > 95) return null
        
        // Calculate average distance between all orders
        let avgDistance = 0
        if (sourceVehicle.assignedOrders.length > 0 && target.assignedOrders.length > 0) {
          const distances = []
          for (const sourceOrder of sourceVehicle.assignedOrders) {
            if (sourceOrder.latitude && sourceOrder.longitude) {
              for (const targetOrder of target.assignedOrders) {
                if (targetOrder.latitude && targetOrder.longitude) {
                  distances.push(haversineDistance(
                    sourceOrder.latitude, sourceOrder.longitude,
                    targetOrder.latitude, targetOrder.longitude
                  ))
                }
              }
            }
          }
          avgDistance = distances.length > 0 ? distances.reduce((sum, d) => sum + d, 0) / distances.length : 0
        }
        
        // Check vehicle restrictions for all source orders
        const allOrdersCompatible = sourceVehicle.assignedOrders.every(order => 
          canAssignOrderToVehicle(order, target, assignments)
        )
        
        if (!allOrdersCompatible) return null
        
        return {
          target,
          newUtilization,
          avgDistance,
          score: newUtilization - (avgDistance / 10) // Prefer high utilization, low distance
        }
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score) // Best score first
    
    if (targetCandidates.length > 0) {
      const best = targetCandidates[0]
      const targetVehicle = best.target
      
      // Check if consolidation makes sense (distance < 100km average)
      if (best.avgDistance <= 100) {
        // Move all orders from source to target
        for (const order of sourceVehicle.assignedOrders) {
          targetVehicle.assignedOrders.push(order)
        }
        
        // Update target vehicle stats
        targetVehicle.totalWeight += sourceVehicle.totalWeight
        targetVehicle.utilization = (targetVehicle.totalWeight / targetVehicle.capacity) * 100
        
        // Clear source vehicle
        sourceVehicle.assignedOrders = []
        sourceVehicle.totalWeight = 0
        sourceVehicle.utilization = 0
        sourceVehicle.destinationGroup = undefined
        
        console.log(`  ✓ Merged ${sourceVehicle.vehicle.registration_number} → ${targetVehicle.vehicle.registration_number}`)
        console.log(`    New utilization: ${Math.round(targetVehicle.utilization)}%, Orders: ${targetVehicle.assignedOrders.length}, Avg distance: ${Math.round(best.avgDistance)}km`)
      } else {
        console.log(`  ✗ Cannot merge ${sourceVehicle.vehicle.registration_number} - average distance too high (${Math.round(best.avgDistance)}km)`)
      }
    } else {
      console.log(`  ✗ No suitable target vehicle for ${sourceVehicle.vehicle.registration_number}`)
    }
  }
  
  // Add remaining unassigned orders using route-based proximity
  if (unassignedOrders.length > 0) {
    console.log(`\nRoute-based assignment for ${unassignedOrders.length} unassigned orders...`)
    
    const DEPOT_LAT = -33.9249
    const DEPOT_LON = 18.6369
    
    const vehiclesWithCapacity = assignments
      .filter(a => a.assignedOrders.length > 0 && a.utilization < 90)
      .sort((a, b) => a.utilization - b.utilization) // Fill less utilized vehicles first
    
    for (const order of [...unassignedOrders]) {
      const orderWeight = order.totalWeight || (order.drums || 0) * 200
      let assigned = false
      
      if (!order.latitude || !order.longitude) {
        console.log(`  ⚠️ ${order.customerName} - No coordinates, skipping route analysis`)
        continue
      }
      
      // Find vehicles that pass near this order during their route
      const routeMatches = []
      
      for (const vehicle of vehiclesWithCapacity) {
        const remainingCapacity = vehicle.capacity * 0.95 - vehicle.totalWeight
        
        // Skip if no capacity or restrictions don't allow
        if (remainingCapacity < orderWeight || !canAssignOrderToVehicle(order, vehicle, assignments)) {
          continue
        }
        
        // Calculate route proximity score
        let routeProximityScore = 0
        let minRouteDistance = Infinity
        
        // Check distance to depot (start/end of route)
        const depotDistance = haversineDistance(order.latitude, order.longitude, DEPOT_LAT, DEPOT_LON)
        
        // Check distance to each stop in the vehicle's route
        const validStops = vehicle.assignedOrders.filter(o => o.latitude && o.longitude)
        
        if (validStops.length > 0) {
          // Find closest stop
          const stopDistances = validStops.map(stop => 
            haversineDistance(order.latitude!, order.longitude!, stop.latitude!, stop.longitude!)
          )
          minRouteDistance = Math.min(...stopDistances)
          
          // Calculate if order is "on the way" between stops
          let onRouteBonus = 0
          for (let i = 0; i < validStops.length - 1; i++) {
            const stop1 = validStops[i]
            const stop2 = validStops[i + 1]
            
            // Distance from stop1 to stop2 directly
            const directDistance = haversineDistance(stop1.latitude!, stop1.longitude!, stop2.latitude!, stop2.longitude!)
            
            // Distance via the order: stop1 → order → stop2
            const viaOrderDistance = 
              haversineDistance(stop1.latitude!, stop1.longitude!, order.latitude!, order.longitude!) +
              haversineDistance(order.latitude!, order.longitude!, stop2.latitude!, stop2.longitude!)
            
            // If detour is small (< 20% extra), order is "on the way"
            const detourPercent = ((viaOrderDistance - directDistance) / directDistance) * 100
            if (detourPercent < 20) {
              onRouteBonus = 100 - detourPercent // Higher bonus for smaller detours
              break
            }
          }
          
          // Calculate proximity score (lower is better)
          routeProximityScore = minRouteDistance - onRouteBonus
        } else {
          minRouteDistance = depotDistance
          routeProximityScore = depotDistance
        }
        
        // Only consider if reasonably close (within 75km of route)
        if (minRouteDistance <= 150) { // Increased range for better consolidation
          routeMatches.push({
            vehicle,
            proximityScore: routeProximityScore,
            minDistance: minRouteDistance,
            utilization: vehicle.utilization,
            remainingCapacity
          })
        }
      }
      
      // Sort by proximity score (best route fit first)
      routeMatches.sort((a, b) => a.proximityScore - b.proximityScore)
      
      if (routeMatches.length > 0) {
        const bestMatch = routeMatches[0]
        const vehicle = bestMatch.vehicle
        
        // Assign order to best matching vehicle
        vehicle.assignedOrders.push(order)
        vehicle.totalWeight += orderWeight
        vehicle.utilization = (vehicle.totalWeight / vehicle.capacity) * 100
        
        // Remove from unassigned
        const index = unassignedOrders.indexOf(order)
        if (index > -1) unassignedOrders.splice(index, 1)
        
        console.log(`  ✓ Route-assigned ${order.customerName} → ${vehicle.vehicle.registration_number}`)
        console.log(`    Distance to route: ${Math.round(bestMatch.minDistance)}km, New utilization: ${Math.round(vehicle.utilization)}%`)
        assigned = true
      }
      
      if (!assigned) {
        console.log(`  ✗ No vehicle passes near ${order.customerName} (${order.location_group || 'Unknown zone'})`)
      }
    }
  }
  
  // SUPER AGGRESSIVE CONSOLIDATION: Eliminate ALL underutilized vehicles (< 70%)
  console.log(`\n=== SUPER AGGRESSIVE CONSOLIDATION ===`)
  console.log(`Goal: Merge all vehicles under 70% utilization into fuller vehicles`)
  
  const poorlyUtilizedVehicles = assignments
    .filter(a => a.assignedOrders.length > 0 && a.utilization < 70)
    .sort((a, b) => a.utilization - b.utilization) // Least utilized first
  
  const wellUtilizedVehicles = assignments
    .filter(a => a.assignedOrders.length > 0 && a.utilization >= 70)
    .sort((a, b) => a.capacity - b.capacity) // Largest capacity first
  
  console.log(`Underutilized vehicles (<70%): ${poorlyUtilizedVehicles.length}`)
  poorlyUtilizedVehicles.forEach(v => console.log(`  ${v.vehicle.registration_number}: ${Math.round(v.utilization)}%`))
  console.log(`Well-utilized vehicles (≥70%): ${wellUtilizedVehicles.length}`)
  
  for (const sourceVehicle of poorlyUtilizedVehicles) {
    console.log(`\nConsolidating ${sourceVehicle.vehicle.registration_number} (${Math.round(sourceVehicle.utilization)}% full, ${sourceVehicle.assignedOrders.length} orders)`)
    
    // Move ALL orders from this vehicle
    const ordersToMove = [...sourceVehicle.assignedOrders]
    let allOrdersMoved = true
    
    for (const order of ordersToMove) {
      const orderWeight = order.totalWeight || (order.drums || 0) * 200
      let moved = false
      
      // Try well-utilized vehicles first, then any vehicle with capacity
      const allTargetVehicles = [...wellUtilizedVehicles, ...assignments.filter(a => 
        a !== sourceVehicle && 
        a.assignedOrders.length > 0 && 
        !wellUtilizedVehicles.includes(a)
      )]
      
      for (const targetVehicle of allTargetVehicles) {
        const remainingCapacity = targetVehicle.capacity * 0.95 - targetVehicle.totalWeight
        
        // Check capacity and restrictions
        if (remainingCapacity >= orderWeight && canAssignOrderToVehicle(order, targetVehicle, assignments)) {
          // For super aggressive consolidation, allow even longer distances (up to 300km)
          let canMove = true
          
          if (order.latitude && order.longitude && targetVehicle.assignedOrders.length > 0) {
            const distances = targetVehicle.assignedOrders
              .filter(o => o.latitude && o.longitude)
              .map(o => haversineDistance(order.latitude!, order.longitude!, o.latitude!, o.longitude!))
            
            const minDistance = Math.min(...distances)
            canMove = minDistance <= 300 // Allow up to 300km for super aggressive consolidation
          }
          
          if (canMove) {
            // Move the order
            sourceVehicle.assignedOrders = sourceVehicle.assignedOrders.filter(o => o !== order)
            sourceVehicle.totalWeight -= orderWeight
            sourceVehicle.utilization = sourceVehicle.capacity > 0 ? (sourceVehicle.totalWeight / sourceVehicle.capacity) * 100 : 0
            
            targetVehicle.assignedOrders.push(order)
            targetVehicle.totalWeight += orderWeight
            targetVehicle.utilization = (targetVehicle.totalWeight / targetVehicle.capacity) * 100
            
            console.log(`  ✓ Moved ${order.customerName} → ${targetVehicle.vehicle.registration_number} (${Math.round(targetVehicle.utilization)}% full)`)
            moved = true
            break
          }
        }
      }
      
      if (!moved) {
        console.log(`  ✗ Cannot move ${order.customerName} - no suitable vehicle`)
        allOrdersMoved = false
      }
    }
    
    // Clear vehicle if all orders moved
    if (sourceVehicle.assignedOrders.length === 0) {
      sourceVehicle.totalWeight = 0
      sourceVehicle.utilization = 0
      sourceVehicle.destinationGroup = undefined
      console.log(`  ✓ ✓ FREED ${sourceVehicle.vehicle.registration_number} - all orders relocated`)
    } else {
      console.log(`  ⚠️ ${sourceVehicle.vehicle.registration_number} still has ${sourceVehicle.assignedOrders.length} orders`)
    }
  }
  
  // Count active vehicles after consolidation
  console.log(`\nConsolidation complete: ${assignments.filter(a => a.assignedOrders.length > 0).length} vehicles in use`)
  
  // STEP 2E: POST-OPTIMIZATION - Handle any remaining scattered orders
  console.log(`\n=== STEP 2E: POST-OPTIMIZATION (Final cleanup) ===`)
  
  // Find vehicles with scattered orders (low utilization or few orders)
  const scatteredVehicles = assignments.filter(a => 
    a.assignedOrders.length > 0 && (a.utilization < 30 || a.assignedOrders.length <= 2)
  )
  
  for (const scattered of scatteredVehicles) {
    console.log(`\nAnalyzing ${scattered.vehicle.registration_number} (${Math.round(scattered.utilization)}% full, ${scattered.assignedOrders.length} orders)`)
    
    // Try to move each order to a better fit
    const ordersToMove = [...scattered.assignedOrders]
    
    for (const order of ordersToMove) {
      const orderWeight = order.totalWeight || (order.drums || 0) * 200
      
      // Find best fit vehicle (same region, has capacity, better utilization)
      const region = order.location_group ? getRegionForZone(order.location_group) : null
      
      const betterFits = assignments
        .filter(a => 
          a !== scattered &&
          a.assignedOrders.length > 0 &&
          a.utilization < 90 &&
          a.destinationGroup &&
          region &&
          getRegionForZone(a.destinationGroup) === region
        )
        .map(a => {
          const newUtil = ((a.totalWeight + orderWeight) / a.capacity) * 100
          return { vehicle: a, newUtil }
        })
        .filter(({ newUtil }) => newUtil <= 95)
        .sort((a, b) => b.newUtil - a.newUtil) // Prefer fuller vehicles
      
      if (betterFits.length > 0) {
        const target = betterFits[0].vehicle
        
        // Check 50km radius
        let withinRadius = true
        if (order.latitude && order.longitude) {
          for (const existing of target.assignedOrders) {
            if (existing.latitude && existing.longitude) {
              const dist = haversineDistance(
                order.latitude, order.longitude,
                existing.latitude, existing.longitude
              )
              if (dist > 50) {
                withinRadius = false
                break
              }
            }
          }
        }
        
        if (withinRadius && canAssignOrderToVehicle(order, target, assignments)) {
          // Move order
          scattered.assignedOrders = scattered.assignedOrders.filter(o => o !== order)
          scattered.totalWeight -= orderWeight
          scattered.utilization = scattered.capacity > 0 ? (scattered.totalWeight / scattered.capacity) * 100 : 0
          
          target.assignedOrders.push(order)
          target.totalWeight += orderWeight
          target.utilization = (target.totalWeight / target.capacity) * 100
          
          console.log(`  ✓ Moved ${order.customerName}: ${scattered.vehicle.registration_number} → ${target.vehicle.registration_number} (${Math.round(target.utilization)}% full)`)
        }
      }
    }
    
    // Clear vehicle if empty
    if (scattered.assignedOrders.length === 0) {
      scattered.totalWeight = 0
      scattered.utilization = 0
      scattered.destinationGroup = undefined
      console.log(`  → Freed ${scattered.vehicle.registration_number}`)
    }
  }
  
  // Assign drivers to vehicles with orders
  // CRITICAL: Assign CN30435 first, then Mission Trailer will share its driver
  console.log(`\n=== DRIVER ASSIGNMENT ===`)
  
  // NEW RULE: For paired vehicles, ensure they share the same driver
  const missionTrailerAssignment = assignments.find(a => a.vehicle.registration_number === 'Mission Trailer')
  const cn30435Assignment = assignments.find(a => a.vehicle.registration_number === 'CN30435')
  
  if (missionTrailerAssignment && cn30435Assignment && 
      (missionTrailerAssignment.assignedOrders.length > 0 || cn30435Assignment.assignedOrders.length > 0)) {
    console.log(`🔗 Paired vehicles detected - ensuring shared driver assignment`)
    
    // If either has orders, both should share the same destination and driver
    const sharedDestination = missionTrailerAssignment.destinationGroup || cn30435Assignment.destinationGroup
    if (sharedDestination) {
      missionTrailerAssignment.destinationGroup = sharedDestination
      cn30435Assignment.destinationGroup = sharedDestination
      console.log(`  Shared destination: ${sharedDestination}`)
    }
  }
  
  // Sort assignments to ensure CN30435 is processed before Mission Trailer
  const sortedAssignments = [...assignments].sort((a, b) => {
    if (a.vehicle.registration_number === 'CN30435') return -1
    if (b.vehicle.registration_number === 'CN30435') return 1
    if (a.vehicle.registration_number === 'Mission Trailer') return 1
    if (b.vehicle.registration_number === 'Mission Trailer') return -1
    return 0
  })
  
  for (const vehicle of sortedAssignments) {
    if (vehicle.assignedOrders.length > 0 && vehicle.assignedDrivers!.length === 0 && remainingDrivers.length > 0) {
      const { assignedDrivers, remainingDrivers: newRemainingDrivers } = assignDriversToVehicle(
        vehicle.vehicle,
        remainingDrivers,
        requiredDriversPerVehicle,
        assignments
      )
      vehicle.assignedDrivers = assignedDrivers
      
      // NEW RULE: If CN30435 got a driver, automatically assign to Mission Trailer too (and vice versa)
      if (vehicle.vehicle.registration_number === 'CN30435' && assignedDrivers.length > 0) {
        const trailerAssignment = assignments.find(a => a.vehicle.registration_number === 'Mission Trailer')
        if (trailerAssignment && (trailerAssignment.assignedOrders.length > 0 || vehicle.assignedOrders.length > 0)) {
          trailerAssignment.assignedDrivers = assignedDrivers
          console.log(`✓ Paired: CN30435 + Mission Trailer → Driver: ${assignedDrivers.map(d => `${d.first_name} ${d.surname}`).join(', ')}`)
        }
      }
      
      // If Mission Trailer got a driver, automatically assign to CN30435 too
      if (vehicle.vehicle.registration_number === 'Mission Trailer' && assignedDrivers.length > 0) {
        const bakkieAssignment = assignments.find(a => a.vehicle.registration_number === 'CN30435')
        if (bakkieAssignment && (bakkieAssignment.assignedOrders.length > 0 || vehicle.assignedOrders.length > 0)) {
          bakkieAssignment.assignedDrivers = assignedDrivers
          console.log(`✓ Paired: Mission Trailer + CN30435 → Driver: ${assignedDrivers.map(d => `${d.first_name} ${d.surname}`).join(', ')}`)
        }
      }
      
      // Mission Trailer doesn't consume drivers (shares with CN30435)
      if (vehicle.vehicle.registration_number !== 'Mission Trailer') {
        remainingDrivers = newRemainingDrivers
      }
      
      if (assignedDrivers.length > 0) {
        console.log(`${vehicle.vehicle.registration_number}: ${assignedDrivers.map(d => `${d.first_name} ${d.surname}`).join(', ')}`)
      } else {
        console.log(`${vehicle.vehicle.registration_number}: No qualified drivers available`)
      }
    }
  }
  
  // STEP 2F: Handle scattered single orders - combine them into one vehicle
  console.log(`\n=== STEP 2F: COMBINING SCATTERED SINGLE ORDERS ===`)
  const scatteredOrders: Order[] = []
  
  if (scatteredOrders.length >= 2) {
    console.log(`Combining ${scatteredOrders.length} scattered single orders into one vehicle`)
    
    // Calculate total weight
    const totalWeight = scatteredOrders.reduce((sum, o) => sum + (o.totalWeight || (o.drums || 0) * 200), 0)
    console.log(`Total weight: ${Math.round(totalWeight)}kg`)
    
    // Find smallest vehicle that can fit all orders
    const suitableVehicles = assignments
      .filter(a => a.assignedOrders.length === 0) // Only empty vehicles
      .filter(a => {
        // Check if all orders can fit
        return scatteredOrders.every(order => canAssignOrderToVehicle(order, a, assignments))
      })
      .filter(a => (a.capacity * 0.95 - a.totalWeight) >= totalWeight)
      .sort((a, b) => a.capacity - b.capacity) // Smallest first
    
    if (suitableVehicles.length > 0) {
      const vehicle = suitableVehicles[0]
      
      // Assign all scattered orders to this vehicle
      for (const order of scatteredOrders) {
        const orderWeight = order.totalWeight || (order.drums || 0) * 200
        vehicle.assignedOrders.push(order)
        vehicle.totalWeight += orderWeight
        console.log(`  ✓ ${order.customerName} → ${vehicle.vehicle.registration_number} [SCATTERED] (${orderWeight}kg)`)
      }
      
      vehicle.utilization = (vehicle.totalWeight / vehicle.capacity) * 100
      vehicle.destinationGroup = 'Mixed Route'
      
      console.log(`  → Combined ${scatteredOrders.length} orders into ${vehicle.vehicle.registration_number} (${Math.round(vehicle.utilization)}% full)`)
    } else {
      console.log(`  ✗ No suitable vehicle found for ${scatteredOrders.length} scattered orders`)
      // Add back to unassigned if can't combine
      unassignedOrders.push(...scatteredOrders)
    }
  } else if (scatteredOrders.length > 0) {
    console.log(`Only ${scatteredOrders.length} scattered order(s), assigning individually`)
    unassignedOrders.push(...scatteredOrders)
  }
  
  // Handle orders without coordinates
  const ordersWithoutCoords = sortedOrders.filter(o => !o.latitude || !o.longitude)
  if (ordersWithoutCoords.length > 0) {
    console.log(`\n=== ORDERS WITHOUT COORDINATES ===`)
    for (const order of ordersWithoutCoords) {
      const orderWeight = order.totalWeight || (order.drums || 0) * 200
      let assigned = false
      
      for (const vehicle of assignments) {
        if (canAssignOrderToVehicle(order, vehicle, assignments)) {
          vehicle.assignedOrders.push(order)
          vehicle.totalWeight += orderWeight
          vehicle.utilization = (vehicle.totalWeight / vehicle.capacity) * 100
          assigned = true
          console.log(`  ✓ ${order.customerName} → ${vehicle.vehicle.registration_number}`)
          break
        }
      }
      if (!assigned) {
        unassignedOrders.push(order)
        console.log(`  ✗ ${order.customerName} - No compatible vehicle`)
      }
    }
  }
  
  // Check for any orders not assigned to any vehicle
  const allAssignedOrders = new Set(assignments.flatMap(a => a.assignedOrders))
  const notAssigned = sortedOrders.filter(o => !allAssignedOrders.has(o))
  
  if (notAssigned.length > 0) {
    console.log(`\n=== UNASSIGNED ORDERS DETECTED ===`)
    notAssigned.forEach(o => {
      if (!unassignedOrders.includes(o)) {
        unassignedOrders.push(o)
        console.log(`  ${o.customerName}`)
      }
    })
  }
  
  // DON'T schedule orders here - they'll be handled by the calling function
  // This function only assigns to vehicles, scheduling happens at the page level
  
  // Set destination groups based on order location_group (already clustered)
  console.log(`\n=== SETTING DESTINATION REGIONS ===`)
  for (const assignment of assignments) {
    if (assignment.assignedOrders.length > 0 && !assignment.destinationGroup) {
      // Use the location_group from orders (already set during clustering)
      const orderZones = assignment.assignedOrders.map(o => o.location_group || o.locationGroup).filter(Boolean)
      if (orderZones.length > 0) {
        // Use most common zone
        const zoneCounts = orderZones.reduce((acc, zone) => {
          acc[zone] = (acc[zone] || 0) + 1
          return acc
        }, {})
        const sortedZones = Object.entries(zoneCounts).sort((a: any, b: any) => b[1] - a[1])
        assignment.destinationGroup = sortedZones[0][0] as string
        console.log(`${assignment.vehicle.registration_number}: ${assignment.destinationGroup} (${assignment.assignedOrders.length} orders)`)
      }
    }
  }
  
  // Optimize sequence for each vehicle using Geoapify
  console.log('\n=== ROUTE SEQUENCE OPTIMIZATION (Geoapify Truck Mode) ===')
  const DEPOT_LAT = -33.9249
  const DEPOT_LON = 18.6369
  
  for (const assignment of assignments) {
    if (assignment.assignedOrders.length > 0) {
      console.log(`\n${assignment.vehicle.registration_number}: ${assignment.assignedOrders.length} stops`)
      
      const result = await optimizeRouteWithDepot(
        assignment.assignedOrders,
        DEPOT_LAT,
        DEPOT_LON
      )
      
      assignment.assignedOrders = result.orders
      assignment.routeDistance = result.distance
      assignment.routeDuration = result.duration
      
      // Store geometry for map display
      if (result.geometry) {
        (assignment as any).routeGeometry = result.geometry
      }
    }
  }
  
*/

/**
 * Schedule unassigned orders for next day ONLY
 * Don't spread across multiple days - keep trying to fit on current day first
 */
export async function scheduleOrdersForNextDays(orders: Order[]): Promise<void> {
  if (orders.length === 0) return
  
  const supabase = createClient()
  const today = new Date()
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
  
  console.log(`\n=== SCHEDULING ${orders.length} UNASSIGNED ORDERS FOR TOMORROW ===`)
  console.log('These orders could not fit in any available vehicle today')
  
  for (const order of orders) {
    await supabase
      .from('pending_orders')
      .update({
        scheduled_date: tomorrow.toISOString().split('T')[0],
        priority: ((order as any).priority || 0) + 1,
        status: 'scheduled'
      })
      .eq('id', (order as any).id)
    
    console.log(`  ${order.customerName} → Tomorrow (${tomorrow.toISOString().split('T')[0]})`)
  }
}

/**
 * Update driver availability in database
 */
export async function updateDriverAvailability(
  driverIds: number[],
  available: boolean
): Promise<void> {
  if (driverIds.length === 0) return
  
  const supabase = createClient()
  
  try {
    const { error } = await supabase
      .from('drivers')
      .update({ available })
      .in('id', driverIds)
    
    if (error) {
      console.error('Error updating driver availability:', error)
      throw error
    }
  } catch (error) {
    console.error('Error updating driver availability:', error)
    throw error
  }
}
