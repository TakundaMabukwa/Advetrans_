import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    // Return mock fuel data since this endpoint doesn't exist on the server
    return NextResponse.json({
      fuel_readings: 1000,
      average_fuel_level: 100,
      low_fuel_vehicles: 4,
      vehicles: []
    })
  } catch (error) {
    console.error('Error fetching fuel levels:', error)
    return NextResponse.json(
      { error: 'Failed to fetch fuel levels' },
      { status: 500 }
    )
  }
}