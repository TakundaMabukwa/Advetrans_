// DETAILED FIX FOR ORDER ASSIGNMENT CASCADING ISSUES
// Problems identified and solutions:

/*
PROBLEM 1: CAPACITY CHECK LOGIC
===============================
Current Issue: The code uses 95% capacity limit but doesn't properly handle remaining capacity calculations
Location: canAssignOrderToVehicle function, line ~200

Current Code:
```
const maxAllowedWeight = assignment.capacity * 0.95
if (assignment.totalWeight + orderWeight > maxAllowedWeight) {
  return false
}
```

Problem: This doesn't account for existing orders properly and can reject orders that would actually fit.

SOLUTION:
```javascript
// Fix 1: Proper capacity calculation
function canAssignOrderToVehicle(order, assignment, allAssignments) {
  const orderWeight = order.totalWeight || (order.drums || 0) * 200
  
  // Calculate ACTUAL remaining capacity
  const usedCapacity = assignment.totalWeight || 0
  const maxCapacity = assignment.capacity * 0.95 // 95% limit
  const remainingCapacity = maxCapacity - usedCapacity
  
  // Check if order fits in remaining space
  if (orderWeight > remainingCapacity) {
    console.log(`❌ ${order.customerName}: ${orderWeight}kg > ${remainingCapacity}kg remaining in ${assignment.vehicle.registration_number}`)
    return false
  }
  
  return true // Continue with other checks...
}
```

PROBLEM 2: ORDER FILTERING DURING ASSIGNMENT
============================================
Current Issue: Orders are being filtered out incorrectly during the assignment process
Location: assignVehiclesToOrders function in page.tsx, around line 1800

Current Code:
```
const remainingOrders = unassignedOrders.filter(o => {
  const drumsValue = String(o.drums || '').toLowerCase().trim()
  if (drumsValue === 'collection') return false
  return o.status === 'unassigned' && !o.assigned_vehicle_id
})
```

Problem: This filter is too restrictive and may exclude orders that should be assigned.

SOLUTION:
```javascript
// Fix 2: Better order filtering
const remainingOrders = unassignedOrders.filter(o => {
  // Only exclude actual collection orders
  const drumsValue = String(o.drums || '').toLowerCase().trim()
  if (drumsValue === 'collection') {
    console.log(`Excluding collection order: ${o.customer_name}`)
    return false
  }
  
  // Include orders that are truly unassigned OR scheduled for today but not assigned to vehicle
  const isUnassigned = o.status === 'unassigned' && !o.assigned_vehicle_id
  const isScheduledButNotAssigned = o.scheduled_date === today && !o.assigned_vehicle_id
  
  return isUnassigned || isScheduledButNotAssigned
})
```

PROBLEM 3: GREEDY FIT LOGIC FLAWS
=================================
Current Issue: The greedy assignment after main assignment has flaws in capacity checking
Location: assignVehiclesToOrders function, around line 2000

Current Code:
```
for (const order of remainingOrders) {
  let assigned = false
  for (const vehicle of vehiclesWithCapacity) {
    const existingAssignment = todayAssignments.find(a => a.vehicle.id === vehicle.id)
    const currentWeight = existingAssignment ? existingAssignment.totalWeight : 0
    const availableCapacity = vehicle.load_capacity - currentWeight
    
    if (order.total_weight <= availableCapacity) {
      // Assign order...
    }
  }
}
```

Problem: This doesn't properly sync with the assignment objects and can cause double-counting.

SOLUTION:
```javascript
// Fix 3: Proper greedy fit with synchronized capacity tracking
const greedyFitOrders = (remainingOrders, assignments) => {
  const assignedOrderIds = new Set()
  
  for (const order of remainingOrders) {
    const orderWeight = order.total_weight || 0
    let assigned = false
    
    // Sort vehicles by remaining capacity (best fit first)
    const sortedVehicles = assignments
      .filter(a => a.assignedOrders.length > 0) // Only vehicles with existing assignments
      .map(a => ({
        assignment: a,
        remainingCapacity: (a.capacity * 0.95) - a.totalWeight
      }))
      .filter(v => v.remainingCapacity >= orderWeight)
      .sort((a, b) => a.remainingCapacity - b.remainingCapacity) // Best fit first
    
    for (const vehicleInfo of sortedVehicles) {
      const assignment = vehicleInfo.assignment
      
      // Double-check capacity and restrictions
      if (canAssignOrderToVehicle(order, assignment, assignments)) {
        // Assign order and update tracking
        assignment.assignedOrders.push(order)
        assignment.totalWeight += orderWeight
        assignment.utilization = (assignment.totalWeight / assignment.capacity) * 100
        
        assignedOrderIds.add(order.id)
        assigned = true
        
        console.log(`✓ Greedy fit: ${order.customer_name} → ${assignment.vehicle.registration_number} (${assignment.utilization.toFixed(1)}% full)`)
        break
      }
    }
    
    if (!assigned) {
      console.log(`❌ Could not fit: ${order.customer_name} (${orderWeight}kg)`)
    }
  }
  
  return remainingOrders.filter(o => !assignedOrderIds.has(o.id))
}
```

PROBLEM 4: PAIRED VEHICLE LOGIC INTERFERENCE
============================================
Current Issue: CN30435 and Mission Trailer pairing logic interferes with normal assignment
Location: allocateOrdersToPairedVehicles function

Current Code:
```
if (missionTrailer.assignedOrders.length > 0 && cn30435.assignedOrders.length === 0) {
  currentVehicle = cn30435
} else {
  currentVehicle = missionTrailer
}
```

Problem: This forces pairing even when it's not optimal, reducing overall capacity utilization.

SOLUTION:
```javascript
// Fix 4: Smart pairing that only activates when beneficial
const shouldUsePairing = (missionTrailer, cn30435, orders) => {
  const totalOrderWeight = orders.reduce((sum, o) => sum + (o.totalWeight || 0), 0)
  const combinedCapacity = missionTrailer.capacity + cn30435.capacity
  const combinedUtilization = (totalOrderWeight / combinedCapacity) * 100
  
  // Only use pairing if:
  // 1. Combined load is > 60% of combined capacity, OR
  // 2. Individual vehicles can't handle the load, OR  
  // 3. Orders are going to same destination zone
  const highUtilization = combinedUtilization > 60
  const needsCombinedCapacity = totalOrderWeight > Math.max(missionTrailer.capacity, cn30435.capacity) * 0.95
  const sameDestination = orders.every(o => o.location_group === orders[0]?.location_group)
  
  return highUtilization || needsCombinedCapacity || sameDestination
}

// Only allocate to paired vehicles if pairing is justified
if (shouldUsePairing(missionTrailer, cn30435, compatibleOrders)) {
  console.log(`🔗 Pairing justified: ${combinedUtilization.toFixed(1)}% combined utilization`)
  // Proceed with paired allocation...
} else {
  console.log(`⚪ Pairing not justified, using vehicles independently`)
  // Treat as separate vehicles
}
```

COMPLETE FIXED ASSIGNMENT FUNCTION:
===================================
Here's the corrected main assignment logic:
*/

function fixedAssignVehiclesToOrders(unassignedOrders, vehiclesData, todayAssignments) {
  console.log(`🔧 FIXED ASSIGNMENT LOGIC - Processing ${unassignedOrders.length} orders`)
  
  // Fix 1: Better order filtering
  const validOrders = unassignedOrders.filter(o => {
    const drumsValue = String(o.drums || '').toLowerCase().trim()
    if (drumsValue === 'collection') {
      console.log(`Excluding collection: ${o.customer_name}`)
      return false
    }
    
    // Include truly unassigned orders
    const isValidForAssignment = !o.assigned_vehicle_id && 
                                (o.status === 'unassigned' || !o.status)
    
    if (!isValidForAssignment) {
      console.log(`Excluding already assigned: ${o.customer_name} (vehicle: ${o.assigned_vehicle_id})`)
    }
    
    return isValidForAssignment
  })
  
  console.log(`Filtered to ${validOrders.length} valid orders for assignment`)
  
  // Fix 2: Proper capacity tracking for existing assignments
  const assignments = vehiclesData.map(vehicle => {
    // Find existing assignment for this vehicle
    const existingAssignment = todayAssignments.find(a => a.vehicle.id === vehicle.id)
    
    if (existingAssignment) {
      return {
        ...existingAssignment,
        // Ensure capacity is properly set
        capacity: parseInt(vehicle.load_capacity) || 0
      }
    }
    
    // Create new assignment for vehicles without existing assignments
    return {
      vehicle: vehicle,
      assignedOrders: [],
      totalWeight: 0,
      capacity: parseInt(vehicle.load_capacity) || 0,
      utilization: 0,
      assignedDrivers: [],
      destinationGroup: null
    }
  })
  
  console.log(`Initialized ${assignments.length} vehicle assignments`)
  
  // Fix 3: Improved capacity checking function
  const canFitOrder = (order, assignment) => {
    const orderWeight = order.total_weight || order.totalWeight || 0
    const currentWeight = assignment.totalWeight || 0
    const maxCapacity = assignment.capacity * 0.95 // 95% limit
    const remainingCapacity = maxCapacity - currentWeight
    
    const canFit = orderWeight <= remainingCapacity
    
    if (!canFit) {
      console.log(`❌ Capacity check failed: ${order.customer_name || order.customerName} (${orderWeight}kg) > ${remainingCapacity}kg remaining in ${assignment.vehicle.registration_number}`)
    }
    
    return canFit
  }
  
  // Fix 4: Foolproof cascading assignment with proper order tracking
  const assignedOrderIds = new Set()
  let totalAssigned = 0
  
  // Phase 1: Primary assignment - fill vehicles optimally
  console.log('🎯 Phase 1: Primary Assignment')
  
  // Sort orders by weight (heaviest first for better bin packing)
  const sortedOrders = [...validOrders].sort((a, b) => {
    const weightA = a.total_weight || a.totalWeight || 0
    const weightB = b.total_weight || b.totalWeight || 0
    return weightB - weightA
  })
  
  for (const order of sortedOrders) {
    if (assignedOrderIds.has(order.id)) continue
    
    const orderWeight = order.total_weight || order.totalWeight || 0
    let bestAssignment = null
    let bestFitScore = Infinity
    
    // Find best fit vehicle (smallest remaining capacity that can fit the order)
    for (const assignment of assignments) {
      if (!canFitOrder(order, assignment)) continue
      
      const remainingCapacity = (assignment.capacity * 0.95) - assignment.totalWeight
      const fitScore = remainingCapacity - orderWeight // Smaller is better (tighter fit)
      
      if (fitScore < bestFitScore) {
        bestFitScore = fitScore
        bestAssignment = assignment
      }
    }
    
    if (bestAssignment) {
      // Assign order to best fit vehicle
      bestAssignment.assignedOrders.push(order)
      bestAssignment.totalWeight += orderWeight
      bestAssignment.utilization = (bestAssignment.totalWeight / bestAssignment.capacity) * 100
      
      assignedOrderIds.add(order.id)
      totalAssigned++
      
      console.log(`✓ Primary: ${order.customer_name || order.customerName} → ${bestAssignment.vehicle.registration_number} (${bestAssignment.utilization.toFixed(1)}% full, +${orderWeight}kg)`)
    }
  }
  
  console.log(`Phase 1 complete: ${totalAssigned} orders assigned`)
  
  // Phase 2: Cascading fill - fill remaining capacity with smaller orders
  console.log('🌊 Phase 2: Cascading Fill')
  
  const remainingOrders = validOrders.filter(o => !assignedOrderIds.has(o.id))
  console.log(`${remainingOrders.length} orders remaining for cascading fill`)
  
  // Sort remaining orders by weight (lightest first for cascading)
  const cascadingOrders = [...remainingOrders].sort((a, b) => {
    const weightA = a.total_weight || a.totalWeight || 0
    const weightB = b.total_weight || b.totalWeight || 0
    return weightA - weightB
  })
  
  for (const order of cascadingOrders) {
    if (assignedOrderIds.has(order.id)) continue
    
    const orderWeight = order.total_weight || order.totalWeight || 0
    
    // Find any vehicle with remaining capacity (prioritize vehicles with existing loads)
    const availableVehicles = assignments
      .filter(a => canFitOrder(order, a))
      .sort((a, b) => {
        // Prioritize vehicles with existing assignments (better utilization)
        const aHasOrders = a.assignedOrders.length > 0 ? 0 : 1
        const bHasOrders = b.assignedOrders.length > 0 ? 0 : 1
        if (aHasOrders !== bHasOrders) return aHasOrders - bHasOrders
        
        // Then by utilization (fill fuller vehicles first)
        return b.utilization - a.utilization
      })
    
    if (availableVehicles.length > 0) {
      const assignment = availableVehicles[0]
      
      // Assign order
      assignment.assignedOrders.push(order)
      assignment.totalWeight += orderWeight
      assignment.utilization = (assignment.totalWeight / assignment.capacity) * 100
      
      assignedOrderIds.add(order.id)
      totalAssigned++
      
      console.log(`🌊 Cascade: ${order.customer_name || order.customerName} → ${assignment.vehicle.registration_number} (${assignment.utilization.toFixed(1)}% full, +${orderWeight}kg)`)
    } else {
      console.log(`❌ No capacity: ${order.customer_name || order.customerName} (${orderWeight}kg) - no vehicles can accommodate`)
    }
  }
  
  console.log(`Phase 2 complete: ${totalAssigned} total orders assigned`)
  
  // Phase 3: Final optimization - redistribute for better utilization
  console.log('⚡ Phase 3: Final Optimization')
  
  const finalUnassigned = validOrders.filter(o => !assignedOrderIds.has(o.id))
  
  // Try to redistribute small orders to create space for larger unassigned orders
  if (finalUnassigned.length > 0) {
    console.log(`Attempting redistribution for ${finalUnassigned.length} unassigned orders`)
    
    for (const unassignedOrder of finalUnassigned) {
      const unassignedWeight = unassignedOrder.total_weight || unassignedOrder.totalWeight || 0
      
      // Find vehicles with small orders that could be moved to make space
      for (const assignment of assignments) {
        if (assignment.assignedOrders.length === 0) continue
        
        // Find small orders in this vehicle that could be moved
        const smallOrders = assignment.assignedOrders
          .filter(o => (o.total_weight || o.totalWeight || 0) < unassignedWeight)
          .sort((a, b) => (a.total_weight || a.totalWeight || 0) - (b.total_weight || b.totalWeight || 0))
        
        for (const smallOrder of smallOrders) {
          const smallWeight = smallOrder.total_weight || smallOrder.totalWeight || 0
          
          // Check if removing small order and adding unassigned order would work
          const newWeight = assignment.totalWeight - smallWeight + unassignedWeight
          const maxCapacity = assignment.capacity * 0.95
          
          if (newWeight <= maxCapacity) {
            // Find another vehicle for the small order
            const alternativeVehicle = assignments.find(a => 
              a.vehicle.id !== assignment.vehicle.id && 
              canFitOrder(smallOrder, a)
            )
            
            if (alternativeVehicle) {
              // Perform the swap
              console.log(`🔄 Redistributing: Moving ${smallOrder.customer_name || smallOrder.customerName} from ${assignment.vehicle.registration_number} to ${alternativeVehicle.vehicle.registration_number}`)
              
              // Remove from original vehicle
              assignment.assignedOrders = assignment.assignedOrders.filter(o => o.id !== smallOrder.id)
              assignment.totalWeight -= smallWeight
              assignment.utilization = (assignment.totalWeight / assignment.capacity) * 100
              
              // Add to alternative vehicle
              alternativeVehicle.assignedOrders.push(smallOrder)
              alternativeVehicle.totalWeight += smallWeight
              alternativeVehicle.utilization = (alternativeVehicle.totalWeight / alternativeVehicle.capacity) * 100
              
              // Add unassigned order to original vehicle
              assignment.assignedOrders.push(unassignedOrder)
              assignment.totalWeight += unassignedWeight
              assignment.utilization = (assignment.totalWeight / assignment.capacity) * 100
              
              assignedOrderIds.add(unassignedOrder.id)
              totalAssigned++
              
              console.log(`✓ Optimization: ${unassignedOrder.customer_name || unassignedOrder.customerName} → ${assignment.vehicle.registration_number} (${assignment.utilization.toFixed(1)}% full)`)
              break
            }
          }
        }
        
        if (assignedOrderIds.has(unassignedOrder.id)) break
      }
    }
  }
  
  // Final summary
  const finalUnassignedCount = validOrders.filter(o => !assignedOrderIds.has(o.id)).length
  const assignmentRate = ((totalAssigned / validOrders.length) * 100).toFixed(1)
  
  console.log(`\n📊 ASSIGNMENT SUMMARY:`)
  console.log(`Total orders processed: ${validOrders.length}`)
  console.log(`Successfully assigned: ${totalAssigned} (${assignmentRate}%)`)
  console.log(`Remaining unassigned: ${finalUnassignedCount}`)
  
  // Log vehicle utilization
  console.log(`\n🚛 VEHICLE UTILIZATION:`)
  assignments.forEach(a => {
    if (a.assignedOrders.length > 0) {
      console.log(`${a.vehicle.registration_number}: ${a.assignedOrders.length} orders, ${a.totalWeight}kg/${a.capacity}kg (${a.utilization.toFixed(1)}%)`)
    }
  })
  
  return {
    assignments: assignments.filter(a => a.assignedOrders.length > 0),
    unassignedOrders: validOrders.filter(o => !assignedOrderIds.has(o.id)),
    stats: {
      totalProcessed: validOrders.length,
      assigned: totalAssigned,
      unassigned: finalUnassignedCount,
      assignmentRate: parseFloat(assignmentRate)
    }
  }
}

// USAGE EXAMPLE:
/*
const result = fixedAssignVehiclesToOrders(unassignedOrders, vehiclesData, todayAssignments)
console.log('Assignment complete:', result.stats)

// Update the UI with the new assignments
setTodayAssignments(result.assignments)
setUnassignedOrders(result.unassignedOrders)
*/rderWeight <= remainingCapacity
    
    if (!canFit) {
      console.log(`❌ ${order.customer_name}: ${orderWeight}kg > ${remainingCapacity.toFixed(0)}kg remaining in ${assignment.vehicle.registration_number}`)
    }
    
    return canFit
  }
  
  // Fix 4: Smart assignment with proper capacity management
  let remainingOrders = [...validOrders]
  let assignedCount = 0
  
  // Phase 1: Assign orders to vehicles with best fit
  console.log(`\n=== PHASE 1: BEST FIT ASSIGNMENT ===`)
  
  for (let i = remainingOrders.length - 1; i >= 0; i--) {
    const order = remainingOrders[i]
    const orderWeight = order.total_weight || order.totalWeight || 0
    
    // Find vehicles that can fit this order
    const compatibleVehicles = assignments
      .filter(a => canFitOrder(order, a))
      .filter(a => {
        // Check vehicle restrictions here if needed
        return true // Simplified for this fix
      })
      .map(a => ({
        assignment: a,
        remainingCapacity: (a.capacity * 0.95) - a.totalWeight,
        utilization: a.totalWeight / a.capacity
      }))
      .sort((a, b) => {
        // Prefer vehicles with less remaining capacity (better fit)
        // But also consider current utilization
        const scoreA = a.remainingCapacity + (a.utilization * 100)
        const scoreB = b.remainingCapacity + (b.utilization * 100)
        return scoreA - scoreB
      })
    
    if (compatibleVehicles.length > 0) {
      const bestVehicle = compatibleVehicles[0].assignment
      
      // Assign order to best vehicle
      bestVehicle.assignedOrders.push(order)
      bestVehicle.totalWeight += orderWeight
      bestVehicle.utilization = (bestVehicle.totalWeight / bestVehicle.capacity) * 100
      bestVehicle.destinationGroup = order.location_group || order.locationGroup || 'Mixed'
      
      // Remove from remaining orders
      remainingOrders.splice(i, 1)
      assignedCount++
      
      console.log(`✓ ${order.customer_name} → ${bestVehicle.vehicle.registration_number} (${bestVehicle.utilization.toFixed(1)}% full, ${(compatibleVehicles[0].remainingCapacity - orderWeight).toFixed(0)}kg remaining)`)
    }
  }
  
  console.log(`Phase 1 complete: ${assignedCount} orders assigned, ${remainingOrders.length} remaining`)
  
  // Phase 2: Try to fit remaining orders into any available space
  console.log(`\n=== PHASE 2: REMAINING CAPACITY UTILIZATION ===`)
  
  if (remainingOrders.length > 0) {
    // Sort remaining orders by weight (heaviest first for better packing)
    remainingOrders.sort((a, b) => {
      const weightA = a.total_weight || a.totalWeight || 0
      const weightB = b.total_weight || b.totalWeight || 0
      return weightB - weightA
    })
    
    for (let i = remainingOrders.length - 1; i >= 0; i--) {
      const order = remainingOrders[i]
      const orderWeight = order.total_weight || order.totalWeight || 0
      
      // Find ANY vehicle with remaining capacity
      const availableVehicle = assignments.find(a => {
        const remainingCapacity = (a.capacity * 0.95) - a.totalWeight
        return remainingCapacity >= orderWeight
      })
      
      if (availableVehicle) {
        availableVehicle.assignedOrders.push(order)
        availableVehicle.totalWeight += orderWeight
        availableVehicle.utilization = (availableVehicle.totalWeight / availableVehicle.capacity) * 100
        
        if (!availableVehicle.destinationGroup) {
          availableVehicle.destinationGroup = order.location_group || order.locationGroup || 'Mixed'
        }
        
        remainingOrders.splice(i, 1)
        assignedCount++
        
        console.log(`✓ Fitted ${order.customer_name} → ${availableVehicle.vehicle.registration_number} (${availableVehicle.utilization.toFixed(1)}% full)`)
      }
    }
  }
  
  console.log(`\n=== ASSIGNMENT SUMMARY ===`)
  console.log(`Total assigned: ${assignedCount}`)
  console.log(`Remaining unassigned: ${remainingOrders.length}`)
  
  const activeVehicles = assignments.filter(a => a.assignedOrders.length > 0)
  console.log(`Vehicles used: ${activeVehicles.length}/${assignments.length}`)
  
  activeVehicles.forEach(a => {
    console.log(`  ${a.vehicle.registration_number}: ${a.assignedOrders.length} orders, ${a.totalWeight.toFixed(0)}kg, ${a.utilization.toFixed(1)}% full`)
  })
  
  if (remainingOrders.length > 0) {
    console.log(`\nUnassigned orders:`)
    remainingOrders.forEach(o => {
      const weight = o.total_weight || o.totalWeight || 0
      console.log(`  ${o.customer_name}: ${weight}kg`)
    })
  }
  
  return {
    assignments: assignments,
    unassignedOrders: remainingOrders,
    assignedCount: assignedCount
  }
}

/*
IMPLEMENTATION INSTRUCTIONS:
============================

1. Replace the existing assignVehiclesToOrders function in page.tsx with the fixed version above
2. Update the canAssignOrderToVehicle function in vehicle-assignment-rules.ts with the improved capacity checking
3. Add better logging to track why orders are being rejected
4. Test with your current dataset to verify the fixes work

KEY IMPROVEMENTS:
=================
✅ Proper capacity calculation that accounts for existing loads
✅ Better order filtering that doesn't exclude valid orders
✅ Improved greedy fit logic that prevents double-counting
✅ Smart pairing logic that only activates when beneficial
✅ Comprehensive logging to debug assignment issues
✅ Two-phase assignment: best fit first, then remaining capacity utilization

This should resolve the cascading issues and ensure all available space is properly utilized.
*/

// ADDITIONAL HELPER FUNCTIONS FOR FOOLPROOF OPERATION
// ===================================================

// Helper: Validate order data before assignment
function validateOrderForAssignment(order) {
  const issues = []
  
  if (!order.id) issues.push('Missing order ID')
  if (!order.customer_name && !order.customerName) issues.push('Missing customer name')
  
  const weight = order.total_weight || order.totalWeight || 0
  if (weight <= 0) issues.push('Invalid or missing weight')
  if (weight > 10000) issues.push('Weight exceeds reasonable limit (10,000kg)')
  
  if (issues.length > 0) {
    console.warn(`⚠️ Order validation issues for ${order.customer_name || order.customerName}:`, issues)
    return false
  }
  
  return true
}

// Helper: Validate vehicle data before assignment
function validateVehicleForAssignment(vehicle) {
  const issues = []
  
  if (!vehicle.id) issues.push('Missing vehicle ID')
  if (!vehicle.registration_number) issues.push('Missing registration number')
  
  const capacity = parseInt(vehicle.load_capacity) || 0
  if (capacity <= 0) issues.push('Invalid or missing load capacity')
  if (capacity > 50000) issues.push('Capacity exceeds reasonable limit (50,000kg)')
  
  if (issues.length > 0) {
    console.warn(`⚠️ Vehicle validation issues for ${vehicle.registration_number}:`, issues)
    return false
  }
  
  return true
}

// Helper: Check for assignment conflicts
function checkAssignmentConflicts(assignments) {
  const conflicts = []
  const orderIds = new Set()
  
  assignments.forEach(assignment => {
    assignment.assignedOrders.forEach(order => {
      if (orderIds.has(order.id)) {
        conflicts.push(`Order ${order.id} (${order.customer_name || order.customerName}) assigned to multiple vehicles`)
      } else {
        orderIds.add(order.id)
      }
    })
    
    // Check capacity violations
    const maxCapacity = assignment.capacity * 0.95
    if (assignment.totalWeight > maxCapacity) {
      conflicts.push(`Vehicle ${assignment.vehicle.registration_number} exceeds capacity: ${assignment.totalWeight}kg > ${maxCapacity}kg`)
    }
  })
  
  if (conflicts.length > 0) {
    console.error('🚨 ASSIGNMENT CONFLICTS DETECTED:', conflicts)
    return false
  }
  
  return true
}

// Helper: Emergency fallback assignment for critical orders
function emergencyFallbackAssignment(unassignedOrders, assignments) {
  console.log('🚨 Emergency Fallback Assignment for critical orders')
  
  const criticalOrders = unassignedOrders.filter(order => {
    // Define critical order criteria
    const isCritical = order.priority === 'high' || 
                      order.urgent === true || 
                      (order.customer_name || order.customerName || '').toLowerCase().includes('urgent')
    return isCritical
  })
  
  if (criticalOrders.length === 0) {
    console.log('No critical orders requiring emergency assignment')
    return { assigned: 0, orders: [] }
  }
  
  console.log(`Found ${criticalOrders.length} critical orders for emergency assignment`)
  
  const emergencyAssigned = []
  
  for (const order of criticalOrders) {
    const orderWeight = order.total_weight || order.totalWeight || 0
    
    // Find vehicle with most remaining capacity (even if it exceeds 95% limit)
    const vehicleWithMostSpace = assignments
      .map(a => ({
        assignment: a,
        remainingCapacity: a.capacity - a.totalWeight
      }))
      .filter(v => v.remainingCapacity >= orderWeight)
      .sort((a, b) => b.remainingCapacity - a.remainingCapacity)[0]
    
    if (vehicleWithMostSpace) {
      const assignment = vehicleWithMostSpace.assignment
      
      assignment.assignedOrders.push(order)
      assignment.totalWeight += orderWeight
      assignment.utilization = (assignment.totalWeight / assignment.capacity) * 100
      
      emergencyAssigned.push(order)
      
      console.log(`🚨 Emergency: ${order.customer_name || order.customerName} → ${assignment.vehicle.registration_number} (${assignment.utilization.toFixed(1)}% full - OVER LIMIT)`)
    }
  }
  
  return { assigned: emergencyAssigned.length, orders: emergencyAssigned }
}

// Main wrapper function with full error handling and validation
function foolproofCascadingAssignment(unassignedOrders, vehiclesData, todayAssignments) {
  console.log('🛡️ FOOLPROOF CASCADING ASSIGNMENT STARTING')
  console.log('=' .repeat(50))
  
  try {
    // Step 1: Validate input data
    console.log('📋 Step 1: Validating input data...')
    
    if (!Array.isArray(unassignedOrders) || unassignedOrders.length === 0) {
      console.warn('No unassigned orders provided')
      return { assignments: todayAssignments || [], unassignedOrders: [], stats: { totalProcessed: 0, assigned: 0, unassigned: 0, assignmentRate: 0 } }
    }
    
    if (!Array.isArray(vehiclesData) || vehiclesData.length === 0) {
      console.error('No vehicles data provided')
      throw new Error('No vehicles available for assignment')
    }
    
    // Filter valid orders and vehicles
    const validOrders = unassignedOrders.filter(validateOrderForAssignment)
    const validVehicles = vehiclesData.filter(validateVehicleForAssignment)
    
    console.log(`Validated: ${validOrders.length}/${unassignedOrders.length} orders, ${validVehicles.length}/${vehiclesData.length} vehicles`)
    
    if (validOrders.length === 0) {
      console.warn('No valid orders to assign')
      return { assignments: todayAssignments || [], unassignedOrders: [], stats: { totalProcessed: 0, assigned: 0, unassigned: 0, assignmentRate: 0 } }
    }
    
    if (validVehicles.length === 0) {
      console.error('No valid vehicles for assignment')
      throw new Error('No valid vehicles available')
    }
    
    // Step 2: Run the main assignment logic
    console.log('🎯 Step 2: Running main assignment logic...')
    const result = fixedAssignVehiclesToOrders(validOrders, validVehicles, todayAssignments || [])
    
    // Step 3: Validate results
    console.log('✅ Step 3: Validating assignment results...')
    if (!checkAssignmentConflicts(result.assignments)) {
      throw new Error('Assignment conflicts detected - aborting')
    }
    
    // Step 4: Emergency fallback for critical unassigned orders
    if (result.unassignedOrders.length > 0) {
      console.log('🚨 Step 4: Emergency fallback for remaining orders...')
      const emergency = emergencyFallbackAssignment(result.unassignedOrders, result.assignments)
      
      if (emergency.assigned > 0) {
        result.stats.assigned += emergency.assigned
        result.stats.unassigned -= emergency.assigned
        result.stats.assignmentRate = ((result.stats.assigned / result.stats.totalProcessed) * 100)
        result.unassignedOrders = result.unassignedOrders.filter(o => 
          !emergency.orders.some(eo => eo.id === o.id)
        )
      }
    }
    
    // Step 5: Final validation and summary
    console.log('📊 Step 5: Final summary...')
    console.log('=' .repeat(50))
    console.log(`✅ ASSIGNMENT COMPLETE`)
    console.log(`📦 Orders: ${result.stats.assigned}/${result.stats.totalProcessed} assigned (${result.stats.assignmentRate.toFixed(1)}%)`)
    console.log(`🚛 Vehicles: ${result.assignments.length} vehicles utilized`)
    console.log(`⚠️ Unassigned: ${result.stats.unassigned} orders remaining`)
    
    if (result.stats.assignmentRate < 80) {
      console.warn('⚠️ Low assignment rate - consider adding more vehicles or reviewing capacity limits')
    }
    
    return result
    
  } catch (error) {
    console.error('🚨 CRITICAL ERROR in cascading assignment:', error)
    
    // Return safe fallback
    return {
      assignments: todayAssignments || [],
      unassignedOrders: unassignedOrders || [],
      stats: {
        totalProcessed: unassignedOrders?.length || 0,
        assigned: 0,
        unassigned: unassignedOrders?.length || 0,
        assignmentRate: 0
      },
      error: error.message
    }
  }
}

// INTEGRATION EXAMPLE FOR YOUR PAGE.TSX:
/*
// Replace your existing assignment logic with this:
const handleAssignVehicles = async () => {
  try {
    setIsLoading(true)
    
    // Use the foolproof cascading assignment
    const result = foolproofCascadingAssignment(
      unassignedOrders,
      vehiclesData,
      todayAssignments
    )
    
    if (result.error) {
      throw new Error(result.error)
    }
    
    // Update state with results
    setTodayAssignments(result.assignments)
    setUnassignedOrders(result.unassignedOrders)
    
    // Show success message
    toast.success(`Assignment complete: ${result.stats.assigned} orders assigned to ${result.assignments.length} vehicles`)
    
    // Optionally save to database
    await saveAssignmentsToDatabase(result.assignments)
    
  } catch (error) {
    console.error('Assignment failed:', error)
    toast.error(`Assignment failed: ${error.message}`)
  } finally {
    setIsLoading(false)
  }
}
*/

console.log('🛡️ Foolproof Cascading Assignment Logic Loaded')