import { NextResponse } from 'next/server'

interface CanBusDataItem {
  code: string
  name: string
  rawValue: number
  value: number
  divideBy: number
}

interface CanBusVehicle {
  plate: string
  timestamp: string
  data: CanBusDataItem[]
}

export async function GET() {
  try {
    const endpoint = process.env.NEXT_PUBLIC_CAN_BUS_ENDPOINT
    const key = process.env.NEXT_PUBLIC_CANBUS_KEY
    
    if (!endpoint || !key) {
      throw new Error('CAN bus endpoint or key not configured')
    }

    const response = await fetch(`${endpoint}/canbus/snapshot?key=${key}`)
    if (!response.ok) throw new Error('Failed to fetch CAN bus data')
    
    const vehicles: CanBusVehicle[] = await response.json()
    
    const processedData = vehicles.map(vehicle => {
      const fuelLevelItem = vehicle.data.find(item => 
        item.name === 'fuel Level Liter' || item.code === '96'
      )
      const engineTempItem = vehicle.data.find(item => 
        item.name === 'engine temperature' || item.code === '6E'
      )
      const totalFuelUsedItem = vehicle.data.find(item => 
        item.name === 'total fuel used' || item.code === 'FA'
      )
      const fuelPercentItem = vehicle.data.find(item => 
        item.name === 'fuel level %' || item.code === '60'
      )

      console.log(`Vehicle ${vehicle.plate}:`, {
        fuelPercent: fuelPercentItem,
        fuelLevel: fuelLevelItem,
        engineTemp: engineTempItem
      })

      return {
        plate: vehicle.plate,
        timestamp: vehicle.timestamp,
        fuelLevel: fuelLevelItem?.value || 0,
        fuelPercentage: fuelPercentItem?.value || 0,
        engineTemperature: engineTempItem?.value || 0,
        totalFuelUsed: totalFuelUsedItem?.value || 0
      }
    })

    console.log('Processed data:', processedData)
    return NextResponse.json({ data: processedData })
  } catch (error) {
    console.error('Error fetching CAN bus fuel data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch CAN bus fuel data' },
      { status: 500 }
    )
  }
}