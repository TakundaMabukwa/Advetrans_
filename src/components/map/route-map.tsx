'use client'

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

interface RouteMapProps {
  coordinates?: number[][]
}

export default function RouteMap({ coordinates }: RouteMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)

  const defaultCoordinates = [
    [31.018885, -29.903031], [31.018965, -29.903105], [31.019861, -29.903916],
    [31.019896, -29.903952], [31.019838, -29.904015], [31.019804, -29.904061],
    [31.019794, -29.904114], [31.019791, -29.904189], [31.019771, -29.904245],
    [31.019699, -29.904317], [31.019262, -29.904699], [31.019117, -29.904801],
    [31.018908, -29.904952], [31.01885, -29.905009], [31.018821, -29.905076],
    [31.018811, -29.90515], [31.018817, -29.905255], [31.018811, -29.905348],
    [31.018779, -29.905427], [31.018714, -29.905534], [31.018638, -29.905625],
    [31.018552, -29.90569], [31.018501, -29.905724], [31.018438, -29.905824],
    [31.018139, -29.906092], [28.042224, -26.205459], [28.042114, -26.204677]
  ]

  const routeCoords = coordinates || defaultCoordinates

  useEffect(() => {
    if (map.current || !mapContainer.current) return

    // Calculate center from coordinates
    const lngs = routeCoords.map(coord => coord[0])
    const lats = routeCoords.map(coord => coord[1])
    const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2
    const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [centerLng, centerLat],
      zoom: 10,
    })

    map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right')

    map.current.on('load', () => {
      if (!map.current) return

      // Add route source
      map.current.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: routeCoords
          }
        }
      })

      // Add route layer
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

      // Add markers for start and end points
      new mapboxgl.Marker({ color: '#22c55e' })
        .setLngLat(routeCoords[0])
        .setPopup(new mapboxgl.Popup().setHTML('<div>Start Point</div>'))
        .addTo(map.current)

      new mapboxgl.Marker({ color: '#ef4444' })
        .setLngLat(routeCoords[routeCoords.length - 1])
        .setPopup(new mapboxgl.Popup().setHTML('<div>End Point</div>'))
        .addTo(map.current)

      // Fit map to route bounds
      const bounds = new mapboxgl.LngLatBounds()
      routeCoords.forEach(coord => bounds.extend(coord as [number, number]))
      map.current.fitBounds(bounds, { padding: 50 })
    })

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [])

  return (
    <div
      ref={mapContainer}
      className="w-full h-[500px] rounded-lg"
    />
  )
}