import * as turf from '@turf/turf'
import { getTollCost } from './toll-rates'

export const calculateTollCosts = async (routeCoordinates, vehicleType = null) => {
  const { getVehicleTollClass } = await import('./vehicle-toll-mapper')
  const vehicleClass = vehicleType ? getVehicleTollClass(vehicleType) : 'class2'
  try {
    const response = await fetch('/api/toll-gates')
    if (!response.ok) return { tollGates: [], totalCost: 0, totalTime: 0 }
    
    const { data: tollGates } = await response.json()
    const routeLine = turf.lineString(routeCoordinates)
    
    const passedTolls = []
    let totalCost = 0
    let totalTime = 0
    
    for (const toll of tollGates || []) {
      if (!toll.coordinates) continue
      
      const coords = parseCoordinates(toll.coordinates)
      if (coords.length < 1) continue
      
      const tollPoint = turf.point(coords[0])
      const buffer = turf.buffer(tollPoint, toll.radius || 0.5, { units: 'kilometers' })
      
      if (turf.booleanIntersects(routeLine, buffer)) {
        const cost = getTollCost(toll.name, vehicleClass)
        const time = 5 // 5 minutes delay per toll for heavy vehicles
        
        passedTolls.push({
          ...toll,
          cost,
          time,
          vehicleClass
        })
        
        totalCost += cost
        totalTime += time
      }
    }
    
    // Add VAT (15%)
    const totalWithVAT = totalCost * 1.15
    
    return {
      tollGates: passedTolls,
      totalCost: Math.round(totalWithVAT * 100) / 100,
      totalTime,
      count: passedTolls.length,
      vehicleClass
    }
  } catch (error) {
    console.error('Toll calculation error:', error)
    return { tollGates: [], totalCost: 0, totalTime: 0, count: 0 }
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