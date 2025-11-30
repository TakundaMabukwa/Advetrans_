'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

interface DriverLocationMapProps {
  driverLocation?: {
    lat: number
    lng: number
  }
  tripRoute?: {
    origin: string
    destination: string
    waypoints?: Array<{
      lat: number
      lng: number
      address: string
    }>
  }
  driverName: string
  className?: string
}

export default function DriverLocationMap({ 
  driverLocation, 
  tripRoute, 
  driverName,
  className = "w-full h-[400px]" 
}: DriverLocationMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [loading, setLoading] = useState(true)

  // Default location (Johannesburg, South Africa)
  const defaultLocation = { lat: -26.2041, lng: 28.0473 }
  const currentLocation = driverLocation || defaultLocation

  useEffect(() => {
    if (map.current || !mapContainer.current) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [currentLocation.lng, currentLocation.lat],
      zoom: 12,
    })

    map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right')

    map.current.on('load', () => {
      setLoading(false)
      
      if (!map.current) return

      // Add driver location marker
      const driverMarker = new mapboxgl.Marker({
        color: '#3b82f6', // Blue color for driver
        scale: 1.2
      })
        .setLngLat([currentLocation.lng, currentLocation.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div class="p-2">
                <h3 class="font-semibold text-sm">${driverName}</h3>
                <p class="text-xs text-gray-600">Current Location</p>
              </div>
            `)
        )
        .addTo(map.current)

      // If trip route is provided, add route visualization
      if (tripRoute && tripRoute.waypoints && tripRoute.waypoints.length > 0) {
        // Add origin marker
        new mapboxgl.Marker({
          color: '#10b981', // Green for origin
          scale: 0.8
        })
          .setLngLat([tripRoute.waypoints[0].lng, tripRoute.waypoints[0].lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(`
                <div class="p-2">
                  <h3 class="font-semibold text-sm">Origin</h3>
                  <p class="text-xs text-gray-600">${tripRoute.origin}</p>
                </div>
              `)
          )
          .addTo(map.current)

        // Add destination marker
        const lastWaypoint = tripRoute.waypoints[tripRoute.waypoints.length - 1]
        new mapboxgl.Marker({
          color: '#ef4444', // Red for destination
          scale: 0.8
        })
          .setLngLat([lastWaypoint.lng, lastWaypoint.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(`
                <div class="p-2">
                  <h3 class="font-semibold text-sm">Destination</h3>
                  <p class="text-xs text-gray-600">${tripRoute.destination}</p>
                </div>
              `)
          )
          .addTo(map.current)

        // Add intermediate waypoints
        tripRoute.waypoints.slice(1, -1).forEach((waypoint, index) => {
          new mapboxgl.Marker({
            color: '#f59e0b', // Orange for waypoints
            scale: 0.6
          })
            .setLngLat([waypoint.lng, waypoint.lat])
            .setPopup(
              new mapboxgl.Popup({ offset: 25 })
                .setHTML(`
                  <div class="p-2">
                    <h3 class="font-semibold text-sm">Waypoint ${index + 1}</h3>
                    <p class="text-xs text-gray-600">${waypoint.address}</p>
                  </div>
                `)
            )
            .addTo(map.current)
        })

        // Create route line
        const routeCoordinates = tripRoute.waypoints.map(wp => [wp.lng, wp.lat])
        
        map.current.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: routeCoordinates
            }
          }
        })

        map.current.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#3b82f6',
            'line-width': 4,
            'line-opacity': 0.7
          }
        })

        // Fit map to show all points
        const bounds = new mapboxgl.LngLatBounds()
        bounds.extend([currentLocation.lng, currentLocation.lat])
        tripRoute.waypoints.forEach(wp => bounds.extend([wp.lng, wp.lat]))
        
        map.current.fitBounds(bounds, { 
          padding: 50,
          maxZoom: 15
        })
      }
    })

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [currentLocation, tripRoute, driverName])

  return (
    <div className={`relative ${className} rounded-lg overflow-hidden`}>
      <div ref={mapContainer} className="w-full h-full" />
      
      {loading && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-md text-xs">
        <h4 className="font-semibold mb-2">Legend</h4>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Driver Location</span>
          </div>
          {tripRoute && (
            <>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Origin</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Destination</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span>Waypoints</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-blue-500 rounded"></div>
                <span>Route</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}