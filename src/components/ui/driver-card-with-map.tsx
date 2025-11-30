'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Eye, 
  Edit, 
  Trash2, 
  MapPin, 
  Star, 
  AlertTriangle, 
  BarChart3,
  Clock,
  Route
} from 'lucide-react'
import DriverMapModal from '@/components/modals/driver-map-modal'

interface Driver {
  id: string
  firstName?: string
  surname?: string
  driver_name?: string
  plate?: string
  demeritPoints?: number
  licenseCode?: string
  licenseExpires?: string
  pdpExpiryDate?: string
  safety_score?: number
  efficiency?: number
  total_points?: number
  reward_level?: string
  speed_compliance?: boolean
  route_compliance?: boolean
  time_compliance?: boolean
  latest_mileage?: string
  biWeeklyCategoryPoints?: any
  currentLocation?: {
    lat: number
    lng: number
  }
}

interface DriverCardWithMapProps {
  driver: Driver
  onView?: (driver: Driver) => void
  onEdit?: (driver: Driver) => void
  onDelete?: (driver: Driver) => void
  showPerformanceMetrics?: boolean
  className?: string
}

export default function DriverCardWithMap({ 
  driver, 
  onView, 
  onEdit, 
  onDelete,
  showPerformanceMetrics = false,
  className = ""
}: DriverCardWithMapProps) {
  const [isMapModalOpen, setIsMapModalOpen] = useState(false)

  const driverName = driver.driver_name || `${driver.firstName || ''} ${driver.surname || ''}`.trim() || 'Unknown Driver'
  
  // Calculate performance score if metrics are available
  const performanceScore = showPerformanceMetrics && driver.safety_score && driver.efficiency 
    ? Math.round(((driver.safety_score + driver.efficiency) / 2) * 100)
    : null

  const isPerformingWell = performanceScore ? performanceScore >= 60 : true

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getRewardLevelColor = (level: string) => {
    switch (level) {
      case 'Platinum': return 'bg-purple-100 text-purple-800'
      case 'Gold': return 'bg-yellow-100 text-yellow-800'
      case 'Silver': return 'bg-gray-100 text-gray-800'
      case 'Bronze': return 'bg-orange-100 text-orange-800'
      default: return 'bg-blue-100 text-blue-800'
    }
  }

  return (
    <>
      <Card className={`p-4 hover:shadow-md transition-all duration-200 ${
        showPerformanceMetrics 
          ? isPerformingWell
            ? "border-green-200 bg-gradient-to-br from-green-50 to-white"
            : "border-red-200 bg-gradient-to-br from-red-50 to-white"
          : "border-gray-200"
      } ${className}`}>
        
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-sm truncate">
              {driverName}
            </h3>
            {driver.plate && (
              <p className="text-xs text-gray-600">Vehicle: {driver.plate}</p>
            )}
          </div>
          
          {showPerformanceMetrics && performanceScore && (
            <Badge className={`text-xs ${
              isPerformingWell ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}>
              {isPerformingWell ? "Good" : "Needs Improvement"}
            </Badge>
          )}
        </div>

        {/* Performance Metrics (if enabled) */}
        {showPerformanceMetrics && (
          <div className="space-y-2 mb-4">
            {driver.total_points && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Total Points</span>
                <span className={`text-sm font-bold ${getPerformanceColor(driver.total_points)}`}>
                  {driver.total_points}
                </span>
              </div>
            )}
            
            {performanceScore && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Performance Score</span>
                <span className={`text-sm font-bold ${getPerformanceColor(performanceScore)}`}>
                  {performanceScore}%
                </span>
              </div>
            )}

            {driver.reward_level && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Reward Level</span>
                <Badge className={`text-xs ${getRewardLevelColor(driver.reward_level)}`}>
                  {driver.reward_level}
                </Badge>
              </div>
            )}

            {/* Compliance Indicators */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100">
              <div className="text-center">
                <div className={`text-xs ${driver.speed_compliance ? "text-green-600" : "text-red-600"}`}>
                  {driver.speed_compliance ? "✓" : "✗"}
                </div>
                <div className="text-xs text-gray-500">Speed</div>
              </div>
              <div className="text-center">
                <div className={`text-xs ${driver.route_compliance ? "text-green-600" : "text-red-600"}`}>
                  {driver.route_compliance ? "✓" : "✗"}
                </div>
                <div className="text-xs text-gray-500">Route</div>
              </div>
              <div className="text-center">
                <div className={`text-xs ${driver.time_compliance ? "text-green-600" : "text-red-600"}`}>
                  {driver.time_compliance ? "✓" : "✗"}
                </div>
                <div className="text-xs text-gray-500">Time</div>
              </div>
            </div>
          </div>
        )}

        {/* Basic Info (if performance metrics not shown) */}
        {!showPerformanceMetrics && (
          <div className="space-y-2 mb-4">
            {driver.licenseCode && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">License Code</span>
                <span className="text-xs font-medium">{driver.licenseCode}</span>
              </div>
            )}
            
            {driver.licenseExpires && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">License Expires</span>
                <span className="text-xs font-medium">{driver.licenseExpires}</span>
              </div>
            )}

            {driver.demeritPoints !== undefined && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Demerit Points</span>
                <Badge variant={driver.demeritPoints > 0 ? "destructive" : "secondary"} className="text-xs">
                  {driver.demeritPoints}
                </Badge>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-1">
            {onView && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2 text-xs"
                onClick={() => onView(driver)}
                title="View Details"
              >
                <Eye className="w-3 h-3" />
              </Button>
            )}
            
            {onEdit && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2 text-xs"
                onClick={() => onEdit(driver)}
                title="Edit Driver"
              >
                <Edit className="w-3 h-3" />
              </Button>
            )}
            
            {onDelete && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => onDelete(driver)}
                title="Delete Driver"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </div>

          {/* Map Button */}
          <Button
            size="sm"
            className="h-7 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => setIsMapModalOpen(true)}
            title="View Location & Route"
          >
            <MapPin className="w-3 h-3 mr-1" />
            Map
          </Button>
        </div>
      </Card>

      {/* Map Modal */}
      <DriverMapModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        driver={driver}
      />
    </>
  )
}