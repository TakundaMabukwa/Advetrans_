'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { calculateTollCosts } from '@/lib/toll-calculator'

export default function VehicleTollCalculator({ routeCoordinates }) {
  const [vehicleType, setVehicleType] = useState('truck')
  const [tollData, setTollData] = useState(null)

  useEffect(() => {
    if (routeCoordinates?.length > 0) {
      calculateTollCosts(routeCoordinates, vehicleType).then(setTollData)
    }
  }, [routeCoordinates, vehicleType])

  const vehicleOptions = [
    { value: 'bakkie', label: 'Bakkie (Class 1)' },
    { value: 'truck', label: 'Truck (Class 2)' },
    { value: 'articulated truck', label: 'Articulated Truck (Class 3)' },
    { value: 'super link', label: 'Super Link (Class 4)' }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Toll Cost Calculator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Vehicle Type</label>
          <Select value={vehicleType} onValueChange={setVehicleType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {vehicleOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {tollData && (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Toll Gates:</span>
              <Badge>{tollData.count}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Total Cost (incl VAT):</span>
              <span className="font-bold">R{tollData.totalCost}</span>
            </div>
            <div className="flex justify-between">
              <span>Additional Time:</span>
              <span>{tollData.totalTime} minutes</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}