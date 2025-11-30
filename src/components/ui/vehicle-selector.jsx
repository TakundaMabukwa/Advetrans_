'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, Truck, AlertTriangle } from 'lucide-react'

export default function VehicleSelector({ targetLocation, onVehicleSelect }) {
  const [loading, setLoading] = useState(false)
  const [vehicle, setVehicle] = useState(null)

  const findOptimalVehicle = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/route-optimization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetLocation })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setVehicle(data.vehicle)
        onVehicleSelect?.(data.vehicle)
      }
    } catch (error) {
      console.error('Error finding vehicle:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Button onClick={findOptimalVehicle} disabled={loading}>
        {loading ? 'Finding...' : 'Find Closest Vehicle'}
      </Button>
      
      {vehicle && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              {vehicle.plate}
              {vehicle.passesHighRisk && (
                <Badge variant="destructive" className="ml-2">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Avoids Risk Areas
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Driver:</strong> {vehicle.driver_name}</p>
              <p><strong>Distance:</strong> {vehicle.distance?.toFixed(2)} km</p>
              <p><strong>Location:</strong> {vehicle.address}</p>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="text-sm text-muted-foreground">
                  {vehicle.latitude}, {vehicle.longitude}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}