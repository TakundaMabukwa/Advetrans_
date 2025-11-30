/**
 * Bin Packing Optimizer for Vehicle Assignment
 * Uses First Fit Decreasing (FFD) algorithm to minimize vehicles
 */

import type { Order, Vehicle, VehicleAssignment } from './vehicle-assignment-rules'

interface GeographicZone {
  name: string
  orders: Order[]
  totalWeight: number
  centroid: { lat: number; lon: number }
}

/**
 * Haversine distance calculation
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
 * Create geographic zones using density-based clustering
 */
export function createGeographicZones(orders: Order[], maxZoneRadius: number = 50): GeographicZone[] {
  const ordersWithCoords = orders.filter(o => o.latitude && o.longitude)
  const zones: GeographicZone[] = []
  const assigned = new Set<Order>()

  // Sort by latitude for spatial locality
  const sortedOrders = [...ordersWithCoords].sort((a, b) => a.latitude! - b.latitude!)

  for (const order of sortedOrders) {
    if (assigned.has(order)) continue

    // Start new zone
    const zoneOrders: Order[] = [order]
    assigned.add(order)

    // Find all orders within radius
    for (const other of sortedOrders) {
      if (assigned.has(other)) continue

      const dist = haversineDistance(
        order.latitude!, order.longitude!,
        other.latitude!, other.longitude!
      )

      if (dist <= maxZoneRadius) {
        zoneOrders.push(other)
        assigned.add(other)
      }
    }

    // Calculate centroid
    const sumLat = zoneOrders.reduce((sum, o) => sum + o.latitude!, 0)
    const sumLon = zoneOrders.reduce((sum, o) => sum + o.longitude!, 0)
    const centroid = {
      lat: sumLat / zoneOrders.length,
      lon: sumLon / zoneOrders.length
    }

    const totalWeight = zoneOrders.reduce((sum, o) => sum + (o.totalWeight || 0), 0)

    zones.push({
      name: order.location_group || `Zone ${zones.length + 1}`,
      orders: zoneOrders,
      totalWeight,
      centroid
    })
  }

  return zones
}

/**
 * Merge nearby small zones to reduce vehicle count
 */
function mergeNearbyZones(zones: GeographicZone[], maxDistance: number = 150): GeographicZone[] {
  const merged: GeographicZone[] = []
  const used = new Set<GeographicZone>()

  // Sort zones by weight (smallest first - prioritize merging small zones)
  const sortedZones = [...zones].sort((a, b) => a.totalWeight - b.totalWeight)

  for (const zone of sortedZones) {
    if (used.has(zone)) continue

    // Find nearest zone within distance
    let nearestZone: GeographicZone | null = null
    let minDist = Infinity

    for (const other of sortedZones) {
      if (other === zone || used.has(other)) continue

      const dist = haversineDistance(
        zone.centroid.lat, zone.centroid.lon,
        other.centroid.lat, other.centroid.lon
      )

      if (dist <= maxDistance && dist < minDist) {
        minDist = dist
        nearestZone = other
      }
    }

    if (nearestZone) {
      // Merge zones
      const combinedOrders = [...zone.orders, ...nearestZone.orders]
      const combinedWeight = zone.totalWeight + nearestZone.totalWeight
      const sumLat = combinedOrders.reduce((sum, o) => sum + o.latitude!, 0)
      const sumLon = combinedOrders.reduce((sum, o) => sum + o.longitude!, 0)

      merged.push({
        name: `${zone.name} + ${nearestZone.name}`,
        orders: combinedOrders,
        totalWeight: combinedWeight,
        centroid: {
          lat: sumLat / combinedOrders.length,
          lon: sumLon / combinedOrders.length
        }
      })

      used.add(zone)
      used.add(nearestZone)
    } else {
      // Keep zone as-is
      merged.push(zone)
      used.add(zone)
    }
  }

  return merged
}

/**
 * Check if order can be assigned to vehicle (restrictions check)
 */
function canAssignToVehicle(order: Order, vehicle: Vehicle): boolean {
  const customerName = (order.customerName || '').toLowerCase()
  const restrictions = (vehicle.restrictions || '').toLowerCase()
  const hasDrums = (order.drums || 0) > 0

  // Check customer restrictions
  const noPattern = /no\s+(\w+)/gi
  let match
  while ((match = noPattern.exec(restrictions)) !== null) {
    const restrictedCustomer = match[1].toLowerCase()
    if (customerName.includes(restrictedCustomer)) {
      return false
    }
  }

  // Check drum restrictions
  if (hasDrums) {
    if (restrictions.includes('no') && restrictions.includes('210') && 
        restrictions.includes('drum') && !restrictions.includes('ideally')) {
      return false
    }
  }

  return true
}

/**
 * Bin Packing First Fit Decreasing Algorithm
 * Minimizes number of vehicles by packing orders efficiently
 */
export function binPackingOptimizer(
  orders: Order[],
  vehicles: Vehicle[],
  targetUtilization: number = 0.85
): VehicleAssignment[] {
  console.log(`\n=== BIN PACKING OPTIMIZER ===`)
  console.log(`Orders: ${orders.length}, Vehicles: ${vehicles.length}, Target: ${Math.round(targetUtilization * 100)}%`)

  // Initialize assignments
  const assignments: VehicleAssignment[] = vehicles.map(vehicle => ({
    vehicle,
    assignedOrders: [],
    totalWeight: 0,
    capacity: vehicle.load_capacity,
    utilization: 0,
    assignedDrivers: []
  }))

  // Separate orders by restrictions
  const drumOrders = orders.filter(o => (o.drums || 0) > 0)
  const restrictedOrders = orders.filter(o => {
    const customerName = (o.customerName || '').toLowerCase()
    return (o.drums || 0) === 0 && vehicles.some(v => {
      const restrictions = (v.restrictions || '').toLowerCase()
      const noPattern = /no\s+(\w+)/gi
      let match
      while ((match = noPattern.exec(restrictions)) !== null) {
        if (customerName.includes(match[1].toLowerCase())) return true
      }
      return false
    })
  })
  const normalOrders = orders.filter(o => 
    !drumOrders.includes(o) && !restrictedOrders.includes(o)
  )

  console.log(`Drums: ${drumOrders.length}, Restricted: ${restrictedOrders.length}, Normal: ${normalOrders.length}`)

  // Sort each category by weight (heaviest first)
  const sortByWeight = (a: Order, b: Order) => {
    const weightA = a.totalWeight || (a.drums || 0) * 200
    const weightB = b.totalWeight || (b.drums || 0) * 200
    return weightB - weightA
  }

  drumOrders.sort(sortByWeight)
  restrictedOrders.sort(sortByWeight)
  normalOrders.sort(sortByWeight)

  // Process in order: drums, restricted, normal
  const orderedOrders = [...drumOrders, ...restrictedOrders, ...normalOrders]
  const unassigned: Order[] = []

  // First Fit Decreasing: Try to fit each order in first available vehicle
  for (const order of orderedOrders) {
    const orderWeight = order.totalWeight || (order.drums || 0) * 200
    let assigned = false

    // Try existing vehicles first (fill before opening new ones)
    const sortedVehicles = [...assignments]
      .filter(a => a.assignedOrders.length > 0) // Prioritize vehicles already in use
      .sort((a, b) => b.utilization - a.utilization) // Fill fuller vehicles first

    for (const vehicle of sortedVehicles) {
      const maxCapacity = vehicle.capacity * 0.95
      const remainingCapacity = maxCapacity - vehicle.totalWeight

      if (remainingCapacity >= orderWeight && canAssignToVehicle(order, vehicle.vehicle)) {
        // Check geographic proximity (within 75km of existing orders)
        if (order.latitude && order.longitude) {
          const distances = vehicle.assignedOrders
            .filter(o => o.latitude && o.longitude)
            .map(o => haversineDistance(order.latitude!, order.longitude!, o.latitude!, o.longitude!))
          
          if (distances.length > 0 && Math.min(...distances) > 75) {
            continue // Too far from existing route
          }
        }

        vehicle.assignedOrders.push(order)
        vehicle.totalWeight += orderWeight
        vehicle.utilization = (vehicle.totalWeight / vehicle.capacity) * 100
        assigned = true
        break
      }
    }

    // If not assigned, try empty vehicles
    if (!assigned) {
      const emptyVehicles = assignments
        .filter(a => a.assignedOrders.length === 0)
        .sort((a, b) => a.capacity - b.capacity) // Use smallest vehicle that fits

      for (const vehicle of emptyVehicles) {
        const maxCapacity = vehicle.capacity * 0.95

        if (orderWeight <= maxCapacity && canAssignToVehicle(order, vehicle.vehicle)) {
          vehicle.assignedOrders.push(order)
          vehicle.totalWeight = orderWeight
          vehicle.utilization = (vehicle.totalWeight / vehicle.capacity) * 100
          vehicle.destinationGroup = order.location_group || 'Unknown'
          assigned = true
          break
        }
      }
    }

    if (!assigned) {
      unassigned.push(order)
    }
  }

  // Consolidation pass: Merge underutilized vehicles
  console.log(`\n=== AGGRESSIVE CONSOLIDATION PASS ===`)
  const activeVehicles = assignments.filter(a => a.assignedOrders.length > 0)
  const underutilized = activeVehicles.filter(a => a.utilization < 70).sort((a, b) => a.utilization - b.utilization)

  console.log(`Found ${underutilized.length} underutilized vehicles (<70%):`)
  underutilized.forEach(v => console.log(`  ${v.vehicle.registration_number}: ${Math.round(v.utilization)}% (${v.assignedOrders.length} orders)`))

  for (const source of underutilized) {
    if (source.assignedOrders.length === 0) continue

    // Try to merge into ANY vehicle with capacity (increased distance tolerance)
    const targets = activeVehicles
      .filter(t => t !== source && t.utilization < 90)
      .sort((a, b) => b.utilization - a.utilization) // Prefer fuller vehicles

    for (const target of targets) {
      const combinedWeight = target.totalWeight + source.totalWeight
      const maxCapacity = target.capacity * 0.95

      if (combinedWeight <= maxCapacity) {
        // Check all orders are compatible
        const allCompatible = source.assignedOrders.every(o => canAssignToVehicle(o, target.vehicle))
        if (!allCompatible) continue

        // Check geographic proximity (INCREASED to 200km for better consolidation)
        let maxDist = 0
        for (const sourceOrder of source.assignedOrders) {
          if (sourceOrder.latitude && sourceOrder.longitude) {
            for (const targetOrder of target.assignedOrders) {
              if (targetOrder.latitude && targetOrder.longitude) {
                const dist = haversineDistance(
                  sourceOrder.latitude, sourceOrder.longitude,
                  targetOrder.latitude, targetOrder.longitude
                )
                maxDist = Math.max(maxDist, dist)
              }
            }
          }
        }

        // Allow merging if within 200km (regional grouping)
        if (maxDist <= 200 || maxDist === 0) {
          // Merge
          target.assignedOrders.push(...source.assignedOrders)
          target.totalWeight = combinedWeight
          target.utilization = (target.totalWeight / target.capacity) * 100
          target.destinationGroup = target.destinationGroup || source.destinationGroup

          source.assignedOrders = []
          source.totalWeight = 0
          source.utilization = 0
          source.destinationGroup = undefined

          console.log(`✓ Merged ${source.vehicle.registration_number} → ${target.vehicle.registration_number} (${Math.round(target.utilization)}%, max dist: ${Math.round(maxDist)}km)`)
          break
        } else {
          console.log(`✗ Cannot merge ${source.vehicle.registration_number} → ${target.vehicle.registration_number} (${Math.round(maxDist)}km too far)`)
        }
      }
    }
  }

  const finalActive = assignments.filter(a => a.assignedOrders.length > 0)
  const avgUtilization = finalActive.reduce((sum, a) => sum + a.utilization, 0) / finalActive.length

  console.log(`\n=== RESULTS ===`)
  console.log(`Vehicles used: ${finalActive.length}`)
  console.log(`Average utilization: ${Math.round(avgUtilization)}%`)
  console.log(`Unassigned orders: ${unassigned.length}`)

  return assignments
}
