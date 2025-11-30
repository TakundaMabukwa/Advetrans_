import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const HTTP_SERVER_ENDPOINT = process.env.NEXT_PUBLIC_HTTP_SERVER_ENDPOINT || 'http://localhost:3002'
    const url = `${HTTP_SERVER_ENDPOINT}/api/eps-rewards/executive-dashboard`
    
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`EPS API error: ${response.status}`)
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching executive dashboard data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch executive dashboard data' },
      { status: 500 }
    )
  }
}