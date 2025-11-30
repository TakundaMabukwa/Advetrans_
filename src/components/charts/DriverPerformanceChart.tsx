"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts'

interface DriverPerformance {
  total_drivers: number
  average_points: number
  performance_levels: {
    gold: number
    silver: number
    bronze: number
    critical: number
  }
}

export default function DriverPerformanceChart() {
  const [data, setData] = useState<DriverPerformance | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/eps-rewards/executive-dashboard')
        const result = await response.json()
        setData(result.driver_performance)
      } catch (error) {
        console.error('Failed to fetch driver performance:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <Card className="h-64"><CardContent className="flex items-center justify-center h-full">Loading...</CardContent></Card>
  if (!data) return <Card className="h-64"><CardContent className="flex items-center justify-center h-full">No data</CardContent></Card>

  const chartData = [
    { name: 'Gold', value: data.performance_levels.gold, color: '#fbbf24' },
    { name: 'Silver', value: data.performance_levels.silver, color: '#9ca3af' },
    { name: 'Bronze', value: data.performance_levels.bronze, color: '#cd7c2f' },
    { name: 'Critical', value: data.performance_levels.critical, color: '#ef4444' }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Driver Performance Levels</CardTitle>
        <p className="text-xs text-gray-500">Avg Points: {data.average_points}</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={60}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}