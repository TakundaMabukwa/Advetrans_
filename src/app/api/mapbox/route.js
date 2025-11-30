export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const endpoint = searchParams.get('endpoint')
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
  
  if (!endpoint || !token) {
    return Response.json({ error: 'Missing endpoint or token' }, { status: 400 })
  }
  
  try {
    // Build query string from all params except endpoint
    const params = new URLSearchParams()
    params.set('access_token', token)
    
    for (const [key, value] of searchParams.entries()) {
      if (key !== 'endpoint') {
        params.set(key, value)
      }
    }
    
    const response = await fetch(`${endpoint}?${params.toString()}`)
    
    if (!response.ok) {
      return Response.json({ error: `API request failed: ${response.status}` }, { status: response.status })
    }
    
    const data = await response.json()
    
    return Response.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  } catch (error) {
    console.error('Proxy error:', error)
    return Response.json({ error: 'Proxy request failed' }, { status: 500 })
  }
}