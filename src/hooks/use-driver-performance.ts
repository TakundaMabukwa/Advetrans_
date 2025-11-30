import { useState, useEffect } from 'react'

interface DriverPerformanceData {
  driverName: string
  plate: string
  totalPoints: number
  rewardLevel: string
  speedCompliance: number
  routeCompliance: number
  safetyScore: number
  efficiency: number
  violations: number
  lastUpdate: string
}

export function useDriverPerformance() {
  const [performanceData, setPerformanceData] = useState<Record<string, DriverPerformanceData>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPerformanceData = async (driverName: string) => {
    if (performanceData[driverName]) return performanceData[driverName]

    try {
      setLoading(true)
      setError(null)
      
      const endDate = new Date().toISOString().split('T')[0]
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      
      const response = await fetch(`/api/eps-rewards?endpoint=driver-performance&driverName=${encodeURIComponent(driverName)}&startDate=${startDate}&endDate=${endDate}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch driver performance')
      }
      
      const data = await response.json()
      
      const performance: DriverPerformanceData = {
        driverName: data.driverName || driverName,
        plate: data.plate || '',
        totalPoints: data.totalPoints || 0,
        rewardLevel: data.rewardLevel || 'Bronze',
        speedCompliance: data.speedCompliance || 0,
        routeCompliance: data.routeCompliance || 0,
        safetyScore: data.safetyScore || 0,
        efficiency: data.efficiency || 0,
        violations: data.violations || 0,
        lastUpdate: data.lastUpdate || new Date().toISOString()
      }
      
      setPerformanceData(prev => ({
        ...prev,
        [driverName]: performance
      }))
      
      return performance
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return null
    } finally {
      setLoading(false)
    }
  }

  const getDriverPerformance = (driverName: string) => {
    return performanceData[driverName] || null
  }

  return {
    fetchPerformanceData,
    getDriverPerformance,
    loading,
    error
  }
}