export const getLatLngFromAddress = async ({
  street = '',
  city = '',
  state = '',
  country = '',
}) => {
  const query = [street, city, state, country].filter(Boolean).join(', ')
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
    query
  )}&format=json&limit=1&addressdetails=1`

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'YourAppNameHere (your@email.com)',
        'Accept-Language': 'en',
      },
    })

    if (!res.ok) {
      throw new Error(`Failed to fetch location: ${res.status}`)
    }

    const data = await res.json()

    if (data.length === 0) {
      throw new Error('No results found for the given address')
    }

    const { lat, lon } = data[0]
    return { lat: parseFloat(lat), lng: parseFloat(lon) }
  } catch (error) {
    console.error('Geocoding error:', error)
    return null
  }
}
