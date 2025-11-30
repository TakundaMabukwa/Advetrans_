'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, X, MapPin, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface UnauthorizedStopAlertProps {
  trip: any
  onDismiss?: () => void
  onViewMap?: () => void
  className?: string
}

export function UnauthorizedStopAlert({ 
  trip, 
  onDismiss, 
  onViewMap,
  className 
}: UnauthorizedStopAlertProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isAnimating, setIsAnimating] = useState(true)

  useEffect(() => {
    // Stop animation after 6 seconds
    const timer = setTimeout(() => setIsAnimating(false), 6000)
    return () => clearTimeout(timer)
  }, [])

  if (!isVisible || !trip.unauthorized_stops_count || trip.unauthorized_stops_count === 0) {
    return null
  }

  const handleDismiss = () => {
    setIsVisible(false)
    onDismiss?.()
  }

  const clientDetails = typeof trip.clientdetails === 'string' 
    ? JSON.parse(trip.clientdetails) 
    : trip.clientdetails
  const tripTitle = clientDetails?.name || trip.selectedClient || `Trip ${trip.trip_id || trip.id}`

  return (
    <div className={cn(
      "w-96 bg-white border-l-4 border-red-500 rounded-lg shadow-xl",
      "transform transition-all duration-300 ease-out",
      isAnimating && "animate-pulse",
      className
    )}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-red-900 text-sm">
                Unauthorized Stop Alert
              </h3>
              <p className="text-xs text-red-700">
                Immediate attention required
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>

        {/* Trip Info */}
        <div className="bg-red-50 rounded-lg p-3 mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-red-900 text-sm truncate">
              {tripTitle}
            </span>
            <Badge variant="destructive" className="text-xs">
              Trip #{trip.trip_id || trip.id}
            </Badge>
          </div>
          
          <div className="space-y-1 text-xs text-red-800">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>{trip.origin} → {trip.destination}</span>
            </div>
            <div className="flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              <span className="font-medium">
                {trip.unauthorized_stops_count} unauthorized stop{trip.unauthorized_stops_count > 1 ? 's' : ''} detected
              </span>
            </div>
            {trip.last_location_update && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Last update: {new Date(trip.last_location_update).toLocaleTimeString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={onViewMap}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs h-8"
          >
            <MapPin className="w-3 h-3 mr-1" />
            View Location
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleDismiss}
            className="text-xs h-8 border-red-200 text-red-700 hover:bg-red-50"
          >
            Dismiss
          </Button>
        </div>
      </div>

      {/* Animated border */}
      <div className={cn(
        "absolute inset-0 rounded-lg pointer-events-none",
        isAnimating && "animate-pulse ring-2 ring-red-400 ring-opacity-75"
      )} />
    </div>
  )
}