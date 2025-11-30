import { createClient } from '@/lib/supabase/client'

export interface VehicleCapacityInfo {
  vehicleId: number
  registrationNumber: string
  loadCapacity: number
  currentLoad: number
  availableCapacity: number
  utilizationPercent: number
  orderCount: number
  scheduledDate: string
}

/**
 * Get current vehicle capacity for a specific date
 * Shows how much space is already filled vs available
 */
export async function getVehicleCapacityForDate(date: string): Promise<VehicleCapacityInfo[]> {
  const supabase = createClient()
  
  try {
    // Get all vehicles
    const { data: vehicles, error: vehiclesError } = await supabase
      .from('vehiclesc')
      .select('id, registration_number, load_capacity')
      .not('load_capacity', 'is', null)
      .gt('load_capacity', 0)
      .order('registration_number')
    
    if (vehiclesError) throw vehiclesError
    if (!vehicles) return []
    
    // Get assigned orders for this date
    const { data: orders, error: ordersError } = await supabase
      .from('pending_orders')
      .select('assigned_vehicle_id, total_weight')
      .eq('scheduled_date', date)
      .in('status', ['assigned', 'in_progress', 'scheduled'])
    
    if (ordersError) throw ordersError
    
    // Calculate capacity for each vehicle
    const capacityInfo: VehicleCapacityInfo[] = vehicles.map(vehicle => {
      const vehicleOrders = orders?.filter(o => o.assigned_vehicle_id === vehicle.id) || []
      const currentLoad = vehicleOrders.reduce((sum, o) => sum + (o.total_weight || 0), 0)
      const availableCapacity = vehicle.load_capacity - currentLoad
      const utilizationPercent = (currentLoad / vehicle.load_capacity) * 100
      
      return {
        vehicleId: vehicle.id,
        registrationNumber: vehicle.registration_number,
        loadCapacity: vehicle.load_capacity,
        currentLoad,
        availableCapacity,
        utilizationPercent: Math.round(utilizationPercent * 100) / 100,
        orderCount: vehicleOrders.length,
        scheduledDate: date
      }
    })
    
    return capacityInfo
  } catch (error) {
    console.error('Error fetching vehicle capacity:', error)
    return []
  }
}

/**
 * Print vehicle capacity summary to console
 */
export function printVehicleCapacitySummary(capacityInfo: VehicleCapacityInfo[]): void {
  console.log('\\n=== VEHICLE CAPACITY SUMMARY ===')
  console.log(`Date: ${capacityInfo[0]?.scheduledDate || 'N/A'}\\n`)
  
  for (const info of capacityInfo) {
    const bar = generateCapacityBar(info.utilizationPercent)
    console.log(`${info.registrationNumber.padEnd(20)} ${bar} ${Math.round(info.utilizationPercent)}%`)
    console.log(`  ${Math.round(info.currentLoad)}kg / ${info.loadCapacity}kg | ${info.orderCount} orders | ${Math.round(info.availableCapacity)}kg available\\n`)
  }
  
  const totalCapacity = capacityInfo.reduce((sum, v) => sum + v.loadCapacity, 0)
  const totalUsed = capacityInfo.reduce((sum, v) => sum + v.currentLoad, 0)
  const totalAvailable = totalCapacity - totalUsed
  const overallUtilization = (totalUsed / totalCapacity) * 100
  
  console.log('=== FLEET SUMMARY ===')
  console.log(`Total Capacity: ${Math.round(totalCapacity)}kg`)
  console.log(`Currently Used: ${Math.round(totalUsed)}kg (${Math.round(overallUtilization)}%)`)
  console.log(`Available: ${Math.round(totalAvailable)}kg`)
  console.log(`Active Vehicles: ${capacityInfo.filter(v => v.orderCount > 0).length} / ${capacityInfo.length}`)
}

/**
 * Generate a visual capacity bar
 */
function generateCapacityBar(percent: number, width: number = 20): string {
  const filled = Math.round((percent / 100) * width)
  const empty = width - filled
  
  let color = '🟩' // Green for low utilization
  if (percent >= 90) color = '🟥' // Red for high utilization
  else if (percent >= 70) color = '🟨' // Yellow for medium utilization
  
  return color.repeat(filled) + '⬜'.repeat(empty)
}
