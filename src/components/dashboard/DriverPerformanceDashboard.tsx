'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Trophy, TrendingUp, AlertTriangle, Star, Search, Calendar } from 'lucide-react'
import { type DriverPerformanceData } from '@/lib/actions/driver-performance'

export default function DriverPerformanceDashboard() {
  const [drivers, setDrivers] = useState<DriverPerformanceData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRange, setDateRange] = useState('30')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDriverPerformance()
  }, [dateRange])

  const fetchDriverPerformance = async () => {
    try {
      setLoading(true)
      console.log('Using proxy POST method...')
      const HTTP_SERVER_ENDPOINT = process.env.NEXT_PUBLIC_HTTP_SERVER_ENDPOINT || 'http://localhost:3001'
      console.log('Target endpoint:', `${HTTP_SERVER_ENDPOINT}/api/eps-rewards/all-driver-profiles`)
      const response = await fetch('/api/eps-rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: `${HTTP_SERVER_ENDPOINT}/api/eps-rewards/all-driver-profiles` })
      })
      console.log('Proxy response status:', response.status)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      console.log('Data received:', data)
      setDrivers(data.drivers || [])
    } catch (error) {
      console.error('Error fetching driver performance:', error)
      setDrivers([])
    } finally {
      setLoading(false)
    }
  }

  const filteredDrivers = Array.isArray(drivers) ? drivers.filter(driver =>
    driver.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (driver.plate && driver.plate.toLowerCase().includes(searchTerm.toLowerCase()))
  ) : []

  const getPerformanceLevelColor = (level: string) => {
    switch (level) {
      case 'Gold': return 'bg-yellow-100 text-yellow-800'
      case 'Silver': return 'bg-gray-100 text-gray-800'
      case 'Bronze': return 'bg-orange-100 text-orange-800'
      default: return 'bg-slate-100 text-slate-800'
    }
  }

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (loading) return <div className="p-6">Loading driver performance...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Driver Performance Dashboard</h2>
          <p className="text-muted-foreground">Monitor driver performance metrics and reward levels</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search drivers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 days</SelectItem>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {drivers.map((driver, index) => (
          <Card key={`${driver.driverName}-${index}`} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-sm font-semibold leading-tight break-words">{driver.driverName}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">{driver.plate || 'No plate'}</p>
                </div>
                <Badge className={`${getPerformanceLevelColor(driver.performanceLevel)} text-xs px-2 py-1 shrink-0`}>
                  {driver.performanceLevel}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-yellow-50 rounded-lg p-2">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Trophy className="h-3 w-3 text-yellow-600" />
                    <span className="text-xs font-medium">Points</span>
                  </div>
                  <span className="font-bold text-lg text-yellow-700">{driver.currentPoints}</span>
                </div>
                <div className="bg-blue-50 rounded-lg p-2">
                  <div className="text-xs font-medium mb-1 text-blue-700">Rating</div>
                  <span className="font-bold text-lg text-blue-700">{driver.scores.performanceRating}%</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Performance</span>
                  <span className={getPerformanceColor(driver.scores.performanceRating)}>{driver.scores.performanceRating}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${driver.scores.performanceRating}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Risk Score</span>
                  <span className={getPerformanceColor(100 - driver.scores.insuranceRiskScore)}>{driver.scores.insuranceRiskScore}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(0, 100 - driver.scores.insuranceRiskScore)}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-medium">Risk Category</div>
                <Badge variant={driver.scores.riskCategory === 'Low Risk' ? 'default' : 'destructive'} className="text-xs">
                  {driver.scores.riskCategory}
                </Badge>
              </div>

              {driver.violations.total > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3 text-red-500" />
                      <span>Violations</span>
                    </div>
                    <Badge variant="destructive" className="text-xs px-1.5 py-0.5">{driver.violations.total}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Speed: {driver.violations.speed} | Braking: {driver.violations.harshBraking} | Night: {driver.violations.nightDriving}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {drivers.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            No driver performance data available
          </div>
        </div>
      )}
    </div>
  )
}