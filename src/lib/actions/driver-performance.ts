'use server'

export interface DriverPerformanceData {
  driverName: string
  plate: string | null
  currentPoints: number
  performanceLevel: string
  scores: {
    performanceRating: number
    insuranceRiskScore: number
    riskCategory: string
    insuranceMultiplier: number
  }
  violations: {
    total: number
    speed: number
    harshBraking: number
    nightDriving: number
  }
}

export async function getDriverPerformance(): Promise<DriverPerformanceData[]> {
  try {
    const response = await fetch('http://localhost:3001/api/eps-rewards/all-driver-profiles')
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Error fetching driver performance:', error)
    return []
  }
}