const MAPBOX_ACCESS_TOKEN =
  'pk.eyJ1IjoicmVuZGFuaS1kZXYiLCJhIjoiY21kM2c3OXQ4MDJ6MjJqczlqbzNwcDZvaCJ9.6skTnPcXqD7h24o9mfuQnw'

/**
 * Geocode an address to get coordinates using Mapbox Geocoding API
 */
export async function geocodeAddress(address) {
  try {
    const encodedAddress = encodeURIComponent(address)
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${MAPBOX_ACCESS_TOKEN}&limit=1`
    )

    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.statusText}`)
    }

    const data = await response.json()

    if (data.features && data.features.length > 0) {
      const feature = data.features[0]
      const [lng, lat] = feature.center

      return {
        lat,
        lng,
        formatted_address: feature.place_name,
        place_name: feature.place_name,
      }
    }

    return null
  } catch (error) {
    console.error('Geocoding error:', error)
    return null
  }
}

/**
 * Geocode from form data (street, city, state, country)
 */
export async function geocodeFromFormData(formData) {
  const { street, city, state, country } = formData

  if (!street || !city || !state || !country) {
    return null
  }

  const address = `${street}, ${city}, ${state}, ${country}`
  return geocodeAddress(address)
}

/**
 * Reverse geocode coordinates to get address components
 */
export async function reverseGeocode(lat, lng) {
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_ACCESS_TOKEN}&types=address`
    )

    if (!response.ok) {
      throw new Error(`Reverse geocoding failed: ${response.statusText}`)
    }

    const data = await response.json()

    if (data.features && data.features.length > 0) {
      const feature = data.features[0]
      const context = feature.context || []

      const street = feature.text || ''
      let city = ''
      let state = ''
      let country = ''

      context.forEach((item) => {
        if (item.id.startsWith('place')) {
          city = item.text
        } else if (item.id.startsWith('region')) {
          state = item.text
        } else if (item.id.startsWith('country')) {
          country = item.text
        }
      })

      return {
        street,
        city,
        state,
        country,
        formatted_address: feature.place_name,
      }
    }

    return null
  } catch (error) {
    console.error('Reverse geocoding error:', error)
    return null
  }
}

/**
 * Search for places/addresses with autocomplete
 */
export async function searchPlaces(query, limit = 5) {
  try {
    if (!query || query.length < 3) {
      return []
    }

    const encodedQuery = encodeURIComponent(query)
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedQuery}.json?access_token=${MAPBOX_ACCESS_TOKEN}&limit=${limit}&types=address,poi`
    )

    if (!response.ok) {
      throw new Error(`Place search failed: ${response.statusText}`)
    }

    const data = await response.json()
    return data.features || []
  } catch (error) {
    console.error('Place search error:', error)
    return []
  }
}
