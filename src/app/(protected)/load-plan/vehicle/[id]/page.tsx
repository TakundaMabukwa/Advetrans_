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
      // Check capacity before adding
      const orderWeight = draggedItem.order.total_weight || 0
      const currentWeight = assignedOrders.reduce((sum, o) => sum + (o.total_weight || 0), 0)
      const remainingCapacity = capacity - currentWeight
      
      if (orderWeight > remainingCapacity) {
        toast.error(`Cannot add order: ${Math.round(orderWeight)}kg exceeds remaining capacity of ${Math.round(remainingCapacity)}kg`)
        setDraggedItem(null)
        return
      }
      
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

        <div className="space-y-4">
          <div className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-lg px-5 py-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                  <Truck className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-white">{vehicle.registration_number}</h2>
                    {assignedOrders.some(o => o.status === 'in-trip') && (
                      <span className="px-2.5 py-0.5 bg-blue-500 text-white rounded-md text-xs font-semibold shadow-sm">
                        ON TRIP
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">{vehicle.description || 'Route Planning'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative min-w-[200px]">
                  <select
                    value={selectedDriver}
                    onChange={(e) => setSelectedDriver(e.target.value)}
                    className="w-full pl-9 pr-8 py-2.5 text-sm font-semibold border-2 border-white/30 rounded-lg bg-white/15 backdrop-blur-sm appearance-none cursor-pointer transition-all hover:bg-white/25 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-white/40 text-white"
                  >
                    <option value="" className="text-slate-900 bg-white">{assignedDriverName || 'Select driver...'}</option>
                    {drivers.map(driver => (
                      <option key={driver.id} value={driver.id} className="text-slate-900 bg-white">
                        {driver.first_name} {driver.surname}
                      </option>
                    ))}
                  </select>
                  <User className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/80 pointer-events-none" />
                  <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/80 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <Button
                  onClick={handleAssignDriver}
                  disabled={!selectedDriver || assignedOrders.length === 0}
                  className="h-[42px] px-5 text-sm font-bold bg-white hover:bg-slate-50 disabled:bg-white/40 disabled:cursor-not-allowed transition-colors shadow-md"
                  style={{ color: selectedDriver && assignedOrders.length > 0 ? '#0f172a' : '#64748b' }}
                >
                  {assignedDriverName ? 'Change' : 'Assign'}
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm">
                  <Gauge className="h-5 w-5 text-white" />
                </div>
                <p className="text-xs font-semibold text-slate-600">Utilization</p>
              </div>
              <p className="text-2xl font-bold text-slate-900 ml-11">{utilization.toFixed(0)}%</p>
            </div>

            <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-sm">
                  <Weight className="h-5 w-5 text-white" />
                </div>
                <p className="text-xs font-semibold text-slate-600">Weight</p>
              </div>
              <p className="text-2xl font-bold text-slate-900 ml-11">{Math.round(totalWeight)}<span className="text-sm text-slate-500 font-normal">/{capacity}kg</span></p>
            </div>

            <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-sm">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <p className="text-xs font-semibold text-slate-600">Stops</p>
              </div>
              <p className="text-2xl font-bold text-slate-900 ml-11">{assignedOrders.length}</p>
            </div>

            {routeDistance ? (
              <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-sm">
                    <Navigation className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-xs font-semibold text-slate-600">Distance</p>
                </div>
                <p className="text-2xl font-bold text-slate-900 ml-11">{routeDistance}<span className="text-sm text-slate-500 font-normal">km</span></p>
              </div>
            ) : null}

            {routeDuration ? (
              <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-sm">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-xs font-semibold text-slate-600">Duration</p>
                </div>
                <p className="text-2xl font-bold text-slate-900 ml-11">{Math.floor(routeDuration / 60)}h {routeDuration % 60}m</p>
              </div>
            ) : null}
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
              <div className="flex items-center justify-between mb-3">
                <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                  </div>
                  Loaded Orders
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">{assignedOrders.length}</span>
                </CardTitle>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">{Math.round(totalWeight)}kg / {capacity}kg</span>
                  <span className={`font-semibold ${
                    utilization > 95 ? 'text-red-600' :
                    utilization > 85 ? 'text-amber-600' :
                    'text-emerald-600'
                  }`}>{utilization.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      utilization > 95 ? 'bg-red-500' :
                      utilization > 85 ? 'bg-amber-500' :
                      'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(utilization, 100)}%` }}
                  ></div>
                </div>
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
