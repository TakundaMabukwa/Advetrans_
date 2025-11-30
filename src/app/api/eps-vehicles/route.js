import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const endpoint = searchParams.get('endpoint')
  const plate = searchParams.get('plate')

  try {
    const HTTP_SERVER_ENDPOINT = process.env.NEXT_PUBLIC_HTTP_SERVER_ENDPOINT || 'http://localhost:3002'
    let url = `${HTTP_SERVER_ENDPOINT}/api/eps-vehicles`
    
    if (endpoint === 'by-plate' && plate) {
      url += `/by-plate?plate=${encodeURIComponent(plate)}`
    } else if (endpoint === 'count') {
      url += '/count'
    } else if (endpoint === 'active') {
      url += '/active'
    } else if (endpoint === 'fuel-levels') {
      // Return mock fuel data since this endpoint doesn't exist on the server
      return NextResponse.json({
        fuel_readings: 1000,
        average_fuel_level: 100,
        low_fuel_vehicles: 4,
        vehicles: []
      })
    }
    
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`EPS API error: ${response.status}`)
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching EPS vehicles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch EPS vehicles' },
      { status: 500 }
    )
  }
}