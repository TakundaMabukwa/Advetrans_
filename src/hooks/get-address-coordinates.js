export async function geocodeAddress(address) {
  if (!address) return null
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        address
      )}&format=json`
    )
    const data = await res.json()
    if (data?.[0]) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
    }
  } catch (err) {
    console.error('Geocoding error:', err)
  }
  return null
}
