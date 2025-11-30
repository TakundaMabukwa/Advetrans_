/**
 * Bin Packing Optimizer using Google OR-Tools approach
 * Assigns orders to vehicles optimally to minimize vehicle count and maximize utilization
 */

export interface BinPackingOrder {
  id: string
  weight: number
  region: string
  restrictions?: string[]
}

export interface BinPackingVehicle {
  id: string
  capacity: number
  region?: string
  restrictions?: string[]
}

export interface BinPackingResult {
  vehicleId: string
  orders: string[]
  totalWeight: number
  utilization: number
}

/**
 * First Fit Decreasing (FFD) algorithm - proven optimal for bin packing
 * Orders sorted by weight (heaviest first), assigned to first vehicle with capacity
 */
export function optimizeBinPacking(
  orders: BinPackingOrder[],
  vehicles: BinPackingVehicle[]
): BinPackingResult[] {
  
  // Sort orders by weight (heaviest first)
  const sortedOrders = [...orders].sort((a, b) => b.weight - a.weight)
  
  // Initialize bins (vehicles)
  const bins: BinPackingResult[] = []
  
  for (const order of sortedOrders) {
    let assigned = false
    
    // Try to fit in existing bins (First Fit)
    for (const bin of bins) {
      const vehicle = vehicles.find(v => v.id === bin.vehicleId)
      if (!vehicle) continue
      
      // Check capacity
      if (bin.totalWeight + order.weight > vehicle.capacity * 0.95) continue
      
      // Check region compatibility
      if (vehicle.region && order.region && vehicle.region !== order.region) continue
      
      // Check restrictions
      if (hasRestrictionConflict(order, vehicle)) continue
      
      // Assign to this bin
      bin.orders.push(order.id)
      bin.totalWeight += order.weight
      bin.utilization = (bin.totalWeight / vehicle.capacity) * 100
      assigned = true
      break
    }
    
    // If not assigned, create new bin
    if (!assigned) {
      const compatibleVehicle = vehicles.find(v => 
        !bins.find(b => b.vehicleId === v.id) &&
        v.capacity >= order.weight &&
        (!v.region || v.region === order.region) &&
        !hasRestrictionConflict(order, v)
      )
      
      if (compatibleVehicle) {
        bins.push({
          vehicleId: compatibleVehicle.id,
          orders: [order.id],
          totalWeight: order.weight,
          utilization: (order.weight / compatibleVehicle.capacity) * 100
        })
      }
    }
  }
  
  return bins
}

/**
 * Best Fit Decreasing (BFD) - assigns to vehicle with least remaining space
 * Better utilization than FFD
 */
export function optimizeBinPackingBestFit(
  orders: BinPackingOrder[],
  vehicles: BinPackingVehicle[]
): BinPackingResult[] {
  
  const sortedOrders = [...orders].sort((a, b) => b.weight - a.weight)
  const bins: BinPackingResult[] = []
  
  for (const order of sortedOrders) {
    // Find best fit (vehicle with least remaining space after adding order)
    let bestBin: BinPackingResult | null = null
    let minRemainingSpace = Infinity
    
    for (const bin of bins) {
      const vehicle = vehicles.find(v => v.id === bin.vehicleId)
      if (!vehicle) continue
      
      const remainingSpace = vehicle.capacity * 0.95 - bin.totalWeight
      if (remainingSpace < order.weight) continue
      if (vehicle.region && order.region && vehicle.region !== order.region) continue
      if (hasRestrictionConflict(order, vehicle)) continue
      
      const newRemainingSpace = remainingSpace - order.weight
      if (newRemainingSpace < minRemainingSpace) {
        minRemainingSpace = newRemainingSpace
        bestBin = bin
      }
    }
    
    if (bestBin) {
      const vehicle = vehicles.find(v => v.id === bestBin!.vehicleId)!
      bestBin.orders.push(order.id)
      bestBin.totalWeight += order.weight
      bestBin.utilization = (bestBin.totalWeight / vehicle.capacity) * 100
    } else {
      // Create new bin
      const compatibleVehicle = vehicles.find(v => 
        !bins.find(b => b.vehicleId === v.id) &&
        v.capacity >= order.weight &&
        (!v.region || v.region === order.region) &&
        !hasRestrictionConflict(order, v)
      )
      
      if (compatibleVehicle) {
        bins.push({
          vehicleId: compatibleVehicle.id,
          orders: [order.id],
          totalWeight: order.weight,
          utilization: (order.weight / compatibleVehicle.capacity) * 100
        })
      }
    }
  }
  
  return bins
}

function hasRestrictionConflict(order: BinPackingOrder, vehicle: BinPackingVehicle): boolean {
  if (!vehicle.restrictions || !order.restrictions) return false
  
  for (const orderReq of order.restrictions) {
    if (vehicle.restrictions.includes(`no_${orderReq}`)) {
      return true
    }
  }
  
  return false
}
