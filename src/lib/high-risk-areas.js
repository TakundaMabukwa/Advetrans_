import { createClient } from '@/lib/supabase/client'
import * as turf from '@turf/turf'

export const parseCoordinates = (coordString) => {
  if (!coordString) return []
  return coordString
    .split(' ')
    .filter(coord => coord.trim())
    .map(coord => {
      const [lng, lat] = coord.split(',').slice(0, 2)
      return [parseFloat(lng), parseFloat(lat)]
    })
    .filter(coord => !isNaN(coord[0]) && !isNaN(coord[1]))
}

/**
 * Fetch all high-risk areas from database
 */
export const fetchHighRiskAreas = async () => {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('high_risk')
      .select('*')
    
    if (error) {
      console.error('Error fetching high-risk areas:', error)
      return []
    }
    
    return data.map(area => ({
      ...area,
      parsedCoordinates: parseCoordinates(area.coordinates)
    }))
  } catch (error) {
    console.error('Error in fetchHighRiskAreas:', error)
    return []
  }
}

export const checkRouteAgainstHighRiskAreas = (routeCoordinates, highRiskAreas) => {
  const violations = []
  
  for (const area of highRiskAreas) {
    const coords = parseCoordinates(area.coordinates)
    if (coords.length < 3) continue
    
    const polygon = turf.polygon([coords.concat([coords[0]])])
    
    for (const point of routeCoordinates) {
      if (turf.booleanPointInPolygon(turf.point(point), polygon)) {
        violations.push({ areaId: area.id, areaName: area.name, point })
        break
      }
    }
  }
  
  return violations
}

export const createHighRiskPolygon = (area) => {
  const coords = parseCoordinates(area.coordinates)
  if (coords.length < 3) return null
  
  return turf.polygon([coords.concat([coords[0]])], {
    id: area.id,
    name: area.name,
    type: area.type
  })
}

export const optimizeRouteAvoidingAreas = (waypoints, highRiskAreas) => {
  const areas = highRiskAreas.map(createHighRiskPolygon).filter(Boolean)
  const route = turf.lineString(waypoints)
  
  for (const area of areas) {
    if (turf.booleanIntersects(route, area)) {
      // Route intersects high-risk area - need alternative
      return { intersects: true, area: area.properties }
    }
  }
  
  return { intersects: false, route: waypoints }
}