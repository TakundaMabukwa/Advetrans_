'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'

interface VehicleRouteMapProps {
  geometry: any
  stops: Array<{ name: string; lat: number; lng: number }>
  vehicleName: string
  depot: { lat: number; lng: number }
}

function VehicleRouteMapComponent({ geometry, stops, vehicleName, depot }: VehicleRouteMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<any>(null)
  const [routeStatus, setRouteStatus] = useState<string>('')

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainer.current || map.current) return

    import('mapbox-gl').then(async (mapboxgl) => {
      mapboxgl.default.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

      map.current = new mapboxgl.default.Map({
        container: mapContainer.current!,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [depot.lng, depot.lat],
        zoom: 8
      })

      map.current.on('load', async () => {
        // Load arrow icon
        if (map.current && !map.current.hasImage('arrow')) {
          const arrowSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 4L20 12L12 20L12 14L4 14L4 10L12 10L12 4Z" fill="%233b82f6"/></svg>`
          const arrowImg = new Image(24, 24)
          arrowImg.onload = () => {
            if (map.current && !map.current.hasImage('arrow')) {
              map.current.addImage('arrow', arrowImg)
            }
          }
          arrowImg.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(arrowSvg)
        }

        let routeCoords: number[][] | null = null

        if (geometry) {
          if (geometry.coordinates && Array.isArray(geometry.coordinates)) {
            routeCoords = geometry.coordinates
          } else if (Array.isArray(geometry)) {
            if (geometry.length > 0 && Array.isArray(geometry[0]) && geometry[0].length === 2) {
              routeCoords = geometry
            }
          }
        }

        // Fallback: fetch from Geoapify if no geometry
        if (!routeCoords && stops.length > 0) {
          setRouteStatus('Fetching route from Geoapify...')
          try {
            const waypoints = [
              `${depot.lng},${depot.lat}`,
              ...stops.map(s => `${s.lng},${s.lat}`),
              `${depot.lng},${depot.lat}`
            ].join('|')

            const response = await fetch(
              `https://api.geoapify.com/v1/routing?waypoints=${waypoints}&mode=drive&apiKey=${process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY}`
            )
            const data = await response.json()
            
            if (data.features?.[0]?.geometry?.coordinates) {
              routeCoords = data.features[0].geometry.coordinates
            }
          } catch (error) {
            console.error('Geoapify route fetch failed:', error)
          }
        }

        if (routeCoords && routeCoords.length > 0) {
          const validCoords = routeCoords.filter(coord => 
            Array.isArray(coord) && 
            coord.length === 2 && 
            typeof coord[0] === 'number' && 
            typeof coord[1] === 'number'
          )

          if (validCoords.length > 0) {
            if (!map.current.getSource('route')) {
              map.current.addSource('route', {
                type: 'geojson',
                data: {
                  type: 'Feature',
                  properties: {},
                  geometry: {
                    type: 'LineString',
                    coordinates: validCoords
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

              map.current.addLayer({
                id: 'route-arrows',
                type: 'symbol',
                source: 'route',
                layout: {
                  'symbol-placement': 'line',
                  'symbol-spacing': 50,
                  'icon-image': 'arrow',
                  'icon-size': 0.5,
                  'icon-rotate': 90,
                  'icon-rotation-alignment': 'map',
                  'icon-allow-overlap': true,
                  'icon-ignore-placement': true
                }
              })
            }
            
            setTimeout(() => {
              const bounds = new mapboxgl.default.LngLatBounds()
              validCoords.forEach(coord => bounds.extend([coord[0], coord[1]]))
              map.current.fitBounds(bounds, { 
                padding: { top: 80, bottom: 80, left: 80, right: 80 },
                maxZoom: 14,
                duration: 1000
              })
            }, 100)
            
            setRouteStatus(`${validCoords.length} points`)
          }
        } else {
          setRouteStatus('No route available')
        }

        new mapboxgl.default.Marker({ color: '#10b981' })
          .setLngLat([depot.lng, depot.lat])
          .setPopup(new mapboxgl.default.Popup().setHTML('<strong>Depot</strong>'))
          .addTo(map.current)

        stops.forEach((stop, idx) => {
          const el = document.createElement('div')
          el.style.cssText = 'background:#ef4444;width:30px;height:30px;border-radius:50%;border:2px solid white;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:12px;'
          el.textContent = (idx + 1).toString()

          new mapboxgl.default.Marker(el)
            .setLngLat([stop.lng, stop.lat])
            .setPopup(new mapboxgl.default.Popup().setHTML(`<strong>Stop ${idx + 1}</strong><br/>${stop.name}`))
            .addTo(map.current)
        })
      })
    })

    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [geometry, stops, depot])

  return (
    <div className="relative">
      <div ref={mapContainer} className="w-full h-[400px] rounded-lg" />
      {routeStatus && (
        <div className="absolute top-2 right-2 bg-white px-3 py-1 rounded shadow text-xs text-gray-600 z-10">
          {routeStatus}
        </div>
      )}
    </div>
  )
}

export const VehicleRouteMap = dynamic(() => Promise.resolve(VehicleRouteMapComponent), {
  ssr: false,
  loading: () => <div className="w-full h-[400px] rounded-lg bg-gray-100 flex items-center justify-center">Loading map...</div>
})
