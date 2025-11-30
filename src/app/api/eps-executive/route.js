export async function POST(request) {
  try {
    const { endpoint } = await request.json()
    const HTTP_SERVER_ENDPOINT = process.env.NEXT_PUBLIC_HTTP_SERVER_ENDPOINT || 'http://localhost:3001'
    
    const response = await fetch(`${HTTP_SERVER_ENDPOINT}${endpoint}`)
    
    if (!response.ok) {
      console.error(`API Error: ${response.status} ${response.statusText}`)
      return Response.json({ error: `API returned ${response.status}` }, { status: response.status })
    }
    
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text()
      console.error('Non-JSON response:', text.substring(0, 200))
      return Response.json({ error: 'Invalid response format' }, { status: 500 })
    }
    
    const data = await response.json()
    return Response.json(data)
  } catch (error) {
    console.error('Executive API proxy error:', error)
    return Response.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}