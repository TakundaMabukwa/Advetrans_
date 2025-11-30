"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Route, MapPin, CheckCircle, Save, Truck, Gauge, Weight, Navigation, Clock, User } from 'lucide-react'
import { VehicleRouteMap } from '@/components/ui/vehicle-route-map'
import { toast } from 'sonner'
import { reoptimizeVehicleRoute } from '@/lib/reoptimize-vehicle-route'

export default function VehicleRoutePlanningPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const vehicleId = params.id

  const [vehicle, setVehicle] = useState<any>(null)
  const [assignedOrders, setAssignedOrders] = useState<any[]>([])
  const [unassignedOrders, setUnassignedOrders] = useState<any[]>([])
  const [draggedItem, setDraggedItem] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [routeGeometry, setRouteGeometry] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [drivers, setDrivers] = useState<any[]>([])
  const [selectedDriver, setSelectedDriver] = useState<string>('')
  const [routeDistance, setRouteDistance] = useState<number | null>(null)
  const [routeDuration, setRouteDuration] = useState<number | null>(null)
  const [assignedDriverName, setAssignedDriverName] = useState<string | null>(null)

  const DEFAULT_LOADING_SITE = "Fuchs Lubricants, Stikland Industrial, 9 Square Street, Bellville 7530"

  useEffect(() => {
    loadVehicleData()
  }, [vehicleId])

  const loadVehicleData = async () => {
    try {
      const { data: vehicleData } = await supabase
        .from('vehiclesc')
        .select('*')
        .eq('id', vehicleId)
        .single()

      setVehicle(vehicleData)

      const urlParams = new URLSearchParams(window.location.search)
      const selectedDate = urlParams.get('date') || new Date().toISOString().split('T')[0]

      const isPaired = vehicleData?.registration_number === 'CN30435' || vehicleData?.registration_number === 'Mission Trailer'
      let ordersData = []

      if (isPaired) {
        const { data: allVehicles } = await supabase
          .from('vehiclesc')
          .select('id')
          .in('registration_number', ['CN30435', 'Mission Trailer'])
        
        const pairedVehicleIds = allVehicles?.map(v => v.id) || []
        
        const { data: pairedOrders } = await supabase
          .from('pending_orders')
          .select('*')
          .in('assigned_vehicle_id', pairedVehicleIds)
          .eq('scheduled_date', selectedDate)
          .order('id')
        
        ordersData = pairedOrders || []
      } else {
        const { data: singleOrders } = await supabase
          .from('pending_orders')
          .select('*')
          .eq('assigned_vehicle_id', vehicleId)
          .eq('scheduled_date', selectedDate)
          .order('id')
        
        ordersData = singleOrders || []
      }
      
      const sortedOrders = ordersData.sort((a, b) => {
        const seqA = a.delivery_sequence || 999
        const seqB = b.delivery_sequence || 999
        return seqA - seqB
      })
      setAssignedOrders(sortedOrders)
      
      // Optimize route based on customer stops
      if (sortedOrders.length > 0 && sortedOrders.every(o => o.latitude && o.longitude)) {
        console.log('Optimizing route for orders:', sortedOrders.length)
        const { orders: optimizedOrders, distance, duration, geometry } = await reoptimizeVehicleRoute(sortedOrders)
        console.log('Route optimized:', { distance, duration, hasGeometry: !!geometry })
        setAssignedOrders(optimizedOrders)
        setRouteGeometry(geometry)
        setRouteDistance(Math.round(distance / 1000))
        setRouteDuration(duration)
      }

      const { data: unassignedData } = await supabase
        .from('pending_orders')
        .select('*')
        .eq('status', 'unassigned')

      setUnassignedOrders(unassignedData || [])

      const { data: driversData } = await supabase
        .from('drivers')
        .select('id, first_name, surname, available')
        .order('first_name')
      
      setDrivers(driversData || [])

      // Check if orders already have an assigned driver
      if (sortedOrders.length > 0 && sortedOrders[0].assigned_driver_id) {
        const driverId = sortedOrders[0].assigned_driver_id
        const driver = driversData?.find(d => d.id === driverId)
        if (driver) {
          setAssignedDriverName(`${driver.first_name} ${driver.surname}`)
        }
      }
    } catch (error) {
      console.error('Error loading vehicle data:', error)
      toast.error('Failed to load vehicle data')
    } finally {
      setLoading(false)
    }
  }

  const handleAssignDriver = async () => {
    if (!selectedDriver) {
      toast.error('Please select a driver')
      return
    }

    try {
      for (const order of assignedOrders) {
        await supabase
          .from('pending_orders')
          .update({ assigned_driver_id: selectedDriver })
          .eq('id', order.id)
      }

      await supabase
        .from('drivers')
        .update({ available: false })
        .eq('id', selectedDriver)

      const driverName = drivers.find(d => d.id === selectedDriver)
      toast.success(`Driver ${driverName?.first_name} ${driverName?.surname} assigned to ${assignedOrders.length} orders`)
      setSelectedDriver('')
      await loadVehicleData()
    } catch (error) {
      console.error('Error assigning driver:', error)
      toast.error('Failed to assign driver')
    }
  }

  const handleDragStart = (e: React.DragEvent, order: any, source: 'assigned' | 'unassigned') => {
    setDraggedItem({ order, source })
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDropToAssigned = async (e: React.DragEvent) => {
    e.preventDefault()
    if (!draggedItem) return

    if (draggedItem.source === 'unassigned') {
      const newAssigned = [...assignedOrders, draggedItem.order]
      setUnassignedOrders(prev => prev.filter(o => o.id !== draggedItem.order.id))
      setAssignedOrders(newAssigned)
      
      if (newAssigned.every(o => o.latitude && o.longitude)) {
        const { orders, distance, duration, geometry } = await reoptimizeVehicleRoute(newAssigned)
        setAssignedOrders(orders)
        setRouteGeometry(geometry)
        setRouteDistance(Math.round(distance / 1000))
        setRouteDuration(duration)
      }
    }
    setDraggedItem(null)
  }

  const handleDropToUnassigned = async (e: React.DragEvent) => {
    e.preventDefault()
    if (!draggedItem) return

    if (draggedItem.source === 'assigned') {
      // Check if order is on a trip
      if (draggedItem.order.status === 'in-trip') {
        toast.error('Cannot unassign orders that are on a trip. Complete or cancel the trip first.')
        setDraggedItem(null)
        return
      }

      const newAssigned = assignedOrders.filter(o => o.id !== draggedItem.order.id)
      setAssignedOrders(newAssigned)
      setUnassignedOrders(prev => [...prev, draggedItem.order])
      
      if (newAssigned.length > 0 && newAssigned.every(o => o.latitude && o.longitude)) {
        const { orders, distance, duration, geometry } = await reoptimizeVehicleRoute(newAssigned)
        setAssignedOrders(orders)
        setRouteGeometry(geometry)
        setRouteDistance(Math.round(distance / 1000))
        setRouteDuration(duration)
      } else {
        setRouteGeometry(null)
        setRouteDistance(null)
        setRouteDuration(null)
      }
    }
    setDraggedItem(null)
  }

  const handleSaveChanges = async () => {
    setIsSaving(true)
    try {
      const urlParams = new URLSearchParams(window.location.search)
      const selectedDate = urlParams.get('date') || new Date().toISOString().split('T')[0]

      const { orders: optimizedOrders, distance, duration, geometry } = await reoptimizeVehicleRoute(assignedOrders)

      for (let idx = 0; idx < optimizedOrders.length; idx++) {
        await supabase
          .from('pending_orders')
          .update({ 
            assigned_vehicle_id: vehicleId,
            status: 'assigned',
            delivery_sequence: idx + 1,
            scheduled_date: selectedDate
          })
          .eq('id', optimizedOrders[idx].id)
      }

      // Only unassign orders that are NOT on a trip
      const ordersToUnassign = unassignedOrders.filter(o => o.status !== 'in-trip')
      const ordersOnTrip = unassignedOrders.filter(o => o.status === 'in-trip')
      
      if (ordersOnTrip.length > 0) {
        toast.error(`${ordersOnTrip.length} order(s) cannot be unassigned - they are on a trip`)
      }

      for (const order of ordersToUnassign) {
        await supabase
          .from('pending_orders')
          .update({ 
            assigned_vehicle_id: null,
            status: 'unassigned',
            delivery_sequence: null,
            scheduled_date: null
          })
          .eq('id', order.id)
      }

      await supabase
        .from('vehicle_routes')
        .delete()
        .eq('vehicle_id', vehicleId)
        .eq('scheduled_date', selectedDate)

      if (geometry && optimizedOrders.length > 0) {
        await supabase
          .from('vehicle_routes')
          .insert({
            vehicle_id: vehicleId,
            scheduled_date: selectedDate,
            route_geometry: geometry,
            distance,
            duration,
            updated_at: new Date().toISOString()
          })
      }

      toast.success('Route optimized and saved successfully')
      await new Promise(resolve => setTimeout(resolve, 500))
      window.location.reload()
    } catch (error) {
      console.error('Error saving changes:', error)
      toast.error('Failed to save changes')
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  if (!vehicle) {
    return <div className="p-6">Vehicle not found</div>
  }

  const totalWeight = assignedOrders.reduce((sum, o) => sum + (o.total_weight || 0), 0)
  const capacity = parseInt(vehicle.load_capacity) || 0
  const utilization = capacity > 0 ? (totalWeight / capacity) * 100 : 0

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.push('/load-plan')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Load Plan
            </Button>
            <h1 className="text-2xl font-bold">
              {vehicle.registration_number} - Route Planning
            </h1>
          </div>
          <Button onClick={handleSaveChanges} disabled={isSaving} className="bg-green-600 hover:bg-green-700">
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Optimizing & Saving...' : 'Save Changes'}
          </Button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Truck className="h-5 w-5 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-500 mb-0.5">Vehicle</p>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-semibold text-slate-900 truncate">{vehicle.registration_number}</p>
                  {assignedOrders.some(o => o.status === 'in-trip') && (
                    <span className="px-2 py-0.5 bg-blue-600 text-white rounded text-xs font-bold whitespace-nowrap">
                      ON TRIP
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                <Gauge className="h-5 w-5 text-purple-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-500 mb-0.5">Utilization</p>
                <p className="text-lg font-semibold text-slate-900">{utilization.toFixed(0)}%</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                <Weight className="h-5 w-5 text-orange-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-500 mb-0.5">Weight</p>
                <p className="text-lg font-semibold text-slate-900">{Math.round(totalWeight)}<span className="text-sm text-slate-400">/{capacity}kg</span></p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <MapPin className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-500 mb-0.5">Stops</p>
                <p className="text-lg font-semibold text-slate-900">{assignedOrders.length}</p>
              </div>
            </div>

            {routeDistance ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-50 flex items-center justify-center flex-shrink-0">
                  <Navigation className="h-5 w-5 text-cyan-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500 mb-0.5">Distance</p>
                  <p className="text-lg font-semibold text-slate-900">{routeDistance} km</p>
                </div>
              </div>
            ) : null}

            {routeDuration ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-pink-50 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-5 w-5 text-pink-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500 mb-0.5">Duration</p>
                  <p className="text-lg font-semibold text-slate-900">{Math.floor(routeDuration / 60)}h {routeDuration % 60}m</p>
                </div>
              </div>
            ) : null}

            <div className="flex items-center gap-3 col-span-2 md:col-span-1">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                <User className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="min-w-0 flex-1">
                {assignedDriverName ? (
                  <>
                    <p className="text-xs text-slate-500 mb-0.5">Driver</p>
                    <p className="text-lg font-semibold text-slate-900 truncate">{assignedDriverName}</p>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-slate-500 mb-1">Assign Driver</p>
                    <div className="flex gap-2">
                      <select
                        value={selectedDriver}
                        onChange={(e) => setSelectedDriver(e.target.value)}
                        className="flex-1 px-2 py-1.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="">Select...</option>
                        {drivers.map(driver => (
                          <option key={driver.id} value={driver.id}>
                            {driver.first_name} {driver.surname}
                          </option>
                        ))}
                      </select>
                      <Button
                        onClick={handleAssignDriver}
                        disabled={!selectedDriver || assignedOrders.length === 0}
                        size="sm"
                        className="h-8 px-3 text-xs bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-slate-300"
                      >
                        Assign
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {assignedOrders.length > 0 && assignedOrders.every(o => o.latitude && o.longitude) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Route className="h-5 w-5" />
                {routeGeometry ? 'Optimized Delivery Route (Geoapify Truck Mode)' : 'Delivery Route'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <VehicleRouteMap
                geometry={routeGeometry && Array.isArray(routeGeometry) ? { type: 'LineString', coordinates: routeGeometry } : null}
                stops={assignedOrders
                  .filter(o => o.latitude && o.longitude)
                  .sort((a, b) => (a.delivery_sequence || 999) - (b.delivery_sequence || 999))
                  .map(o => ({
                    name: o.customer_name,
                    lat: o.latitude,
                    lng: o.longitude
                  }))}
                vehicleName={vehicle.registration_number}
                depot={{ lat: -33.9249, lng: 18.6369 }}
              />
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                  </div>
                  Loaded Orders
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">{assignedOrders.length}</span>
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div 
                className="space-y-1.5 min-h-[500px] max-h-[600px] overflow-y-auto pr-2 custom-scrollbar"
                onDragOver={handleDragOver}
                onDrop={handleDropToAssigned}
              >
                {assignedOrders.map((order, idx) => (
                  <div
                    key={order.id}
                    draggable={order.status !== 'in-trip'}
                    onDragStart={(e) => {
                      if (order.status === 'in-trip') {
                        e.preventDefault()
                        toast.error('Cannot unassign orders that are on a trip')
                        return
                      }
                      handleDragStart(e, order, 'assigned')
                    }}
                    className={`group relative bg-white border rounded-lg transition-all ${
                      order.status === 'in-trip' 
                        ? 'border-blue-300 bg-blue-50 cursor-not-allowed' 
                        : 'border-slate-200 hover:shadow-md hover:border-slate-300 cursor-move'
                    }`}
                  >
                    <div className="flex items-center gap-3 p-3">
                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-semibold text-sm text-slate-800 truncate">{order.customer_name}</p>
                          <span className="flex-shrink-0 px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-medium">
                            {Math.round(order.total_weight)}kg
                          </span>
                          {order.status === 'in-trip' && (
                            <span className="flex-shrink-0 px-1.5 py-0.5 bg-blue-600 text-white rounded text-xs font-bold">
                              ON TRIP
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 truncate">{order.location}</p>
                      </div>
                      {order.status !== 'in-trip' && (
                        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex flex-col gap-0.5">
                            <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                            <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                            <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {assignedOrders.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full py-20 text-center">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                      <CheckCircle className="h-8 w-8 text-emerald-500" />
                    </div>
                    <p className="text-sm text-slate-500 font-medium">No orders loaded</p>
                    <p className="text-xs text-slate-400 mt-1">Drag orders from available to assign</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-slate-600" />
                  </div>
                  Available Orders
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">{unassignedOrders.length}</span>
                </CardTitle>
                <span className="text-xs text-slate-500">Drop here to unassign</span>
              </div>
            </CardHeader>
            <CardContent>
              <div 
                className="min-h-[500px] max-h-[600px] overflow-y-auto p-4 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50/50 transition-colors hover:border-slate-400 hover:bg-slate-100/50 custom-scrollbar"
                onDragOver={handleDragOver}
                onDrop={handleDropToUnassigned}
              >
                {unassignedOrders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center mb-4">
                      <MapPin className="h-8 w-8 text-slate-400" />
                    </div>
                    <p className="text-sm text-slate-500 font-medium">No unassigned orders</p>
                    <p className="text-xs text-slate-400 mt-1">Drag orders here to remove from route</p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {unassignedOrders.map((order) => (
                      <div
                        key={order.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, order, 'unassigned')}
                        className="bg-white border border-slate-200 rounded-lg p-3 hover:shadow-sm hover:border-slate-300 transition-all cursor-move"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-slate-800 truncate">{order.customer_name}</p>
                            <p className="text-xs text-slate-500 truncate">{order.location}</p>
                          </div>
                          <span className="flex-shrink-0 ml-3 px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-medium">
                            {Math.round(order.total_weight)}kg
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
