"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts'

interface Driver {
  driverName: string
  speedingIncidents: number
}

export default function SpeedingViolationsChart() {
  const [data, setData] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/eps-rewards?endpoint=leaderboard')
        const result = await response.json()
        
        // Ensure result is an array and handle data safely
        const drivers = Array.isArray(result) ? result : []
        const worstDrivers = drivers
          .filter((d: Driver) => (d.speedingIncidents || 0) > 0)
          .sort((a: Driver, b: Driver) => (b.speedingIncidents || 0) - (a.speedingIncidents || 0))
          .slice(0, 10)
        
        setData(worstDrivers)
      } catch (error) {
        console.error('Failed to fetch speeding violations:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <Card className="h-64"><CardContent className="flex items-center justify-center h-full">Loading...</CardContent></Card>
  
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Top 10 Speeding Violations</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48">
          <p className="text-green-600 font-medium">No speeding violations recorded</p>
        </CardContent>
      </Card>
    )
  }

  const colors = ['#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d', '#f97316', '#ea580c', '#c2410c', '#9a3412', '#7c2d12']
  
  const chartData = data.map((driver, index) => ({
    name: (driver.driverName || 'Unknown').split(' ').slice(0, 2).join(' '),
    value: driver.speedingIncidents || 0,
    color: colors[index] || '#gray'
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Top 10 Speeding Violations</CardTitle>
        <p className="text-xs text-gray-500">Total incidents: {data.reduce((sum, d) => sum + (d.speedingIncidents || 0), 0)}</p>
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