const DEPOT_LAT = -33.9249
const DEPOT_LON = 18.6369

export async function reoptimizeVehicleRoute(orders: any[]) {
  const validOrders = orders.filter(o => o.latitude && o.longitude)
  
  if (validOrders.length === 0) {
    return { orders, distance: 0, duration: 0, geometry: null }
  }

  try {
    const geoapifyKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY
    if (!geoapifyKey) {
      return { orders, distance: 0, duration: 0, geometry: null }
    }

    const waypoints = [
      `${DEPOT_LAT},${DEPOT_LON}`,
      ...validOrders.map(o => `${o.latitude},${o.longitude}`),
      `${DEPOT_LAT},${DEPOT_LON}`
    ].join('|')
    
    const response = await fetch(
      `https://api.geoapify.com/v1/routing?waypoints=${waypoints}&mode=truck&apiKey=${geoapifyKey}`
    )
    
    if (response.ok) {
      const data = await response.json()
      console.log('Geoapify response:', data)
      if (data.features?.[0]) {
        const feature = data.features[0]
        const result = {
          orders: validOrders,
          distance: Math.round(feature.properties.distance || 0),
          duration: Math.round((feature.properties.time || 0) / 60),
          geometry: Array.isArray(feature.geometry.coordinates[0][0]) 
            ? feature.geometry.coordinates.flat() 
            : feature.geometry.coordinates
        }
        console.log('Route result:', result)
        return result
      }
    } else {
      const error = await response.text()
      console.error('Geoapify error:', error)
    }
  } catch (error) {
    console.error('Route optimization failed:', error)
  }

  return { orders, distance: 0, duration: 0, geometry: null }
}
