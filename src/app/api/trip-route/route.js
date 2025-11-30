import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const tripId = searchParams.get('tripId')
  
  if (!tripId) {
    return NextResponse.json({ error: 'Trip ID is required' }, { status: 400 })
  }

  const canBusEndpoint = process.env.NEXT_PUBLIC_CAN_BUS_ENDPOINT

  try {
    // Get high-risk areas first
    const supabase = createClient()
    const { data: highRiskAreas } = await supabase.from('high_risk').select('coordinates')
    
    // Format exclusion zones for external API
    const exclusionZones = highRiskAreas?.map(area => {
      if (!area.coordinates) return null
      return area.coordinates
        .split(' ')
        .filter(coord => coord.trim())
        .map(coord => {
          const [lng, lat] = coord.split(',').slice(0, 2)
          return `${lng},${lat}`
        })
        .join(' ')
    }).filter(Boolean) || []

    // Build URL with exclusion zones
    const url = new URL(`${canBusEndpoint}/api/trips/${tripId}/route`)
    url.searchParams.set('company', 'eps')
    if (exclusionZones.length > 0) {
      url.searchParams.set('avoid_zones', exclusionZones.join('|'))
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch trip route' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json({
      ...data,
      excludedZones: exclusionZones.length,
      avoidedHighRiskAreas: true
    })
  } catch (error) {
    console.error('Error fetching trip route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
