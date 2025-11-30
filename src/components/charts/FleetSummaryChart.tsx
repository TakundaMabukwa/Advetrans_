"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts'

interface FleetSummary {
  total_vehicles: number
  active_vehicles: number
  inactive_vehicles: number
}

export default function FleetSummaryChart() {
  const [data, setData] = useState<FleetSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/eps-rewards/executive-dashboard')
        const result = await response.json()
        setData(result.fleet_summary)
      } catch (error) {
        console.error('Failed to fetch fleet summary:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <Card className="h-64"><CardContent className="flex items-center justify-center h-full">Loading...</CardContent></Card>
  if (!data) return <Card className="h-64"><CardContent className="flex items-center justify-center h-full">No data</CardContent></Card>

  const chartData = [
    { name: 'Total', value: data.total_vehicles, color: '#3b82f6' },
    { name: 'Active', value: data.active_vehicles, color: '#10b981' },
    { name: 'Inactive', value: data.inactive_vehicles, color: '#ef4444' }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Fleet Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Bar dataKey="value">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}