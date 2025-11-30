'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { DailyStats } from '@/lib/eps-api'

interface MonthlyStatsTableProps {
  dailyStats: DailyStats[]
}

export function MonthlyStatsTable({ dailyStats }: MonthlyStatsTableProps) {
  // Process monthly fleet statistics data
  const processMonthlyFleetStats = () => {
    // Group daily stats by month
    const monthlyStats = dailyStats.reduce((acc, stat) => {
      const month = new Date(stat.date).toLocaleString('en-US', { month: 'long' })
      if (!acc[month]) {
        acc[month] = {
          totalDays: 0,
          numberOfTrips: 0,
          tripsOver5km: 0,
          totalKilometres: 0,
          totalIgnitionTime: 0,
          totalDriveTime: 0,
          totalIdleTime: 0,
          totalSpeedingDuration: 0,
          vehicleCount: 0
        }
      }
      
      // Aggregate data
      acc[month].totalDays = new Date(stat.date).getDate() // Days in month
      acc[month].numberOfTrips += 1 // Count each stat as a trip
      acc[month].tripsOver5km += (stat.total_distance > 5) ? 1 : 0
      acc[month].totalKilometres += stat.total_distance || 0
      acc[month].totalIgnitionTime += stat.total_driving_hours || 0
      acc[month].totalDriveTime += stat.total_driving_hours || 0
      acc[month].totalIdleTime += (stat.total_driving_hours || 0) * 0.1 // Estimate idle time
      acc[month].totalSpeedingDuration += (stat.speed_violations || 0) * 0.5 // Estimate speeding duration
      acc[month].vehicleCount += 1
      
      return acc
    }, {} as Record<string, any>)

    // Get months in order
    const monthOrder = ['July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March']
    
    console.log('📊 Monthly Fleet Stats Data:', monthlyStats)
    
    return { monthlyStats, monthOrder }
  }

  const { monthlyStats, monthOrder } = processMonthlyFleetStats()

  // Format time as HH:MM:SS
  const formatTime = (hours: number) => {
    if (isNaN(hours) || hours === null || hours === undefined) {
      return 'N/A'
    }
    if (hours === 0) {
      return '-'
    }
    const totalSeconds = Math.floor(hours * 3600)
    const h = Math.floor(totalSeconds / 3600)
    const m = Math.floor((totalSeconds % 3600) / 60)
    const s = totalSeconds % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // Format number values
  const formatNumber = (value: number) => {
    if (isNaN(value) || value === null || value === undefined) {
      return 'N/A'
    }
    if (value === 0) {
      return '-'
    }
    return value.toString()
  }

  // Format number with commas
  const formatNumberWithCommas = (value: number) => {
    if (isNaN(value) || value === null || value === undefined) {
      return 'N/A'
    }
    if (value === 0) {
      return '-'
    }
    return value.toLocaleString()
  }

  const metrics = [
    { key: 'totalDays', label: 'Total Days', format: formatNumber },
    { key: 'numberOfTrips', label: 'Number Of Trips', format: formatNumberWithCommas },
    { key: 'tripsOver5km', label: 'Number Of Trips > 5 km\'s', format: formatNumberWithCommas },
    { key: 'avgTripsPerVehicle', label: 'Average Trips / Vehicle / Month', format: formatNumber },
    { key: 'totalKilometres', label: 'Total Monthly Km\'s', format: formatNumberWithCommas },
    { key: 'avgKmPerVehicle', label: 'Average Km\'s / Vehicle / Month', format: formatNumber },
    { key: 'avgKmPerDay', label: 'Average Km\'s / Vehicle / Day', format: formatNumber },
    { key: 'avgKmPerTrip', label: 'Average Km\'s / Vehicle / Trip', format: formatNumber },
    { key: 'totalIgnitionTime', label: 'Total Ignition On Time', format: formatTime },
    { key: 'avgIgnitionTime', label: 'Average Hours / Vehicle Ignition Time', format: formatTime },
    { key: 'totalDriveTime', label: 'Total Drive Time', format: formatTime },
    { key: 'avgDriveTime', label: 'Average Hours / Vehicle Drive Time', format: formatTime },
    { key: 'totalIdleTime', label: 'Total Idle Time', format: formatTime },
    { key: 'avgIdleTime', label: 'Average Hours / Vehicle Idle Time', format: formatTime },
    { key: 'totalSpeedingDuration', label: 'Total Speeding Duration', format: formatTime },
    { key: 'avgSpeedingTime', label: 'Average Hours / Vehicle Speeding Time', format: formatTime },
  ]

  return (
    <Card className="bg-white shadow-lg p-6">
      <div className="bg-purple-800 -m-6 mb-6 p-4 rounded-t-lg text-white">
        <h3 className="font-bold text-xl text-center">Monthly Fleet Statistics</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="bg-white shadow-sm w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="bg-gray-100 p-1 border border-gray-300 font-semibold text-gray-800 text-sm text-left">Statistic</th>
              {monthOrder.map(month => (
                <th key={month} className="bg-gray-100 p-1 border border-gray-300 font-semibold text-gray-800 text-sm text-center">
                  {month}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metrics.map((metric, index) => (
              <tr key={metric.key} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="p-1 border border-gray-300 font-medium text-gray-800 text-sm">{metric.label}</td>
                {monthOrder.map(month => {
                  const stats = monthlyStats[month]
                  let value = 0
                  
                  // Calculate derived values
                  if (metric.key === 'avgTripsPerVehicle') {
                    value = stats ? stats.numberOfTrips / Math.max(stats.vehicleCount, 1) : 0
                  } else if (metric.key === 'avgKmPerVehicle') {
                    value = stats ? stats.totalKilometres / Math.max(stats.vehicleCount, 1) : 0
                  } else if (metric.key === 'avgKmPerDay') {
                    value = stats ? stats.totalKilometres / Math.max(stats.vehicleCount * stats.totalDays, 1) : 0
                  } else if (metric.key === 'avgKmPerTrip') {
                    value = stats ? stats.totalKilometres / Math.max(stats.numberOfTrips, 1) : 0
                  } else if (metric.key === 'avgIgnitionTime') {
                    value = stats ? stats.totalIgnitionTime / Math.max(stats.vehicleCount, 1) : 0
                  } else if (metric.key === 'avgDriveTime') {
                    value = stats ? stats.totalDriveTime / Math.max(stats.vehicleCount, 1) : 0
                  } else if (metric.key === 'avgIdleTime') {
                    value = stats ? stats.totalIdleTime / Math.max(stats.vehicleCount, 1) : 0
                  } else if (metric.key === 'avgSpeedingTime') {
                    value = stats ? stats.totalSpeedingDuration / Math.max(stats.vehicleCount, 1) : 0
                  } else {
                    value = stats ? stats[metric.key] || 0 : 0
                  }
                  
                  return (
                    <td 
                      key={month} 
                      className="p-1 border border-gray-300 text-gray-700 text-sm text-center"
                    >
                      {metric.format(value)}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
