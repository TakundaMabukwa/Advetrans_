'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, MapPin, Route, Clock, Truck } from 'lucide-react'
import DriverLocationMap from '@/components/map/driver-location-map'
import { createClient } from '@/lib/supabase/client'
import { findActiveTripsForDriver, getRouteForTrip } from '@/lib/driver-trip-matcher'

interface Trip {
  id: string
  origin: string
  destination: string
  status: string
  startDate: string
  waypoints?: Array<{
    lat: number
    lng: number
    address: string
    type: 'pickup' | 'dropoff' | 'waypoint'
  }>
}

interface Driver {
  id: string
  firstName?: string
  surname?: string
  driver_name?: string
  plate?: string
  currentLocation?: {
    lat: number
    lng: number
  }
}

interface DriverMapModalProps {
  isOpen: boolean
  onClose: () => void
  driver: Driver
}

export default function DriverMapModal({ isOpen, onClose, driver }: DriverMapModalProps) {
  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const driverName = driver.driver_name || `${driver.firstName || ''} ${driver.surname || ''}`.trim() || 'Unknown Driver'

  // Geocoding function to convert addresses to coordinates
  const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&country=ZA&limit=1`
      )
      const data = await response.json()
      
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center
        return { lat, lng }
      }
    } catch (error) {
      console.error('Geocoding error:', error)
    }
    return null
  }

  // Fetch trip data for the driver
  useEffect(() => {
    if (!isOpen || !driver.plate) return

    const fetchDriverTrip = async () => {
      setLoading(true)
      setError(null)

      try {
        // Find active trips for this driver
        const matchedTrips = await findActiveTripsForDriver(driver.plate!)
        
        if (matchedTrips.length === 0) {
          setError('No active trip found for this driver')
          return
        }

        // Use the first matched trip
        const activeTrip = matchedTrips[0]
        let routeWaypoints: Array<{lat: number, lng: number, address: string, type: string}> = []

        // Get route data if order number exists
        if (activeTrip.ordernumber) {
          const routeData = await getRouteForTrip(activeTrip.ordernumber)
          
          if (routeData?.coordinates) {
            routeWaypoints = routeData.coordinates.map((coord: number[], index: number) => ({
              lat: coord[1],
              lng: coord[0],
              address: index === 0 ? activeTrip.origin : 
                      index === routeData.coordinates.length - 1 ? activeTrip.destination : 
                      `Waypoint ${index}`,
              type: index === 0 ? 'pickup' : 
                   index === routeData.coordinates.length - 1 ? 'dropoff' : 'waypoint'
            }))
          }
        }

        // Fallback: geocode origin and destination if no route data
        if (routeWaypoints.length === 0) {
          const originCoords = await geocodeAddress(activeTrip.origin)
          const destCoords = await geocodeAddress(activeTrip.destination)
          
          if (originCoords) {
            routeWaypoints.push({ ...originCoords, address: activeTrip.origin, type: 'pickup' })
          }
          if (destCoords) {
            routeWaypoints.push({ ...destCoords, address: activeTrip.destination, type: 'dropoff' })
          }
        }

        setTrip({
          id: activeTrip.tripId,
          origin: activeTrip.origin,
          destination: activeTrip.destination,
          status: activeTrip.status,
          startDate: activeTrip.startdate,
          waypoints: routeWaypoints
        })
      } catch (err) {
        console.error('Error fetching driver trip:', err)
        setError('Failed to load trip data')
      } finally {
        setLoading(false)
      }
    }

    fetchDriverTrip()
  }, [isOpen, driver.plate])

  // Generate mock driver location (in a real app, this would come from GPS/tracking system)
  const generateDriverLocation = () => {
    // Default to Johannesburg area with some random offset
    const baseLocation = { lat: -26.2041, lng: 28.0473 }
    return {
      lat: baseLocation.lat + (Math.random() - 0.5) * 0.1,
      lng: baseLocation.lng + (Math.random() - 0.5) * 0.1
    }
  }

  const driverLocation = driver.currentLocation || generateDriverLocation()

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'pending': { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      'in-progress': { color: 'bg-blue-100 text-blue-800', label: 'In Progress' },
      'loading': { color: 'bg-orange-100 text-orange-800', label: 'Loading' },
      'on-trip': { color: 'bg-green-100 text-green-800', label: 'On Trip' },
      'completed': { color: 'bg-gray-100 text-gray-800', label: 'Completed' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold">
                  {driverName} - Location & Route
                </DialogTitle>
                <p className="text-sm text-gray-600">
                  Vehicle: {driver.plate || 'Unknown'}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Trip Information */}
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-sm text-gray-600">Loading trip data...</span>
            </div>
          ) : error ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">{error}</span>
              </div>
            </div>
          ) : trip ? (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Current Trip: {trip.id}</h3>
                {getStatusBadge(trip.status)}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Route className="w-4 h-4 text-green-600" />
                  <div>
                    <span className="text-gray-600">Origin:</span>
                    <p className="font-medium">{trip.origin}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-600" />
                  <div>
                    <span className="text-gray-600">Destination:</span>
                    <p className="font-medium">{trip.destination}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <div>
                    <span className="text-gray-600">Start Date:</span>
                    <p className="font-medium">
                      {trip.startDate ? new Date(trip.startDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-800">
                  Showing driver location only (no active trip found)
                </span>
              </div>
            </div>
          )}

          {/* Map */}
          <div className="border rounded-lg overflow-hidden">
            <DriverLocationMap
              driverLocation={driverLocation}
              tripRoute={trip ? {
                origin: trip.origin,
                destination: trip.destination,
                waypoints: trip.waypoints
              } : undefined}
              driverName={driverName}
              className="w-full h-[500px]"
            />
          </div>

          {/* Route Points */}
          {trip && trip.waypoints && trip.waypoints.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">Route Points</h4>
              <div className="space-y-2 text-sm">
                {trip.waypoints.map((point, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      point.type === 'pickup' ? 'bg-green-500' :
                      point.type === 'dropoff' ? 'bg-red-500' : 'bg-orange-500'
                    }`}></div>
                    <span className="text-gray-700">{point.address}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}