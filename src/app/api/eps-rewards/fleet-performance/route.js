import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const url = 'http://64.227.138.235:3000/api/eps-rewards/driver-risk-assessment'
    
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`EPS API error: ${response.status}`)
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching fleet performance data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch fleet performance data' },
      { status: 500 }
    )
  }
}