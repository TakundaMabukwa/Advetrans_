import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder()
  
  const stream = new ReadableStream({
    async start(controller) {
      const endpoint = process.env.NEXT_PUBLIC_CAN_BUS_ENDPOINT
      const key = process.env.NEXT_PUBLIC_CANBUS_KEY
      
      if (!endpoint || !key) {
        controller.error('CAN bus endpoint or key not configured')
        return
      }

      try {
        // Polling approach since EventSource not available in Node.js
        const pollData = async () => {
          try {
            const response = await fetch(`${endpoint}/canbus/snapshot?key=${key}`)
            if (!response.ok) return
            
            const vehicles = await response.json()
            
            for (const vehicle of vehicles) {
              const fuelLevelItem = vehicle.data?.find((item: any) => 
                item.name === 'fuel Level Liter' || item.code === '96'
              )
              const engineTempItem = vehicle.data?.find((item: any) => 
                item.name === 'engine temperature' || item.code === '6E'
              )
              const totalFuelUsedItem = vehicle.data?.find((item: any) => 
                item.name === 'total fuel used' || item.code === 'FA'
              )
              const fuelPercentItem = vehicle.data?.find((item: any) => 
                item.name === 'fuel level %' || item.code === '60'
              )

              const processedVehicle = {
                plate: vehicle.plate,
                timestamp: vehicle.timestamp,
                fuelLevel: fuelLevelItem?.value || 0,
                fuelPercentage: fuelPercentItem?.value || 0,
                engineTemperature: engineTempItem?.value || 0,
                totalFuelUsed: totalFuelUsedItem?.value || 0
              }

              controller.enqueue(encoder.encode(`data: ${JSON.stringify(processedVehicle)}\n\n`))
            }
          } catch (error) {
            console.error('Polling error:', error)
          }
        }
        
        // Poll every 5 seconds
        const interval = setInterval(pollData, 5000)
        
        // Cleanup on abort
        request.signal.addEventListener('abort', () => {
          clearInterval(interval)
          controller.close()
        })
        
      } catch (error) {
        console.error('Stream setup error:', error)
        controller.error(error)
      }
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}