'use client'

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

interface VehicleRouteMapProps {
  geometry: any
  stops: Array<{ name: string; lat: number; lng: number }>
  vehicleName: string
  depot: { lat: number; lng: number }
}

export function VehicleRouteMap({ geometry, stops, vehicleName, depot }: VehicleRouteMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)




  useEffect(() => {
    if (!mapContainer.current || map.current) return

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [depot.lng, depot.lat],
      zoom: 10
    })

    map.current.on('load', () => {
      if (!map.current) return

      // Use stored optimized geometry if available
      if (geometry?.coordinates && Array.isArray(geometry.coordinates)) {
        const coords = geometry.coordinates
        // Simplify if too many points
        const simplified = coords.length > 500 
          ? coords.filter((_: any, i: number) => i % Math.ceil(coords.length / 500) === 0 || i === coords.length - 1)
          : coords

        map.current.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: simplified
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
            'line-opacity': 0.8
          }
        })
        console.log(`Optimized route from database: ${simplified.length} points`)
      }

      // Add depot marker
      new mapboxgl.Marker({ color: '#10b981' })
        .setLngLat([depot.lng, depot.lat])
        .setPopup(new mapboxgl.Popup().setHTML('<strong>Depot</strong>'))
        .addTo(map.current)

      // Add stop markers
      stops.forEach((stop, idx) => {
        if (!map.current) return
        
        const el = document.createElement('div')
        el.className = 'marker'
        el.style.backgroundColor = '#ef4444'
        el.style.width = '30px'
        el.style.height = '30px'
        el.style.borderRadius = '50%'
        el.style.border = '2px solid white'
        el.style.display = 'flex'
        el.style.alignItems = 'center'
        el.style.justifyContent = 'center'
        el.style.color = 'white'
        el.style.fontWeight = 'bold'
        el.style.fontSize = '12px'
        el.textContent = (idx + 1).toString()

        new mapboxgl.Marker(el)
          .setLngLat([stop.lng, stop.lat])
          .setPopup(new mapboxgl.Popup().setHTML(`<strong>Stop ${idx + 1}</strong><br/>${stop.name}`))
          .addTo(map.current)
      })

      // Fit bounds
      if (stops.length > 0) {
        const bounds = new mapboxgl.LngLatBounds()
        bounds.extend([depot.lng, depot.lat])
        stops.forEach(stop => bounds.extend([stop.lng, stop.lat]))
        map.current.fitBounds(bounds, { padding: 50 })
      }
    })

    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [geometry, stops, depot])

  return <div ref={mapContainer} className="w-full h-[400px] rounded-lg" />
}
