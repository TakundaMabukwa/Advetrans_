'use client'

import { useState } from 'react'
import DriverCardWithMap from '@/components/ui/driver-card-with-map'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, MapPin, Route, Activity } from 'lucide-react'

// Example driver data - replace with your actual data
const exampleDrivers = [
  {
    id: '1',
    driver_name: 'John Smith',
    plate: 'ABC123GP',
    safety_score: 0.85,
    efficiency: 0.78,
    total_points: 92,
    reward_level: 'Gold',
    speed_compliance: true,
    route_compliance: true,
    time_compliance: false,
    latest_mileage: '1,250',
    currentLocation: {
      lat: -26.2041,
      lng: 28.0473
    }
  },
  {
    id: '2',
    driver_name: 'Sarah Johnson',
    plate: 'XYZ789GP',
    safety_score: 0.92,
    efficiency: 0.88,
    total_points: 96,
    reward_level: 'Platinum',
    speed_compliance: true,
    route_compliance: true,
    time_compliance: true,
    latest_mileage: '2,100',
    currentLocation: {
      lat: -26.1500,
      lng: 28.1000
    }
  },
  {
    id: '3',
    driver_name: 'Mike Wilson',
    plate: 'DEF456GP',
    safety_score: 0.65,
    efficiency: 0.58,
    total_points: 68,
    reward_level: 'Bronze',
    speed_compliance: false,
    route_compliance: true,
    time_compliance: false,
    latest_mileage: '890',
    currentLocation: {
      lat: -26.2500,
      lng: 28.0200
    }
  },
  {
    id: '4',
    firstName: 'Lisa',
    surname: 'Brown',
    plate: 'GHI321GP',
    licenseCode: 'C1',
    licenseExpires: 'in 2 years',
    demeritPoints: 0,
    currentLocation: {
      lat: -26.1800,
      lng: 28.0800
    }
  }
]

export default function DriverCardsWithMapExample() {
  const [viewMode, setViewMode] = useState<'performance' | 'basic'>('performance')

  const handleViewDriver = (driver: any) => {
    console.log('View driver:', driver)
    // Implement your view logic here
  }

  const handleEditDriver = (driver: any) => {
    console.log('Edit driver:', driver)
    // Implement your edit logic here
  }

  const handleDeleteDriver = (driver: any) => {
    console.log('Delete driver:', driver)
    // Implement your delete logic here
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <CardTitle>Driver Cards with Map Integration</CardTitle>
                <p className="text-sm text-gray-600">
                  Click the "Map" button on any driver card to view their location and trip route
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'performance' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('performance')}
              >
                <Activity className="w-4 h-4 mr-2" />
                Performance View
              </Button>
              <Button
                variant={viewMode === 'basic' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('basic')}
              >
                <Users className="w-4 h-4 mr-2" />
                Basic View
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Driver Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {exampleDrivers.map((driver) => (
          <DriverCardWithMap
            key={driver.id}
            driver={driver}
            onView={handleViewDriver}
            onEdit={handleEditDriver}
            onDelete={handleDeleteDriver}
            showPerformanceMetrics={viewMode === 'performance'}
          />
        ))}
      </div>
    </div>
  )
}