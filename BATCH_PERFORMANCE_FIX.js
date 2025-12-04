// PERFORMANCE FIX: Batch database operations instead of sequential updates

// FIND sequential updates like this in assignment logic:
/*
// OLD (SLOW - Individual updates):
for (const order of assignment.assignedOrders) {
  await supabase.from('pending_orders').update({
    status: 'assigned',
    assigned_vehicle_id: assignment.vehicle.id,
    assigned_driver_id: driverId,
    scheduled_date: today,
    delivery_sequence: idx + 1,
    location_group: order.location_group
  }).eq('id', order.id)
}
*/

// REPLACE WITH (FAST - Batch update):
async function batchUpdateOrders(assignments, date, driverId) {
  const batchUpdates = []
  
  assignments.forEach(assignment => {
    assignment.assignedOrders.forEach((order, idx) => {
      batchUpdates.push({
        id: order.id,
        status: 'assigned',
        assigned_vehicle_id: assignment.vehicle.id,
        assigned_driver_id: driverId,
        scheduled_date: date,
        delivery_sequence: idx + 1,
        location_group: order.location_group || order.locationGroup || 'Other'
      })
    })
  })
  
  // Single batch operation instead of multiple individual updates
  if (batchUpdates.length > 0) {
    await supabase.from('pending_orders').upsert(batchUpdates)
    console.log(`✓ Batch updated ${batchUpdates.length} orders`)
  }
}

// ALSO: Batch route geometry storage
async function batchStoreRouteGeometry(assignments, date) {
  const routeUpdates = assignments
    .filter(a => a.routeGeometry && a.assignedOrders.length > 0)
    .map(a => ({
      vehicle_id: a.vehicle.id,
      scheduled_date: date,
      route_geometry: a.routeGeometry,
      distance: a.routeDistance || 0,
      duration: a.routeDuration || 0,
      updated_at: new Date().toISOString()
    }))
  
  if (routeUpdates.length > 0) {
    await supabase.from('vehicle_routes').upsert(routeUpdates, {
      onConflict: 'vehicle_id,scheduled_date'
    })
    console.log(`✓ Batch stored ${routeUpdates.length} route geometries`)
  }
}

// Expected performance improvement: 50-70% faster assignments