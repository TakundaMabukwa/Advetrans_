"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts'

interface ViolationsSummary {
  speed_violations: number
  route_violations: number
  night_violations: number
  total_violations: number
}

export default function ViolationsChart() {
  const [data, setData] = useState<ViolationsSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/eps-rewards/executive-dashboard')
        const result = await response.json()
        setData(result.violations_summary)
      } catch (error) {
        console.error('Failed to fetch violations:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <Card className="h-64"><CardContent className="flex items-center justify-center h-full">Loading...</CardContent></Card>
  if (!data) return <Card className="h-64"><CardContent className="flex items-center justify-center h-full">No data</CardContent></Card>

  const chartData = [
    { name: 'Speed', value: data.speed_violations, color: '#ef4444' },
    { name: 'Route', value: data.route_violations, color: '#f97316' },
    { name: 'Night', value: data.night_violations, color: '#8b5cf6' }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Violations Summary</CardTitle>
        <p className="text-xs text-gray-500">Total: {data.total_violations}</p>
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