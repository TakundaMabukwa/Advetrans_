// CRITICAL FIX: Replace on-the-fly geocoding with pre-stored customer zones

// FIND THIS in load-plan page (Excel processing section):
/*
// OLD CODE (SLOW - API calls during assignment):
for (const order of ordersNeedingGeocode) {
  const result = await geocodeWithRules(order.customer_name, order.location, mapboxToken)
  if (result) {
    order.latitude = result.lat
    order.longitude = result.lng
    order.location_group = result.location_group
  }
}
*/

// REPLACE WITH (FAST - database lookup):
async function enrichOrdersWithCustomerZones(orders) {
  // Get all customer zones in one query
  const { data: customers } = await supabase
    .from('customers')
    .select('customer_id, zone, latitude, longitude, address')
    .in('customer_id', orders.map(o => o.customer_id))

  const customerMap = new Map(customers?.map(c => [c.customer_id, c]) || [])

  // Enrich orders with pre-stored data
  orders.forEach(order => {
    const customer = customerMap.get(order.customer_id)
    if (customer) {
      order.latitude = customer.latitude
      order.longitude = customer.longitude
      order.location_group = customer.zone  // ← This fixes "Other" issue
      order.location = customer.address
      order.needs_geocoding = false
    } else {
      order.needs_geocoding = true  // Flag for customer setup
    }
  })

  return orders
}

// ALSO UPDATE assignment database updates to preserve zones:
// FIND patterns like this:
/*
await supabase.from('pending_orders').update({
  status: 'assigned',
  assigned_vehicle_id: vehicleId,
  location_group: orderLocationGroup  // ← Make sure this preserves zone
})
*/

// ENSURE zone preservation:
const updateData = {
  status: 'assigned',
  assigned_vehicle_id: vehicleId,
  assigned_driver_id: driverId,
  scheduled_date: date
}

// CRITICAL: Only update location_group if we have better data
if (order.location_group && order.location_group !== 'Other') {
  updateData.location_group = order.location_group
}

await supabase.from('pending_orders').update(updateData).eq('id', order.id)