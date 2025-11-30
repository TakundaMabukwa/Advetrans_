'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Truck, ChevronDown, ChevronRight, Package, Calendar, Clock } from 'lucide-react'

export default function AuditPage() {
  const [drivers, setDrivers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedTrip, setExpandedTrip] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCompletedTrips() {
      try {
        const supabase = createClient()
        
        const { data: auditTrips, error } = await supabase
          .from('audit')
          .select('*')
          .in('status', ['delivered', 'completed'])
          .order('updated_at', { ascending: false })
        
        if (error) throw error
        
        const { data: driversData, error: driversError } = await supabase
          .from('drivers')
          .select('id, first_name, surname, cell_number')
        
        if (driversError) throw driversError
        
        const driversMap = new Map(driversData?.map(d => [d.id, d]) || [])
        
        const driverMap = new Map()
        
        for (const trip of auditTrips || []) {
          const assignments = trip.vehicleassignments || []
          if (assignments.length > 0) {
            const driver = assignments[0]?.drivers?.[0]
            const vehicle = assignments[0]?.vehicle
            
            if (driver?.id) {
              const driverDetails = driversMap.get(driver.id)
              if (!driverMap.has(driver.id)) {
                driverMap.set(driver.id, {
                  id: driver.id,
                  name: driver.name,
                  cell_number: driverDetails?.cell_number || '-',
                  trips: [],
                  vehicle: vehicle
                })
              }
              const stopPoints = trip.stop_points || []
              trip.orders = stopPoints.sort((a: any, b: any) => (a.sequence || 0) - (b.sequence || 0))
              driverMap.get(driver.id).trips.push(trip)
            }
          }
        }
        
        setDrivers(Array.from(driverMap.values()))
      } catch (err) {
        console.error('Error fetching completed trips:', err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchCompletedTrips()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Delivery Audit</h1>
          <p className="text-sm text-slate-600 mt-1">Completed delivery records</p>
        </div>

        <div className="space-y-4">
          {drivers.length === 0 ? (
            <Card className="p-12 text-center">
              <Truck className="w-12 h-12 mx-auto mb-4 text-slate-400" />
              <p className="text-slate-600">No completed trips</p>
            </Card>
          ) : (
            drivers.map((driver) => (
              driver.trips.map((trip: any) => {
                const orders = trip.orders || []
                const isExpanded = expandedTrip === trip.trip_id
                
                return (
                  <Card key={trip.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="bg-gradient-to-r from-slate-700 to-slate-600 px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-4 text-white">
                        <Package className="w-5 h-5" />
                        <div>
                          <div className="font-semibold">{trip.trip_id || 'N/A'}</div>
                          <div className="text-xs text-slate-200">{trip.ordernumber || '-'}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-white text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{trip.time_completed ? new Date(trip.time_completed).toLocaleDateString('en-GB') : '-'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          <span>{orders.length} customers</span>
                        </div>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-slate-100 border-b text-slate-700">
                            <th className="text-left py-2 px-3 font-semibold">Delivery</th>
                            <th className="text-left py-2 px-3 font-semibold">Ship-To</th>
                            <th className="text-left py-2 px-3 font-semibold">Name</th>
                            <th className="text-left py-2 px-3 font-semibold">Point</th>
                            <th className="text-left py-2 px-3 font-semibold">Total Wt</th>
                            <th className="text-left py-2 px-3 font-semibold">Location</th>
                            <th className="text-left py-2 px-3 font-semibold">Date</th>
                            <th className="text-left py-2 px-3 font-semibold">Net Wt</th>
                            <th className="text-left py-2 px-3 font-semibold">Trans</th>
                            <th className="text-left py-2 px-3 font-semibold">Arrival</th>
                            <th className="text-left py-2 px-3 font-semibold">Loading</th>
                            <th className="text-left py-2 px-3 font-semibold">Depart</th>
                            <th className="text-left py-2 px-3 font-semibold bg-slate-200">Transporter</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr 
                            className="border-b hover:bg-slate-50 cursor-pointer transition-colors"
                            onClick={() => setExpandedTrip(isExpanded ? null : trip.trip_id)}
                          >
                            <td className="py-2 px-3">
                              <div className="flex items-center gap-2">
                                {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-600" /> : <ChevronRight className="w-4 h-4 text-slate-600" />}
                                <span className="font-medium">{trip.ordernumber || '-'}</span>
                              </div>
                            </td>
                            <td className="py-2 px-3">
                              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-[10px] font-medium">{orders.length}</span>
                            </td>
                            <td className="py-2 px-3">-</td>
                            <td className="py-2 px-3">ZA24</td>
                            <td className="py-2 px-3 font-semibold">-</td>
                            <td className="py-2 px-3 truncate max-w-[120px]">{trip.destination || '-'}</td>
                            <td className="py-2 px-3">{trip.time_completed ? new Date(trip.time_completed).toLocaleDateString('en-GB') : '-'}</td>
                            <td className="py-2 px-3 font-semibold">-</td>
                            <td className="py-2 px-3">Dyna</td>
                            <td className="py-2 px-3">{trip.time_accepted ? new Date(trip.time_accepted).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                            <td className="py-2 px-3">{trip.time_on_trip ? new Date(trip.time_on_trip).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                            <td className="py-2 px-3">{trip.time_completed ? new Date(trip.time_completed).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                            <td rowSpan={isExpanded ? orders.length + 1 : 1} className="py-2 px-3 bg-slate-50 align-top border-l">
                              <div className="space-y-2 min-w-[160px]">
                                <div>
                                  <div className="font-semibold text-slate-600 text-[10px] uppercase tracking-wide">Driver</div>
                                  <div className="mt-0.5 text-slate-900">{driver.name}</div>
                                </div>
                                <div>
                                  <div className="font-semibold text-slate-600 text-[10px] uppercase tracking-wide">Contact</div>
                                  <div className="mt-0.5 text-slate-900">{driver.cell_number}</div>
                                </div>
                                <div>
                                  <div className="font-semibold text-slate-600 text-[10px] uppercase tracking-wide">Truck</div>
                                  <div className="mt-0.5 text-slate-900">{driver.vehicle?.name || '-'}</div>
                                </div>
                                <div>
                                  <div className="font-semibold text-slate-600 text-[10px] uppercase tracking-wide">Status</div>
                                  <div className="mt-0.5">
                                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-medium">Completed</span>
                                  </div>
                                </div>
                                <div>
                                  <div className="font-semibold text-slate-600 text-[10px] uppercase tracking-wide">Loading Date</div>
                                  <div className="mt-0.5 text-slate-900">{trip.time_accepted ? new Date(trip.time_accepted).toLocaleDateString('en-GB') : '-'}</div>
                                </div>
                              </div>
                            </td>
                          </tr>
                          {isExpanded && (
                            <>
                              {orders.map((order: any, idx: number) => (
                                <tr key={`${trip.id}-${idx}`} className="bg-blue-50 border-b">
                                  <td className="py-2 px-3 pl-8 text-slate-600">{order.sequence || idx + 1}</td>
                                  <td className="py-2 px-3">-</td>
                                  <td className="py-2 px-3">{order.customer || '-'}</td>
                                  <td className="py-2 px-3">ZA24</td>
                                  <td className="py-2 px-3">-</td>
                                  <td className="py-2 px-3 truncate max-w-[120px]">-</td>
                                  <td className="py-2 px-3">-</td>
                                  <td className="py-2 px-3">-</td>
                                  <td colSpan={4} className="py-2 px-3 text-slate-500">Stop {order.sequence || idx + 1} of {orders.length}</td>
                                </tr>
                              ))}
                            </>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                )
              })
            ))
          )}
        </div>
      </div>
    </div>
  )
}
