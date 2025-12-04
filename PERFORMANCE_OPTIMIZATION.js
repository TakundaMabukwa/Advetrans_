// Performance Optimization Fixes for Route Assignment

// 1. BATCH DATABASE OPERATIONS
// Replace individual updates with batch operations

// BEFORE (Slow - Individual Updates):
/*
for (const order of assignment.assignedOrders) {
  await supabase
    .from('pending_orders')
    .update({
      status: 'assigned',
      assigned_vehicle_id: assignment.vehicle.id,
      assigned_driver_id: driverId,
      scheduled_date: today,
      delivery_sequence: idx + 1,
      location_group: order.location_group,
      destination_group: assignment.destinationGroup
    })
    .eq('id', order.id)
}
*/

// AFTER (Fast - Batch Update):
const batchUpdates = assignment.assignedOrders.map((order, idx) => ({
  id: order.id,
  status: 'assigned',
  assigned_vehicle_id: assignment.vehicle.id,
  assigned_driver_id: driverId,
  scheduled_date: today,
  delivery_sequence: idx + 1,
  location_group: order.location_group || order.locationGroup || 'Other',
  destination_group: assignment.destinationGroup
}))

await supabase.from('pending_orders').upsert(batchUpdates)

// 2. CACHE CUSTOMER LOCATIONS
// Pre-load customer data to avoid repeated geocoding

const customerLocationCache = new Map()

async function loadCustomerCache() {
  const { data: customers } = await supabase
    .from('customers')
    .select('customer_id, latitude, longitude, zone, address')
  
  customers?.forEach(customer => {
    customerLocationCache.set(customer.customer_id, {
      latitude: customer.latitude,
      longitude: customer.longitude,
      zone: customer.zone,
      address: customer.address
    })
  })
}

// Use cache during order processing
function enrichOrderWithCustomerData(order) {
  const customerData = customerLocationCache.get(order.customer_id)
  if (customerData) {
    order.latitude = customerData.latitude
    order.longitude = customerData.longitude
    order.location_group = customerData.zone
    order.location = customerData.address
    order.needs_geocoding = false
  }
  return order
}

// 3. OPTIMIZE ROUTE CALCULATIONS
// Cache route optimizations to avoid repeated API calls

const routeOptimizationCache = new Map()

function getRouteKey(orders) {
  return orders
    .map(o => `${o.latitude},${o.longitude}`)
    .sort()
    .join('|')
}

async function optimizeRouteWithCache(orders, depotLat, depotLon) {
  const routeKey = getRouteKey(orders.filter(o => o.latitude && o.longitude))
  
  if (routeOptimizationCache.has(routeKey)) {
    console.log('Using cached route optimization')
    return routeOptimizationCache.get(routeKey)
  }
  
  const result = await optimizeRouteWithDepot(orders, depotLat, depotLon)
  routeOptimizationCache.set(routeKey, result)
  
  return result
}

// 4. PARALLEL PROCESSING
// Process multiple vehicles simultaneously

async function assignVehiclesInParallel(assignments) {
  const BATCH_SIZE = 3 // Process 3 vehicles at once
  const results = []
  
  for (let i = 0; i < assignments.length; i += BATCH_SIZE) {
    const batch = assignments.slice(i, i + BATCH_SIZE)
    
    const batchPromises = batch.map(async (assignment) => {
      if (assignment.assignedOrders.length > 0) {
        // Process route optimization
        const result = await optimizeRouteWithCache(
          assignment.assignedOrders,
          DEPOT_LAT,
          DEPOT_LON
        )
        
        assignment.assignedOrders = result.orders
        assignment.routeDistance = result.distance
        assignment.routeDuration = result.duration
        
        return assignment
      }
      return assignment
    })
    
    const batchResults = await Promise.all(batchPromises)
    results.push(...batchResults)
  }
  
  return results
}

// 5. ZONE PRESERVATION FIX
// Ensure zone information is never lost

function preserveZoneInformation(order, existingOrder = null) {
  // Priority order for zone information:
  // 1. Existing database zone (if available)
  // 2. Order's location_group
  // 3. Order's locationGroup
  // 4. Geocoded zone
  // 5. 'Other' as fallback
  
  const zoneOptions = [
    existingOrder?.location_group,
    order.location_group,
    order.locationGroup,
    order.geocoded_zone,
    'Other'
  ].filter(Boolean)
  
  return zoneOptions[0]
}

// 6. SMART GEOCODING
// Only geocode when necessary

async function smartGeocode(orders) {
  // Separate orders that need geocoding
  const needsGeocoding = orders.filter(o => !o.latitude || !o.longitude)
  const hasCoordinates = orders.filter(o => o.latitude && o.longitude)
  
  console.log(`Smart geocoding: ${needsGeocoding.length} need geocoding, ${hasCoordinates.length} already have coordinates`)
  
  // Batch geocode only orders that need it
  if (needsGeocoding.length > 0) {
    const geocodedOrders = await batchGeocode(needsGeocoding)
    return [...hasCoordinates, ...geocodedOrders]
  }
  
  return orders
}

// 7. MEMORY OPTIMIZATION
// Clear caches periodically to prevent memory leaks

function clearCaches() {
  if (routeOptimizationCache.size > 100) {
    console.log('Clearing route optimization cache')
    routeOptimizationCache.clear()
  }
  
  if (customerLocationCache.size > 1000) {
    console.log('Refreshing customer location cache')
    customerLocationCache.clear()
    loadCustomerCache()
  }
}

// 8. PROGRESS TRACKING
// Show progress during long operations

function createProgressTracker(total, operation) {
  let completed = 0
  const startTime = Date.now()
  
  return {
    update: () => {
      completed++
      const percent = Math.round((completed / total) * 100)
      const elapsed = Date.now() - startTime
      const estimated = elapsed * (total / completed)
      const remaining = estimated - elapsed
      
      console.log(`${operation}: ${percent}% (${completed}/${total}) - ${Math.round(remaining/1000)}s remaining`)
    },
    complete: () => {
      const elapsed = Date.now() - startTime
      console.log(`${operation} completed in ${Math.round(elapsed/1000)}s`)
    }
  }
}

// USAGE EXAMPLE:
/*
const progress = createProgressTracker(assignments.length, 'Vehicle Assignment')

for (const assignment of assignments) {
  // Process assignment
  await processAssignment(assignment)
  progress.update()
}

progress.complete()
*/

module.exports = {
  batchUpdates,
  loadCustomerCache,
  enrichOrderWithCustomerData,
  optimizeRouteWithCache,
  assignVehiclesInParallel,
  preserveZoneInformation,
  smartGeocode,
  clearCaches,
  createProgressTracker
}