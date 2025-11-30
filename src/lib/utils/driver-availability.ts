/**
 * Utility functions for managing driver availability
 */

export async function updateDriverAvailability(driverIds: string[] | number[], available: boolean) {
  try {
    const response = await fetch('/api/drivers/availability', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ driverIds, available })
    })
    
    if (!response.ok) {
      throw new Error('Failed to update driver availability')
    }
    
    const result = await response.json()
    return result
  } catch (error) {
    console.error('Error updating driver availability:', error)
    throw error
  }
}

/**
 * Mark drivers as unavailable (when assigned to a trip)
 */
export async function markDriversUnavailable(driverIds: string[] | number[]) {
  return updateDriverAvailability(driverIds, false)
}

/**
 * Mark drivers as available (when trip is completed/cancelled)
 */
export async function markDriversAvailable(driverIds: string[] | number[]) {
  return updateDriverAvailability(driverIds, true)
}

/**
 * Extract driver IDs from trip assignments
 */
export function extractDriverIdsFromAssignments(assignments: any[]): string[] {
  if (!Array.isArray(assignments)) return []
  
  return assignments
    .flatMap(assignment => assignment.drivers || [])
    .map(driver => driver.id)
    .filter(id => id)
}