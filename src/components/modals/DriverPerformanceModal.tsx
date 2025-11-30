'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, TrendingUp, AlertTriangle, Star, Clock } from 'lucide-react'

interface DriverPerformanceModalProps {
  isOpen: boolean
  onClose: () => void
  driverName: string
}

interface PerformanceData {
  driverName: string
  plate: string
  totalPoints: number
  rewardLevel: string
  speedCompliance: number
  routeCompliance: number
  safetyScore: number
  efficiency: number
  violations: number
  lastUpdate: string
}

export default function DriverPerformanceModal({ isOpen, onClose, driverName }: DriverPerformanceModalProps) {
  const [performance, setPerformance] = useState<PerformanceData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && driverName) {
      fetchPerformanceData()
    }
  }, [isOpen, driverName])

  const fetchPerformanceData = async () => {
    try {
      setLoading(true)
      const endDate = new Date().toISOString().split('T')[0]
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      
      const response = await fetch(`/api/eps-rewards?endpoint=driver-performance&driverName=${encodeURIComponent(driverName)}&startDate=${startDate}&endDate=${endDate}`)
      
      if (response.ok) {
        const data = await response.json()
        // Check if we got actual performance data or just an error
        if (data.error || !data.driverName) {
          // No performance data available, show mock data
          setPerformance({
            driverName: driverName,
            plate: 'N/A',
            totalPoints: 0,
            rewardLevel: 'Bronze',
            speedCompliance: 0,
            routeCompliance: 0,
            safetyScore: 0,
            efficiency: 0,
            violations: 0,
            lastUpdate: new Date().toISOString()
          })
        } else {
          setPerformance({
            driverName: data.driverName || driverName,
            plate: data.plate || 'N/A',
            totalPoints: data.totalPoints || 0,
            rewardLevel: data.rewardLevel || 'Bronze',
            speedCompliance: data.speedCompliance || 0,
            routeCompliance: data.routeCompliance || 0,
            safetyScore: data.safetyScore || 0,
            efficiency: data.efficiency || 0,
            violations: data.violations || 0,
            lastUpdate: data.lastUpdate || new Date().toISOString()
          })
        }
      } else {
        // API error, show no data message
        setPerformance(null)
      }
    } catch (error) {
      console.error('Error fetching performance data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRewardLevelColor = (level: string) => {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Driver Performance - {driverName}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="p-6 text-center">Loading performance data...</div>
        ) : performance ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{performance.driverName}</h3>
                <p className="text-muted-foreground">Vehicle: {performance.plate}</p>
              </div>
              <Badge className={getRewardLevelColor(performance.rewardLevel)}>
                {performance.rewardLevel}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    Total Points
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{performance.totalPoints}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    Violations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{performance.violations}</div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Speed Compliance</span>
                  <span className={getPerformanceColor(performance.speedCompliance)}>{performance.speedCompliance}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${performance.speedCompliance}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Route Compliance</span>
                  <span className={getPerformanceColor(performance.routeCompliance)}>{performance.routeCompliance}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-green-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${performance.routeCompliance}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Safety Score</span>
                  <span className={getPerformanceColor(performance.safetyScore)}>{performance.safetyScore}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-purple-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${performance.safetyScore}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Efficiency</span>
                  <span className={getPerformanceColor(performance.efficiency)}>{performance.efficiency}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-indigo-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${performance.efficiency}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="text-xs text-muted-foreground flex items-center gap-2 pt-4 border-t">
              <Clock className="h-3 w-3" />
              Last updated: {new Date(performance.lastUpdate).toLocaleString()}
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-muted-foreground">
            <div className="mb-4">
              <AlertTriangle className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No Performance Data</h3>
              <p>Performance data is not available for this driver at the moment.</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}