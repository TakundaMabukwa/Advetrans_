"use client"

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Route, MapPin, CheckCircle } from 'lucide-react'
import { RoutePreviewMap } from '@/components/ui/route-preview-map'

function RoutePlanningContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [vehicleData, setVehicleData] = useState<any>(null)
  const [assignedOrders, setAssignedOrders] = useState<any[]>([])
  const [unassignedOrders, setUnassignedOrders] = useState<any[]>([])
  const [draggedItem, setDraggedItem] = useState<any>(null)

  useEffect(() => {
    const data = searchParams.get('data')
    if (data) {
      try {
        const parsed = JSON.parse(decodeURIComponent(data))
        setVehicleData(parsed)
        setAssignedOrders(parsed.assignedOrders || [])
        setUnassignedOrders(parsed.unassignedOrders || [])
      } catch (error) {
        console.error('Error parsing vehicle data:', error)
      }
    }
  }, [searchParams])

  const handleDragStart = (e: React.DragEvent, order: any, source: 'assigned' | 'unassigned') => {
    setDraggedItem({ order, source })
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDropToAssigned = (e: React.DragEvent) => {
    e.preventDefault()
    if (!draggedItem) return

    if (draggedItem.source === 'unassigned') {
      setUnassignedOrders(prev => prev.filter(o => o.id !== draggedItem.order.id))
      setAssignedOrders(prev => [...prev, draggedItem.order])
    }
    setDraggedItem(null)
  }

  const handleDropToUnassigned = (e: React.DragEvent) => {
    e.preventDefault()
    if (!draggedItem) return

    if (draggedItem.source === 'assigned') {
      setAssignedOrders(prev => prev.filter(o => o.id !== draggedItem.order.id))
      setUnassignedOrders(prev => [...prev, draggedItem.order])
    }
    setDraggedItem(null)
  }

  if (!vehicleData) {
    return <div className="p-6">Loading...</div>
  }

  const DEFAULT_LOADING_SITE = "Fuchs Lubricants, Stikland Industrial, 9 Square Street, Bellville 7530"

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">
            {vehicleData.vehicle.registration_number} - Route Planning
          </h1>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Destination</p>
              <p className="font-semibold">{vehicleData.destinationGroup || 'N/A'}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Utilization</p>
              <p className="font-semibold">{vehicleData.utilization.toFixed(0)}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Loaded Weight</p>
              <p className="font-semibold">{vehicleData.totalWeight}kg / {vehicleData.capacity}kg</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Delivery Stops</p>
              <p className="font-semibold">{assignedOrders.length}</p>
            </CardContent>
          </Card>
        </div>

        {assignedOrders.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Route className="h-5 w-5" />
                Optimized Delivery Route
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RoutePreviewMap
                origin={DEFAULT_LOADING_SITE}
                destination={assignedOrders[assignedOrders.length - 1]?.location || ''}
                routeData={vehicleData.optimizedRoute || null}
                stopPoints={assignedOrders.map(order => ({
                  id: `${order.customerName}-${order.latitude}`,
                  name: order.customerName || order.customer_name,
                  coordinates: [[order.longitude, order.latitude]]
                }))}
                getStopPointsData={() => Promise.resolve(assignedOrders.map(order => ({
                  id: `${order.customerName}-${order.latitude}`,
                  name: order.customerName || order.customer_name,
                  coordinates: [[order.longitude, order.latitude]]
                })))}
                preserveOrder={!!vehicleData.optimizedRoute}
                showOptimization={!vehicleData.optimizedRoute}
              />
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Loaded Orders ({assignedOrders.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="space-y-2 min-h-[400px] p-3 border-2 border-dashed border-green-200 rounded-lg bg-green-50/30"
                onDragOver={handleDragOver}
                onDrop={handleDropToAssigned}
              >
                {assignedOrders.map((order, idx) => (
                  <div
                    key={order.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, order, 'assigned')}
                    className="p-3 border rounded bg-green-100 border-green-300 cursor-move hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {idx + 1}
                          </span>
                          <p className="font-medium text-sm">{order.customerName || order.customer_name}</p>
                        </div>
                        <p className="text-xs text-gray-600 ml-7">Trip: {order.tripId || order.trip_id}</p>
                        <p className="text-xs text-gray-600 ml-7 truncate">{order.location}</p>
                      </div>
                      <div className="text-right ml-2">
                        <p className="text-sm font-semibold">{Math.round(order.totalWeight || order.total_weight)}kg</p>
                        {order.drums > 0 && <p className="text-xs text-gray-600">{order.drums} drums</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                Unassigned Orders ({unassignedOrders.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="space-y-2 min-h-[400px] p-3 border-2 border-dashed border-blue-200 rounded-lg bg-blue-50/30"
                onDragOver={handleDragOver}
                onDrop={handleDropToUnassigned}
              >
                {unassignedOrders.map((order) => (
                  <div
                    key={order.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, order, 'unassigned')}
                    className="p-3 border rounded bg-blue-100 border-blue-300 cursor-move hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{order.customerName || order.customer_name}</p>
                        <p className="text-xs text-gray-600">Trip: {order.tripId || order.trip_id}</p>
                        <p className="text-xs text-gray-600 truncate">{order.location}</p>
                      </div>
                      <div className="text-right ml-2">
                        <p className="text-sm font-semibold">{Math.round(order.totalWeight || order.total_weight)}kg</p>
                        {order.drums > 0 && <p className="text-xs text-gray-600">{order.drums} drums</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Route className="h-4 w-4 text-purple-600" />
                Route Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Stops:</span>
                    <span className="font-medium">{assignedOrders.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Weight:</span>
                    <span className="font-medium">{Math.round(vehicleData.totalWeight)}kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Vehicle Utilization:</span>
                    <span className={`font-medium ${
                      vehicleData.utilization > 90 ? 'text-red-600' :
                      vehicleData.utilization > 75 ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {vehicleData.utilization.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button className="bg-green-600 hover:bg-green-700">
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function RoutePlanningPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <RoutePlanningContent />
    </Suspense>
  )
}
