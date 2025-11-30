'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BarChart } from '@mui/x-charts/BarChart'
import { LineChart } from '@mui/x-charts/LineChart'
import { PieChart } from '@mui/x-charts/PieChart'
import FleetRiskGauge from '@/components/charts/FleetFuelGauge'
import { RefreshCw, TrendingUp, AlertTriangle, Users, Award } from 'lucide-react'

interface DashboardData {
  executive: any
  dailyStats: any[]
  riskAssessment: any[]
  performance: any[]
  worstDrivers: any[]
  violations: any[]
  leaderboard: any[]
  monthlyIncidents: any
  allDriverProfiles: any[]
  latest: any
}

export default function ExecutiveDashboardEPS() {
  const [data, setData] = useState<DashboardData>({
    executive: {},
    dailyStats: [],
    riskAssessment: [],
    performance: [],
    worstDrivers: [],
    violations: [],
    leaderboard: [],
    monthlyIncidents: {},
    allDriverProfiles: [],
    latest: {}
  })
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      
      const endpoints = [
        { name: 'executive', url: '/api/eps-rewards?endpoint=executive-dashboard' },
        { name: 'dailyStats', url: '/api/eps-rewards?endpoint=daily-stats' },
        { name: 'riskAssessment', url: '/api/eps-rewards?endpoint=driver-risk-assessment' },
        { name: 'performance', url: '/api/eps-rewards?endpoint=performance' },
        { name: 'worstDrivers', url: '/api/eps-rewards?endpoint=top-worst-drivers' },
        { name: 'violations', url: '/api/eps-rewards?endpoint=violations' },
        { name: 'leaderboard', url: '/api/eps-rewards?endpoint=leaderboard' },
        { name: 'monthlyIncidents', url: '/api/eps-rewards?endpoint=monthly-incident-criteria' },
        { name: 'allDriverProfiles', url: '/api/eps-rewards?endpoint=all-driver-profiles' },
        { name: 'latest', url: '/api/eps-rewards?endpoint=latest' }
      ]
      
      const responses = await Promise.all(
        endpoints.map(async ({ name, url }) => {
          try {
            const res = await fetch(url)
            
            if (!res.ok) {
              console.warn(`API ${name} returned ${res.status}`)
              return { error: `API returned ${res.status}` }
            }
            
            const data = await res.json()
            return data
          } catch (error) {
            console.warn(`Error fetching ${name}:`, error.message)
            return { error: `Failed to fetch ${name}` }
          }
        })
      )
      
      const [executive, dailyStats, riskAssessment, performance, worstDrivers, violations, leaderboard, monthlyIncidents, allDriverProfiles, latest] = responses
      
      setData({
        executive: executive?.error ? {} : (executive || {}),
        dailyStats: dailyStats?.error ? [] : (Array.isArray(dailyStats) ? dailyStats : []),
        riskAssessment: riskAssessment?.error ? [] : (riskAssessment?.drivers || []),
        performance: performance?.error ? [] : (Array.isArray(performance) ? performance : []),
        worstDrivers: worstDrivers?.error ? [] : (worstDrivers?.worst_drivers || []),
        violations: violations?.error ? [] : (Array.isArray(violations) ? violations : []),
        leaderboard: allDriverProfiles?.error ? [] : (allDriverProfiles?.drivers || []),
        monthlyIncidents: monthlyIncidents?.error ? {} : (monthlyIncidents || {}),
        allDriverProfiles: allDriverProfiles?.error ? [] : (allDriverProfiles?.drivers || []),
        latest: latest?.error ? {} : (latest || {})
      })
      
      setLastUpdated(new Date())
    } catch (error) {
      console.warn('Error fetching dashboard data:', error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg font-medium">Loading Executive Dashboard...</p>
          <p className="text-sm text-gray-600">Fetching real-time fleet analytics</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-sky-100 via-blue-50 to-cyan-50 shadow-lg p-6 border border-blue-200 rounded-lg text-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold text-2xl">EPS Courier Services - Executive Dashboard</h1>
            <p className="text-sm text-slate-600 mt-1">Real-time fleet performance and analytics</p>
          </div>
          <div className="flex items-center space-x-4">
            {lastUpdated && (
              <p className="text-xs text-slate-600">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
            <Button onClick={fetchAllData} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Executive KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Drivers</p>
                <p className="text-2xl font-bold text-blue-600">{data.allDriverProfiles.length || 0}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Risk Drivers</p>
                <p className="text-2xl font-bold text-red-600">{data.riskAssessment.filter(d => d.risk_category === 'High Risk').length || 0}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Vehicles</p>
                <p className="text-2xl font-bold text-orange-600">{data.executive.fleet_summary?.active_vehicles || 0}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Points</p>
                <p className="text-2xl font-bold text-purple-600">{data.leaderboard.reduce((sum, l) => sum + (l.totalPoints || 0), 0)}</p>
              </div>
              <Award className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Night Violations</p>
                <p className="text-2xl font-bold text-yellow-600">{data.monthlyIncidents.penalty_events?.night_driving || 0}</p>
              </div>
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 text-sm font-semibold">!</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Charts */}
      <div className="space-y-8">
        {/* Driver Rewards Leaderboard */}
        <Card className="min-h-[400px]">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800">Driver Rewards Leaderboard</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <BarChart
              xAxis={[{
                scaleType: 'band',
                data: data.leaderboard
                  .sort((a, b) => (Number(b.currentPoints) || 0) - (Number(a.currentPoints) || 0))
                  .slice(0, 10)
                  .map(d => d.driverName || 'Unknown')
              }]}
              series={[
                {
                  data: data.leaderboard
                    .sort((a, b) => (Number(b.currentPoints) || 0) - (Number(a.currentPoints) || 0))
                    .slice(0, 10)
                    .map(d => Number(d.currentPoints) || 0),
                  label: 'Current Points',
                  color: '#8b5cf6'
                },
                {
                  data: data.leaderboard
                    .sort((a, b) => (Number(b.currentPoints) || 0) - (Number(a.currentPoints) || 0))
                    .slice(0, 10)
                    .map(d => Number(d.totalEarned) || 0),
                  label: 'Total Earned',
                  color: '#22c55e'
                }
              ]}
              width={800}
              height={300}
            />
          </CardContent>
        </Card>

        {/* Driver Performance Scores */}
        <Card className="min-h-[500px]">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold text-gray-800">Top Driver Performance Scores</CardTitle>
          </CardHeader>
          <CardContent className="h-96">
            <BarChart
              xAxis={[{
                scaleType: 'band',
                data: data.leaderboard.slice(0, 8).map(d => d.driverName || 'Unknown')
              }]}
              series={[{
                data: data.leaderboard.slice(0, 8).map(d => Number(d.performanceScore) || 0),
                color: '#B8860B'
              }]}
              width={800}
              height={350}
            />
          </CardContent>
        </Card>

        {/* Risk Assessment and Violations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <FleetRiskGauge />

          <Card className="min-h-[400px]">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-800">Driver Violations & Speeding Incidents</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <BarChart
                xAxis={[{
                  scaleType: 'band',
                  data: data.leaderboard.slice(0, 6).map(d => d.driverName || 'Unknown')
                }]}
                series={[{
                  data: data.leaderboard.slice(0, 6).map(d => (Number(d.violations) || 0) + (Number(d.speedingIncidents) || 0)),
                  color: '#ef4444'
                }]}
                width={400}
                height={300}
              />
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Risk Assessment Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-800">Driver Risk Assessment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Driver</th>
                  <th className="text-left p-2">Risk Category</th>
                  <th className="text-left p-2">Score</th>
                  <th className="text-left p-2">Violations</th>
                  <th className="text-left p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.riskAssessment.slice(0, 10).map((driver, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{driver.driver_name || 'Unknown'}</td>
                    <td className="p-2">
                      <Badge 
                        variant={driver.risk_category === 'High Risk' ? 'destructive' : 
                                driver.risk_category === 'Medium Risk' ? 'secondary' : 'default'}
                      >
                        {driver.risk_category}
                      </Badge>
                    </td>
                    <td className="p-2">{driver.risk_score || 0}</td>
                    <td className="p-2">{driver.total_violations || 0}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        driver.risk_category === 'High Risk' ? 'bg-red-100 text-red-800' :
                        driver.risk_category === 'Medium Risk' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {driver.risk_category === 'High Risk' ? 'Requires Action' :
                         driver.risk_category === 'Medium Risk' ? 'Monitor' : 'Good Standing'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Statistics Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-800">Monthly Fleet Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-3 text-left font-semibold">Metric</th>
                  <th className="border border-gray-300 p-3 text-center font-semibold">Nov 2024</th>
                  <th className="border border-gray-300 p-3 text-center font-semibold">Dec 2024</th>
                  <th className="border border-gray-300 p-3 text-center font-semibold">Jan 2025</th>
                  <th className="border border-gray-300 p-3 text-center font-semibold">Feb 2025</th>
                  <th className="border border-gray-300 p-3 text-center font-semibold">Mar 2025</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-3 font-medium">Speed Violations</td>
                  <td className="border border-gray-300 p-3 text-center">{data.executive.violations_summary?.speed_violations || 0}</td>
                  <td className="border border-gray-300 p-3 text-center">-</td>
                  <td className="border border-gray-300 p-3 text-center">-</td>
                  <td className="border border-gray-300 p-3 text-center">-</td>
                  <td className="border border-gray-300 p-3 text-center">-</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-3 font-medium">Route Violations</td>
                  <td className="border border-gray-300 p-3 text-center">{data.executive.violations_summary?.route_violations || 0}</td>
                  <td className="border border-gray-300 p-3 text-center">-</td>
                  <td className="border border-gray-300 p-3 text-center">-</td>
                  <td className="border border-gray-300 p-3 text-center">-</td>
                  <td className="border border-gray-300 p-3 text-center">-</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-3 font-medium">Night Violations</td>
                  <td className="border border-gray-300 p-3 text-center">{data.monthlyIncidents.penalty_events?.night_driving || 0}</td>
                  <td className="border border-gray-300 p-3 text-center">-</td>
                  <td className="border border-gray-300 p-3 text-center">-</td>
                  <td className="border border-gray-300 p-3 text-center">-</td>
                  <td className="border border-gray-300 p-3 text-center">-</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-3 font-medium">Active Vehicles</td>
                  <td className="border border-gray-300 p-3 text-center">{data.executive.fleet_summary?.active_vehicles || 0}</td>
                  <td className="border border-gray-300 p-3 text-center">-</td>
                  <td className="border border-gray-300 p-3 text-center">-</td>
                  <td className="border border-gray-300 p-3 text-center">-</td>
                  <td className="border border-gray-300 p-3 text-center">-</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-3 font-medium">Inactive Vehicles</td>
                  <td className="border border-gray-300 p-3 text-center">{data.executive.fleet_summary?.inactive_vehicles || 0}</td>
                  <td className="border border-gray-300 p-3 text-center">-</td>
                  <td className="border border-gray-300 p-3 text-center">-</td>
                  <td className="border border-gray-300 p-3 text-center">-</td>
                  <td className="border border-gray-300 p-3 text-center">-</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-3 font-medium">Low Fuel Vehicles</td>
                  <td className="border border-gray-300 p-3 text-center">{data.executive.fuel_summary?.low_fuel_vehicles || 0}</td>
                  <td className="border border-gray-300 p-3 text-center">-</td>
                  <td className="border border-gray-300 p-3 text-center">-</td>
                  <td className="border border-gray-300 p-3 text-center">-</td>
                  <td className="border border-gray-300 p-3 text-center">-</td>
                </tr>
                <tr className="bg-green-50">
                  <td className="border border-gray-300 p-3 font-bold">Total Kilometres</td>
                  <td className="border border-gray-300 p-3 text-center font-semibold">{data.leaderboard.reduce((sum, d) => sum + (d.totalKilometers || 0), 0).toLocaleString()}</td>
                  <td className="border border-gray-300 p-3 text-center">-</td>
                  <td className="border border-gray-300 p-3 text-center">-</td>
                  <td className="border border-gray-300 p-3 text-center">-</td>
                  <td className="border border-gray-300 p-3 text-center">-</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-3 font-medium">Fleet Size</td>
                  <td className="border border-gray-300 p-3 text-center">{data.executive.fleet_summary?.total_vehicles || data.allDriverProfiles.length || 0}</td>
                  <td className="border border-gray-300 p-3 text-center">-</td>
                  <td className="border border-gray-300 p-3 text-center">-</td>
                  <td className="border border-gray-300 p-3 text-center">-</td>
                  <td className="border border-gray-300 p-3 text-center">-</td>
                </tr>
                <tr className="bg-red-50">
                  <td className="border border-gray-300 p-3 font-medium">Total Violations</td>
                  <td className="border border-gray-300 p-3 text-center font-bold text-red-600">{data.executive.violations_summary?.total_violations || data.monthlyIncidents.penalty_events?.total_penalties || 0}</td>
                  <td className="border border-gray-300 p-3 text-center">-</td>
                  <td className="border border-gray-300 p-3 text-center">-</td>
                  <td className="border border-gray-300 p-3 text-center">-</td>
                  <td className="border border-gray-300 p-3 text-center">-</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}