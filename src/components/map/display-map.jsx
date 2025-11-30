'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

export default function MapView({ center = [28.0473, -26.2041], zoom = 12, tripId }) {
  const mapContainer = useRef(null)
  const map = useRef(null)
  const [routeCoordinates, setRouteCoordinates] = useState(null)

  // Removed external API call - using routePoints prop instead

  useEffect(() => {
    if (map.current) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: center,
      zoom: zoom,
    })

    map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right')
  }, [])

  useEffect(() => {
    if (!map.current || !routeCoordinates || routeCoordinates.length === 0) return

    map.current.on('load', () => {
      const coordinates = routeCoordinates.map(coord => [coord.longitude, coord.latitude])

      if (map.current.getSource('route')) {
        map.current.removeLayer('route')
        map.current.removeSource('route')
      }

      map.current.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: coordinates
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
          'line-width': 4
        }
      })

      const bounds = coordinates.reduce((bounds, coord) => {
        return bounds.extend(coord)
      }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]))

      map.current.fitBounds(bounds, { padding: 50 })
    })
  }, [routeCoordinates])

  return (
    <div
      ref={mapContainer}
      className="w-full h-[500px] rounded-lg"
    />
  )
}
