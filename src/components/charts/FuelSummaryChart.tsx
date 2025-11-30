"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts'

interface FuelSummary {
  total_readings: number
  average_fuel_percentage: number
}

interface FuelLevel {
  plate: string
  fuel_percentage: number
  timestamp: string
}

export default function FuelSummaryChart() {
  const [summary, setSummary] = useState<FuelSummary | null>(null)
  const [levels, setLevels] = useState<FuelLevel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboardRes, levelsRes] = await Promise.all([
          fetch('/api/eps-rewards/executive-dashboard'),
          fetch('/api/eps-vehicles/fuel-levels')
        ])
        
        const dashboard = await dashboardRes.json()
        const fuelLevels = await levelsRes.json()
        
        setSummary(dashboard.fuel_summary)
        setLevels(fuelLevels.slice(0, 10)) // Show top 10 vehicles
      } catch (error) {
        console.error('Failed to fetch fuel data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <Card className="h-64"><CardContent className="flex items-center justify-center h-full">Loading...</CardContent></Card>
  if (!summary) return <Card className="h-64"><CardContent className="flex items-center justify-center h-full">No data</CardContent></Card>

  const chartData = levels.map((level, index) => ({
    name: level.plate.slice(-4),
    fuel: level.fuel_percentage
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Fuel Summary</CardTitle>
        <p className="text-xs text-gray-500">
          Avg: {summary.average_fuel_percentage}% | Readings: {summary.total_readings}
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} />
            <Line type="monotone" dataKey="fuel" stroke="#3b82f6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}