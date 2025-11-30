import * as turf from '@turf/turf'

export const findClosestVehicle = async (targetLocation, highRiskAreas = []) => {
  try {
    const vehicleEndpoint = process.env.NEXT_PUBLIC_VEHICLE_API_ENDPOINT || process.env.NEXT_PUBLIC_HTTP_SERVER_ENDPOINT
    const response = await fetch(`${vehicleEndpoint}/api/eps-vehicles`)
    
    if (!response.ok) throw new Error('Failed to fetch vehicles')
    
    const { data: vehicles } = await response.json()
    
    const target = turf.point([targetLocation.longitude, targetLocation.latitude])
    const riskPolygons = highRiskAreas.map(area => {
      const coords = parseCoordinates(area.coordinates)
      return coords.length >= 3 ? turf.polygon([coords.concat([coords[0]])]) : null
    }).filter(Boolean)
    
    let closestVehicle = null
    let shortestDistance = Infinity
    
    for (const vehicle of vehicles) {
      if (!vehicle.latitude || !vehicle.longitude) continue
      
      const vehiclePoint = turf.point([parseFloat(vehicle.longitude), parseFloat(vehicle.latitude)])
      const distance = turf.distance(target, vehiclePoint, { units: 'kilometers' })
      
      // Check if direct route would pass through high-risk areas
      const directRoute = turf.lineString([
        [parseFloat(vehicle.longitude), parseFloat(vehicle.latitude)],
        [targetLocation.longitude, targetLocation.latitude]
      ])
      
      const intersectsRisk = riskPolygons.some(polygon => 
        turf.booleanIntersects(directRoute, polygon)
      )
      
      // Penalize routes that go through high-risk areas
      const adjustedDistance = intersectsRisk ? distance * 1.5 : distance
      
      if (adjustedDistance < shortestDistance) {
        shortestDistance = adjustedDistance
        closestVehicle = {
          ...vehicle,
          distance: distance,
          adjustedDistance: adjustedDistance,
          passesHighRisk: intersectsRisk
        }
      }
    }
    
    return closestVehicle
  } catch (error) {
    console.error('Error finding closest vehicle:', error)
    return null
  }
}

const parseCoordinates = (coordString) => {
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