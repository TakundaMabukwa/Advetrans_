"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface RiskData {
  fleet_risk_score: number
  total_drivers: number
  insurance_multiplier: number
}

export default function FleetRiskGauge() {
  const [data, setData] = useState<RiskData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/eps-rewards?endpoint=driver-risk-assessment')
        const result = await response.json()
        setData(result)
      } catch (error) {
        console.error('Failed to fetch risk data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <Card className="h-80"><CardContent className="flex items-center justify-center h-full">Loading...</CardContent></Card>
  if (!data) return <Card className="h-80"><CardContent className="flex items-center justify-center h-full">No data</CardContent></Card>

  const riskScore = data.fleet_risk_score || 0
  const safetyScore = Math.max(0, 100 - riskScore)
  const rotation = (safetyScore / 100) * 180 - 90

  return (
    <Card className="h-80">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-800">Fleet Risk Score</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center h-64">
        <div className="relative w-48 h-24 mb-4">
          <svg viewBox="0 0 200 100" className="w-full h-full">
            <defs>
              <linearGradient id="riskGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
            </defs>
            <path
              d="M 20 80 A 80 80 0 0 1 180 80"
              fill="none"
              stroke="url(#riskGradient)"
              strokeWidth="12"
              strokeLinecap="round"
            />
            <path
              d="M 20 80 A 80 80 0 0 1 180 80"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="12"
              strokeLinecap="round"
              opacity="0.3"
            />
            <line
              x1="100"
              y1="80"
              x2="100"
              y2="40"
              stroke="#374151"
              strokeWidth="3"
              strokeLinecap="round"
              transform={`rotate(${rotation} 100 80)`}
            />
            <circle cx="100" cy="80" r="6" fill="#374151" />
          </svg>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900">{riskScore}</div>
          <div className="text-sm text-gray-600 mt-1">Risk Score (Lower is Better)</div>
          <div className="text-xs text-gray-500 mt-2">
            {data.total_drivers} drivers • {data.insurance_multiplier}x multiplier
          </div>
        </div>
      </CardContent>
    </Card>
  )
}