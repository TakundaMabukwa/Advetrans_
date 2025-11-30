import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const endpoint = process.env.NEXT_PUBLIC_CAN_BUS_ENDPOINT || 'http://64.227.126.176:3001'
    console.log('Fetching fuel data from:', `${endpoint}/fuel`)
    const response = await fetch(`${endpoint}/fuel`)
    
    if (!response.ok) {
      console.error(`API error: ${response.status} ${response.statusText}`)
      throw new Error(`API error: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('Fuel data received:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Fuel proxy error:', error)
    return NextResponse.json({ error: 'Failed to fetch fuel data' }, { status: 500 })
  }
}