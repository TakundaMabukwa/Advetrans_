'use client'

import { useState, useEffect } from 'react'
import { FuelGauge } from '@/components/ui/fuel-gauge'
import { Button } from '@/components/ui/button'
import { RefreshCw, Fuel } from 'lucide-react'
import { formatForDisplay } from '@/lib/utils/date-formatter'

interface FuelData {
  plate: string
  timestamp: string
  fuelLevel: number
  fuelPercentage: number
  engineTemperature: number
  totalFuelUsed: number
}

export default function FuelCanBusDisplay() {
  const [vehicles, setVehicles] = useState<Map<string, FuelData>>(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [connected, setConnected] = useState(false)
  const [ws, setWs] = useState<WebSocket | null>(null)

  const processVehicleData = (vehicle: any): FuelData => {
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

    return {
      plate: vehicle.plate,
      timestamp: vehicle.timestamp,
      fuelLevel: fuelLevelItem?.value || 0,
      fuelPercentage: fuelPercentItem?.value || 0,
      engineTemperature: engineTempItem?.value || 0,
      totalFuelUsed: totalFuelUsedItem?.value || 0
    }
  }

  const connectWebSocket = () => {
    const wsEndpoint = process.env.NEXT_PUBLIC_CAN_BUS_WEBSOCKET_ENDPOINT
    const key = process.env.NEXT_PUBLIC_CANBUS_KEY
    
    if (!wsEndpoint || !key) {
      setError('WebSocket endpoint not configured')
      return
    }

    setLoading(true)
    setError(null)
    
    const newWs = new WebSocket(`${wsEndpoint}?key=${key}`)
    setWs(newWs)
    
    newWs.onopen = () => {
      console.log('Connected to CAN bus WebSocket')
      setConnected(true)
      setLoading(false)
    }
    
    newWs.onmessage = (event) => {
      const message = JSON.parse(event.data)
      
      if (message.type === 'snapshot') {
        // Initial data load
        const vehicleMap = new Map()
        message.data.forEach((vehicle: any) => {
          const processedVehicle = processVehicleData(vehicle)
          vehicleMap.set(processedVehicle.plate, processedVehicle)
        })
        setVehicles(vehicleMap)
      } else if (message.type === 'update') {
        // Real-time update
        const processedVehicle = processVehicleData(message.data)
        setVehicles(prev => new Map(prev).set(processedVehicle.plate, processedVehicle))
      }
    }
    
    newWs.onerror = (error) => {
      console.error('WebSocket error:', error)
      setConnected(false)
      setError('WebSocket connection failed')
    }
    
    newWs.onclose = () => {
      console.log('WebSocket connection closed')
      setConnected(false)
    }
  }

  const fetchVehicles = () => {
    if (ws) {
      ws.close()
    }
    connectWebSocket()
  }

  useEffect(() => {
    connectWebSocket()
    
    return () => {
      if (ws) {
        ws.close()
        setConnected(false)
      }
    }
  }, [])

  // Convert CAN bus fuel data to fuel gauge format
  const getFuelGaugeData = () => {
    const gaugeData = Array.from(vehicles.values()).map((vehicle) => {
      const fuelPercentage = vehicle.fuelPercentage || 0
      const fuelLevel = vehicle.fuelLevel || 0
      const engineTemp = vehicle.engineTemperature || 0
      const isEngineOn = engineTemp > 40

      return {
        id: vehicle.plate,
        location: vehicle.plate,
        fuelLevel: Math.max(0, fuelLevel),
        temperature: Math.max(0, engineTemp),
        volume: Math.max(0, fuelLevel),

        status: isEngineOn ? 'Active' : 'Engine Off',
        lastUpdated: formatForDisplay(vehicle.timestamp),
        updated_at: vehicle.timestamp
      }
    })
    
    // Sort to move 0 fuel level vehicles to the end
    return gaugeData.sort((a, b) => {
      if (a.fuelLevel === 0 && b.fuelLevel !== 0) return 1
      if (a.fuelLevel !== 0 && b.fuelLevel === 0) return -1
      return 0
    })
  }



  if (loading) {
    return (
      <div className="flex justify-center items-center bg-gray-50 h-full">
        <div className="text-center">
          <div className="mx-auto mb-4 border-b-2 border-blue-600 rounded-full w-12 h-12 animate-spin"></div>
          <p className="text-gray-600">Loading fuel data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center bg-gray-50 h-full">
        <div className="text-center">
          <div className="mx-auto mb-4 text-red-500 text-6xl">⚠️</div>
          <p className="mb-4 text-red-600">Error loading fuel data</p>
          <p className="mb-4 text-gray-600">{error}</p>
          <Button onClick={fetchVehicles} variant="outline">
            <RefreshCw className="mr-2 w-4 h-4" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 h-full">
      <div className="p-4">

        
        {vehicles.size > 0 ? (
          <div className="gap-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 xl:grid-cols-5">
            {getFuelGaugeData().map((data) => (
              <FuelGauge
                key={data.id}
                id={data.id}
                location={data.location}
                fuelLevel={data.fuelLevel}
                temperature={data.temperature}
                volume={data.volume}

                status={data.status}
                lastUpdated={data.lastUpdated}
                updated_at={data.updated_at}

                className="hover:scale-105 transition-transform duration-200 transform"
              />
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <Fuel className="mx-auto mb-4 w-16 h-16 text-gray-400" />
              <p className="text-gray-500 text-lg">No fuel data available</p>
              <p className="text-gray-400 text-sm">Check your connection to the EPS server</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}