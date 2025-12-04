// Geocoding rules for accurate location detection

const BROAD_LOCATIONS = ['cape town', 'johannesburg', 'durban', 'pretoria', 'port elizabeth', 'bloemfontein']
const WESTERN_CAPE_KEYWORDS = ['western cape', 'cape town', 'stellenbosch', 'paarl', 'worcester', 'bredasdorp']

/**
 * Apply regional grouping to cluster nearby locations
 * Groups locations by delivery zones for better vehicle utilization
 */
function applyRegionalGrouping(locationName: string, lat: number, lng: number): string {
  const name = locationName.toLowerCase()
  
  // Route 1: Northern Industrial (Stikland, Epping, Elsies, Brackenfell)
  if (name.includes('stikland') || name.includes('epping') || name.includes('elsies') || name.includes('brackenfell')) {
    return 'Northern Industrial'
  }
  
  // Route 2: West Coast Metro (Milnerton, Diep Rivier, Paarl, Cape Town CBD)
  if (name.includes('milnerton') || name.includes('diep rivier') || name.includes('christiaan barnard') || 
      (name.includes('cape town') && !name.includes('northern') && !name.includes('southern'))) {
    return 'West Coast Metro'
  }
  
  // Route 3: Overberg (Grabouw, Caledon, Ouplaas, Bredasdorp)
  if (name.includes('grabouw') || name.includes('caledon') || name.includes('ouplaas') || name.includes('bredasdorp')) {
    return 'Overberg'
  }
  
  // Route 4: Boland Corridor (Worcester, Montagu, Robertson, Ashton, Bonnievale)
  if (name.includes('worcester') || name.includes('montagu') || name.includes('robertson') || 
      name.includes('ashton') || name.includes('bonnievale')) {
    return 'Boland Corridor'
  }
  
  // Route 5: Northern Suburbs (Bellville, Tygervalley, Goodwood, Parow, Stellenbosch)
  if (name.includes('bellville') || name.includes('tygervalley') || name.includes('tygervallei') || 
      name.includes('goodwood') || name.includes('parow') || name.includes('stellenbosch')) {
    return 'Northern Suburbs'
  }
  
  // Paarl separate route (high weight orders)
  if (name.includes('paarl')) {
    return 'Paarl Route'
  }
  
  // West Coast
  if (name.includes('porterville') || name.includes('piketberg') || name.includes('vredenburg') || 
      name.includes('saldanha') || name.includes('langebaan') || name.includes('malmesbury')) {
    return 'West Coast'
  }
  
  // Garden Route
  if (name.includes('swellendam') || name.includes('george') || name.includes('mossel bay') || 
      name.includes('oudtshoorn') || name.includes('knysna') || name.includes('plettenberg') || 
      name.includes('riversdale')) {
    return 'Garden Route'
  }
  
  // Cape Town Metro fallback
  if (name.includes('cape town') || name.includes('strand') || name.includes('somerset west')) {
    return 'Cape Town Metro'
  }
  
  // Distance-based fallback for Cape Town Metro (within 25km of CBD)
  const capeTownCBD = { lat: -33.9249, lng: 18.4241 }
  const distToCT = haversineDistance(lat, lng, capeTownCBD.lat, capeTownCBD.lng)
  
  if (distToCT < 25) {
    return 'Cape Town Metro'
  }
  
  return locationName
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export async function geocodeWithRules(
  customerName: string,
  location: string,
  mapboxToken: string
): Promise<{ lat: number; lng: number; location_group: string; place_name: string; municipality: string } | null> {
  
  // Always use "Customer Name, Location" format for better accuracy
  const searchQuery = customerName && location
    ? `${customerName}, ${location}`
    : (location || customerName)

  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?` +
      `access_token=${mapboxToken}&` +
      `country=za&` +
      `proximity=18.4241,-33.9249&` +
      `types=place,locality,neighborhood,address,poi&` +
      `limit=5`
    )

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`)
    }

    const data = await response.json()

    if (!data.features?.[0]) {
      return null
    }

    // Filter for Western Cape results first
    const westernCapeFeature = data.features.find(f => {
      const placeName = f.place_name?.toLowerCase() || ''
      return WESTERN_CAPE_KEYWORDS.some(keyword => placeName.includes(keyword))
    })
    
    const feature = westernCapeFeature || data.features[0]
    const [lng, lat] = feature.center

    // Extract location group with better regional clustering
    const context = feature.context || []
    const place = context.find(c => c.id.startsWith('place.'))
    const district = context.find(c => c.id.startsWith('district.'))
    const region = context.find(c => c.id.startsWith('region.'))

    // Use place name for primary grouping (city/town level)
    let location_group = place?.text || district?.text || region?.text || feature.text
    const municipality = place?.text || district?.text || feature.text || 'Unknown'
    
    // Apply regional grouping rules for better clustering
    location_group = applyRegionalGrouping(location_group, lat, lng)

    return {
      lat,
      lng,
      location_group,
      place_name: feature.place_name,
      municipality
    }
  } catch (error) {
    console.error('Geocoding error:', error)
    return null
  }
}
