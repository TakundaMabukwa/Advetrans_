"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Route, MapPin, CheckCircle, Save } from 'lucide-react'
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

  const DEFAULT_LOADING_SITE = "Fuchs Lubricants, Stikland Industrial, 9 Square Street, Bellville 7530"

  useEffect(() => {
    loadVehicleData()
  }, [vehicleId])

  const loadVehicleData = async () => {
    try {
      // Fetch vehicle details
      const { data: vehicleData } = await supabase
        .from('vehiclesc')
        .select('*')
        .eq('id', vehicleId)
        .single()

      setVehicle(vehicleData)

      // Get selected date from URL or default to today
      const urlParams = new URLSearchParams(window.location.search)
      const selectedDate = urlParams.get('date') || new Date().toISOString().split('T')[0]

      // Check if this is a paired vehicle (CN30435 or Mission Trailer)
      const isPaired = vehicleData?.registration_number === 'CN30435' || vehicleData?.registration_number === 'Mission Trailer'
      let ordersData = []

      if (isPaired) {
        // For paired vehicles, fetch orders for BOTH vehicles
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
        console.log('Loaded orders for paired vehicles on', selectedDate, ':', ordersData)
      } else {
        // For non-paired vehicles, fetch only this vehicle's orders
        const { data: singleOrders } = await supabase
          .from('pending_orders')
          .select('*')
          .eq('assigned_vehicle_id', vehicleId)
          .eq('scheduled_date', selectedDate)
          .order('id')
        
        ordersData = singleOrders || []
        console.log('Loaded orders for vehicle', vehicleId, 'on', selectedDate, ':', ordersData)
      }
      
      // Sort orders by delivery sequence (optimized order from Geoapify)
      const sortedOrders = ordersData.sort((a, b) => {
        const seqA = a.delivery_sequence || 999
        const seqB = b.delivery_sequence || 999
        return seqA - seqB
      })
      setAssignedOrders(sortedOrders)
      console.log('Orders sorted by delivery sequence:', sortedOrders.map(o => `${o.delivery_sequence}: ${o.customer_name}`))
      
      // Fetch optimized route geometry
      const { data: routeData, error: routeError } = await supabase
        .from('vehicle_routes')
        .select('route_geometry, distance, duration')
        .eq('vehicle_id', vehicleId)
        .eq('scheduled_date', selectedDate)
        .single()
      
      console.log('Route query result:', { routeData, routeError, vehicleId, selectedDate })
      
      if (routeData?.route_geometry) {
        console.log('✓ Loaded optimized route geometry from database')
        console.log('Route geometry type:', Array.isArray(routeData.route_geometry) ? 'Array' : typeof routeData.route_geometry)
        console.log('Route geometry sample:', JSON.stringify(routeData.route_geometry).substring(0, 200))
        setRouteGeometry(routeData.route_geometry)
      } else {
        console.log('✗ No route geometry found in database')
      }

      // Fetch unassigned orders
      const { data: unassignedData } = await supabase
        .from('pending_orders')
        .select('*')
        .eq('status', 'unassigned')

      setUnassignedOrders(unassignedData || [])
    } catch (error) {
      console.error('Error loading vehicle data:', error)
      toast.error('Failed to load vehicle data')
    } finally {
      setLoading(false)
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

  const handleSaveChanges = async () => {
    setIsSaving(true)
    try {
      const urlParams = new URLSearchParams(window.location.search)
      const selectedDate = urlParams.get('date') || new Date().toISOString().split('T')[0]

      // Re-optimize route with Geoapify
      const { orders: optimizedOrders, distance, duration, geometry } = await reoptimizeVehicleRoute(assignedOrders)

      // Update assigned orders with new sequence
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

      // Update unassigned orders - clear ALL their assignments
      for (const order of unassignedOrders) {
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

      // Replace route geometry in database
      if (geometry && optimizedOrders.length > 0) {
        await supabase
          .from('vehicle_routes')
          .upsert({
            vehicle_id: vehicleId,
            scheduled_date: selectedDate,
            route_geometry: geometry,
            distance,
            duration,
            updated_at: new Date().toISOString()
          }, { onConflict: 'vehicle_id,scheduled_date' })
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

        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Vehicle</p>
              <p className="font-semibold">{vehicle.registration_number}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Utilization</p>
              <p className="font-semibold">{utilization.toFixed(0)}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Loaded Weight</p>
              <p className="font-semibold">{Math.round(totalWeight)}kg / {capacity}kg</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Delivery Stops</p>
              <p className="font-semibold">{assignedOrders.length}</p>
            </CardContent>
          </Card>
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
                geometry={Array.isArray(routeGeometry) && routeGeometry.length > 0 && Array.isArray(routeGeometry[0]) && typeof routeGeometry[0][0] === 'number' 
                  ? { type: 'LineString', coordinates: routeGeometry } 
                  : routeGeometry}
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
                    draggable
                    onDragStart={(e) => handleDragStart(e, order, 'assigned')}
                    className="group relative bg-white border border-slate-200 rounded-lg hover:shadow-md hover:border-slate-300 transition-all cursor-move"
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
                        </div>
                        <p className="text-xs text-slate-500 truncate">{order.location}</p>
                      </div>
                      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex flex-col gap-0.5">
                          <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                          <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                          <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                        </div>
                      </div>
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
