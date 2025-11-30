'use client'

import { useEffect, useState } from 'react'
import { Polygon, Popup } from 'react-leaflet'
import { fetchHighRiskAreas, parseCoordinates } from '@/lib/high-risk-areas'

export default function HighRiskOverlay() {
  const [highRiskAreas, setHighRiskAreas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadHighRiskAreas = async () => {
      try {
        const areas = await fetchHighRiskAreas()
        setHighRiskAreas(areas)
      } catch (error) {
        console.error('Error loading high-risk areas:', error)
      } finally {
        setLoading(false)
      }
    }

    loadHighRiskAreas()
  }, [])

  if (loading) return null

  return (
    <>
      {highRiskAreas.map((area) => {
        const coordinates = parseCoordinates(area.coordinates)
        
        // Need at least 3 points to form a polygon
        if (coordinates.length < 3) return null

        // Convert [lng, lat] to [lat, lng] for Leaflet
        const leafletCoords = coordinates.map(coord => [coord[1], coord[0]])

        return (
          <Polygon
            key={area.id}
            positions={leafletCoords}
            pathOptions={{
              color: '#ef4444', // Red color
              fillColor: '#ef4444',
              fillOpacity: 0.3,
              weight: 2,
              opacity: 0.8
            }}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-red-600">⚠️ High Risk Area</h3>
                <p className="font-medium">{area.name}</p>
                {area.address && <p className="text-sm text-gray-600">{area.address}</p>}
                {area.type && <p className="text-sm">Type: {area.type}</p>}
                {area.notes && <p className="text-sm mt-1">{area.notes}</p>}
              </div>
            </Popup>
          </Polygon>
        )
      })}
    </>
  )
}