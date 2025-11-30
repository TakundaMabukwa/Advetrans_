import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const endpoint = searchParams.get('endpoint')
  const driverName = searchParams.get('driverName')
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')

  try {
    const HTTP_SERVER_ENDPOINT = process.env.NEXT_PUBLIC_HTTP_SERVER_ENDPOINT || 'http://localhost:3001'
    let url = `${HTTP_SERVER_ENDPOINT}/api/eps-rewards/`
    
    switch (endpoint) {
      case 'driver-performance':
        if (driverName) {
          url += `driver-performance/${encodeURIComponent(driverName)}?startDate=${startDate}&endDate=${endDate}`
        } else {
          url += `driver-performance?startDate=${startDate}&endDate=${endDate}`
        }
        break
      case 'fleet-performance':
        url += 'driver-risk-assessment'
        break
      case 'executive-dashboard':
        url += 'executive-dashboard'
        break
      case 'leaderboard':
        url += `leaderboard?startDate=${startDate}&endDate=${endDate}&limit=10`
        break
      case 'daily-performance':
        return NextResponse.json({ data: [], message: 'Daily performance data not available' })
      case 'daily-stats':
        return NextResponse.json({ data: [], message: 'Daily stats data not available' })
      case 'driver-risk-assessment':
        url += 'driver-risk-assessment'
        break
      case 'performance':
        url += 'all-driver-profiles'
        break
      case 'top-worst-drivers':
        url += 'top-worst-drivers'
        break
      case 'violations':
        url += 'monthly-incident-criteria'
        break
      case 'monthly-incident-criteria':
        url += 'monthly-incident-criteria'
        break
      case 'all-driver-profiles':
        url += 'all-driver-profiles'
        break
      case 'latest':
        url += 'health'
        break
      default:
        return NextResponse.json({ error: 'Invalid endpoint' }, { status: 400 })
    }

    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`EPS API error: ${response.status}`)
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching EPS rewards data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch EPS rewards data' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { endpoint } = body
    
    const response = await fetch(endpoint)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error proxying request:', error)
    return NextResponse.json({ error: 'Failed to proxy request' }, { status: 500 })
  }
}