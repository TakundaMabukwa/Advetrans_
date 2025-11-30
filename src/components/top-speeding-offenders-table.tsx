'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { DailyStats } from '@/lib/eps-api'

interface TopSpeedingOffendersTableProps {
  dailyStats: DailyStats[]
}

export function TopSpeedingOffendersTable({ dailyStats }: TopSpeedingOffendersTableProps) {
  // Process speeding offenders data
  const processSpeedingOffenders = () => {
    // Group by driver and calculate speeding metrics
    const driverStats = dailyStats.reduce((acc, stat) => {
      const driverName = stat.driver_name
      if (!acc[driverName]) {
        acc[driverName] = {
          driverName,
          totalMonthlyDuration: 0,
          events: 0,
          totalSpeedingDuration: 0,
          maxSpeed: 0,
          avgSpeedOver85: 0,
          speedViolations: []
        }
      }
      
      // Aggregate data
      acc[driverName].totalMonthlyDuration += stat.total_driving_hours || 0
      acc[driverName].events += stat.speed_violations || 0
      acc[driverName].totalSpeedingDuration += (stat.speed_violations || 0) * 0.5 // Estimate speeding duration
      acc[driverName].maxSpeed = Math.max(acc[driverName].maxSpeed, 85 + (stat.speed_violations || 0) * 2) // Estimate max speed
      acc[driverName].speedViolations.push(stat.speed_violations || 0)
      
      return acc
    }, {} as Record<string, any>)

    // Calculate average speed over 85 km/h for each driver
    Object.values(driverStats).forEach((driver: any) => {
      const avgViolations = driver.speedViolations.reduce((sum: number, v: number) => sum + v, 0) / driver.speedViolations.length
      driver.avgSpeedOver85 = Math.round(85 + avgViolations * 2) // Estimate average speed
    })

    // Get top 10 worst offenders (most speed violations)
    const topOffenders = Object.values(driverStats)
      .filter((driver: any) => driver.events > 0)
      .sort((a: any, b: any) => b.events - a.events)
      .slice(0, 10)

    console.log('📊 Top Speeding Offenders Data:', topOffenders)
    
    return topOffenders
  }

  const offenders = processSpeedingOffenders()

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

  return (
    <Card className="bg-white shadow-lg p-6">
      <div className="bg-purple-800 -m-6 mb-6 p-4 rounded-t-lg text-white">
        <h3 className="font-bold text-xl text-center">Top Worst Speeding Offenders - January 2025</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="bg-white shadow-sm w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="bg-gray-100 p-1 border border-gray-300 font-semibold text-gray-800 text-sm text-left">Vehicle</th>
              <th className="bg-gray-100 p-1 border border-gray-300 font-semibold text-gray-800 text-sm text-center">Total Monthly Duration Travelled</th>
              <th className="bg-gray-100 p-1 border border-gray-300 font-semibold text-gray-800 text-sm text-center">Events</th>
              <th className="bg-gray-100 p-1 border border-gray-300 font-semibold text-gray-800 text-sm text-center">Average Speed {'>'} 85 km/h</th>
              <th className="bg-gray-100 p-1 border border-gray-300 font-semibold text-gray-800 text-sm text-center">Max Speed</th>
              <th className="bg-gray-100 p-1 border border-gray-300 font-semibold text-gray-800 text-sm text-center">Total Duration</th>
            </tr>
          </thead>
          <tbody>
            {offenders.map((offender: any, index) => (
              <tr key={offender.driverName} className={index % 2 === 0 ? 'bg-white' : 'bg-purple-50'}>
                <td className="p-1 border border-gray-300 font-medium text-gray-800 text-sm">{offender.driverName}</td>
                <td className="p-1 border border-gray-300 text-gray-700 text-sm text-center">{formatTime(offender.totalMonthlyDuration)}</td>
                <td className="p-1 border border-gray-300 text-gray-700 text-sm text-center">{formatNumber(offender.events)}</td>
                <td className="p-1 border border-gray-300 text-gray-700 text-sm text-center">{formatNumber(offender.avgSpeedOver85)}</td>
                <td className="p-1 border border-gray-300 text-gray-700 text-sm text-center">{formatNumber(offender.maxSpeed)}</td>
                <td className="p-1 border border-gray-300 text-gray-700 text-sm text-center">{formatTime(offender.totalSpeedingDuration)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
