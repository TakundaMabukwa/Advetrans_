// Geocoding rules for accurate location detection

const BROAD_LOCATIONS = ['cape town', 'johannesburg', 'durban', 'pretoria', 'port elizabeth', 'bloemfontein']
const WESTERN_CAPE_KEYWORDS = ['western cape', 'cape town', 'stellenbosch', 'paarl', 'worcester', 'bredasdorp']

export async function geocodeWithRules(
  customerName: string,
  location: string,
  mapboxToken: string
): Promise<{ lat: number; lng: number; location_group: string; place_name: string } | null> {
  
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

    // Extract location group from context
    const context = feature.context || []
    const neighborhood = context.find(c => c.id.startsWith('neighborhood.'))
    const locality = context.find(c => c.id.startsWith('locality.'))
    const place = context.find(c => c.id.startsWith('place.'))
    const district = context.find(c => c.id.startsWith('district.'))

    const location_group = neighborhood?.text || locality?.text || place?.text || district?.text || feature.place_name

    return {
      lat,
      lng,
      location_group,
      place_name: feature.place_name
    }
  } catch (error) {
    console.error('Geocoding error:', error)
    return null
  }
}
