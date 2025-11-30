'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

export function RouteMap({ 
  driverLocation, 
  loadingLocation, 
  dropoffLocation, 
  driverName = "Driver",
  className = "w-full h-[300px]",
  onRouteCalculated
}) {
  const mapContainer = useRef(null)
  const map = useRef(null)
  const [loading, setLoading] = useState(true)
  const [routeInfo, setRouteInfo] = useState({ distance: 0, duration: 0 })

  useEffect(() => {
    if (map.current || !mapContainer.current) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: driverLocation ? [driverLocation.lng, driverLocation.lat] : [28.0473, -26.2041],
      zoom: 10,
    })

    map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right')

    map.current.on('load', async () => {
      setLoading(false)
      
      if (!map.current) return

      try {
        // Geocode locations
        const [loadingCoords, dropoffCoords] = await Promise.all([
          geocodeLocation(loadingLocation),
          geocodeLocation(dropoffLocation)
        ])

        if (driverLocation) {
          // Add driver marker
          new mapboxgl.Marker({ color: '#3b82f6', scale: 1.2 })
            .setLngLat([driverLocation.lng, driverLocation.lat])
            .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`
              <div class="p-2">
                <h3 class="font-semibold text-sm">${driverName}</h3>
                <p class="text-xs text-gray-600">Current Location</p>
              </div>
            `))
            .addTo(map.current)
        }

        if (loadingCoords) {
          // Add loading marker
          new mapboxgl.Marker({ color: '#10b981', scale: 0.8 })
            .setLngLat([loadingCoords.lng, loadingCoords.lat])
            .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`
              <div class="p-2">
                <h3 class="font-semibold text-sm">Loading</h3>
                <p class="text-xs text-gray-600">${loadingLocation}</p>
              </div>
            `))
            .addTo(map.current)
        }

        if (dropoffCoords) {
          // Add dropoff marker
          new mapboxgl.Marker({ color: '#ef4444', scale: 0.8 })
            .setLngLat([dropoffCoords.lng, dropoffCoords.lat])
            .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`
              <div class="p-2">
                <h3 class="font-semibold text-sm">Drop-off</h3>
                <p class="text-xs text-gray-600">${dropoffLocation}</p>
              </div>
            `))
            .addTo(map.current)
        }

        // Draw route segments
        const routeCoordinates = []
        const bounds = new mapboxgl.LngLatBounds()
        
        if (driverLocation) {
          routeCoordinates.push([driverLocation.lng, driverLocation.lat])
          bounds.extend([driverLocation.lng, driverLocation.lat])
        }
        
        if (loadingCoords) {
          routeCoordinates.push([loadingCoords.lng, loadingCoords.lat])
          bounds.extend([loadingCoords.lng, loadingCoords.lat])
        }
        
        if (dropoffCoords) {
          routeCoordinates.push([dropoffCoords.lng, dropoffCoords.lat])
          bounds.extend([dropoffCoords.lng, dropoffCoords.lat])
        }

        // Get driving route with time and distance
        if (routeCoordinates.length >= 2) {
          try {
            const waypoints = routeCoordinates.map(coord => `${coord[0]},${coord[1]}`).join(';')
            const directionsResponse = await fetch(
              `https://api.mapbox.com/directions/v5/mapbox/driving/${waypoints}?access_token=${mapboxgl.accessToken}&geometries=geojson&overview=full`
            )
            const directionsData = await directionsResponse.json()
            
            if (directionsData.routes?.[0]) {
              const route = directionsData.routes[0]
              const totalDistance = Math.round(route.distance / 1000 * 10) / 10
              const totalDuration = Math.round(route.duration / 60)
              
              setRouteInfo({ distance: totalDistance, duration: totalDuration })
              onRouteCalculated?.({ distance: totalDistance, duration: totalDuration })
              
              map.current.addSource('route', {
                type: 'geojson',
                data: {
                  type: 'Feature',
                  properties: {},
                  geometry: route.geometry
                }
              })
            } else {
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
            }
          } catch (error) {
            console.error('Directions API error:', error)
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
          }

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

          if (routeCoordinates.length > 0) {
            map.current.fitBounds(bounds, { padding: 50, maxZoom: 15 })
          }
        }
      } catch (error) {
        console.error('Error setting up map:', error)
      }
    })

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [driverLocation, loadingLocation, dropoffLocation, driverName])

  const geocodeLocation = async (location) => {
    if (!location) return null
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json?access_token=${mapboxgl.accessToken}&country=za&limit=1`
      )
      const data = await response.json()
      if (data.features?.[0]?.center) {
        const [lng, lat] = data.features[0].center
        return { lat, lng }
      }
    } catch (error) {
      console.error('Geocoding error:', error)
    }
    return null
  }

  return (
    <div className={`relative ${className} rounded-lg overflow-hidden`}>
      <div ref={mapContainer} className="w-full h-full" />
      
      {loading && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Route Info */}
      <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-md text-xs space-y-2">
        <h4 className="font-semibold">Route Information</h4>
        {routeInfo.distance > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between gap-4">
              <span>Distance:</span>
              <span className="font-medium">{routeInfo.distance} km</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Duration:</span>
              <span className="font-medium">
                {Math.floor(routeInfo.duration / 60)}h {routeInfo.duration % 60}m
              </span>
            </div>
          </div>
        )}
        <div className="border-t pt-2 space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Driver</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Loading</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Drop-off</span>
          </div>
        </div>
      </div>
    </div>
  )
}