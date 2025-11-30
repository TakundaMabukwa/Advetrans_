"use client"

import React, { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { User, Truck } from "lucide-react"


export default function FinancialsPanel() {
  const [drivers, setDrivers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedDriver, setExpandedDriver] = useState<number | null>(null)

  useEffect(() => {
    async function fetchDriverLoads() {
      try {
        const supabase = createClient()
        
        // Fetch all drivers
        const { data: driversData, error: driversError } = await supabase
          .from('drivers')
          .select('*')
          .order('surname')
        
        if (driversError) throw driversError
        
        // Fetch pending orders with driver assignments
        const { data: ordersData, error: ordersError } = await supabase
          .from('pending_orders')
          .select('*, drivers(*), vehiclesc(*)')
          .not('assigned_driver_id', 'is', null)
        
        if (ordersError) throw ordersError
        
        // Group orders by driver
        const driversWithLoads = (driversData || []).map(driver => {
          const driverOrders = (ordersData || []).filter(
            order => order.assigned_driver_id === driver.id
          )
          return {
            ...driver,
            loads: driverOrders
          }
        }).filter(driver => driver.loads.length > 0)
        
        setDrivers(driversWithLoads)
      } catch (err) {
        console.error('Error fetching driver loads:', err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchDriverLoads()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-4">
      {drivers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <Truck className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No driver loads found</p>
          </CardContent>
        </Card>
      ) : (
        drivers.map((driver) => (
          <Card key={driver.id} className="overflow-hidden">
            <button
              onClick={() => setExpandedDriver(expandedDriver === driver.id ? null : driver.id)}
              className="w-full px-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                  <User className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-lg text-gray-900">
                    {driver.first_name} {driver.surname}
                  </h3>
                  <p className="text-sm text-gray-600">{driver.cell_number || driver.phone_number}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-600">Total Loads</div>
                  <div className="text-2xl font-bold text-blue-600">{driver.loads.length}</div>
                </div>
                <svg
                  className={cn(
                    "w-5 h-5 transition-transform duration-200",
                    expandedDriver === driver.id ? "rotate-180" : ""
                  )}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>
            
            {expandedDriver === driver.id && (
              <div className="border-t">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead className="font-semibold">Ship-To Party</TableHead>
                        <TableHead className="font-semibold">Name</TableHead>
                        <TableHead className="font-semibold">Ship Point</TableHead>
                        <TableHead className="font-semibold">Total Weight</TableHead>
                        <TableHead className="font-semibold">Location</TableHead>
                        <TableHead className="font-semibold">Delivery Date</TableHead>
                        <TableHead className="font-semibold">Net Weight</TableHead>
                        <TableHead className="font-semibold">Transporter</TableHead>
                        <TableHead className="font-semibold">Trip No</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {driver.loads.map((load: any, index: number) => (
                        <TableRow key={load.id} className="hover:bg-slate-50">
                          <TableCell className="font-medium">{load.customer_id || '-'}</TableCell>
                          <TableCell>{load.customer_name}</TableCell>
                          <TableCell>{load.shipping_point || 'ZA24'}</TableCell>
                          <TableCell>{load.total_weight || '-'}</TableCell>
                          <TableCell>{load.location || '-'}</TableCell>
                          <TableCell>{load.delivery_date || '-'}</TableCell>
                          <TableCell>{load.net_weight || '-'}</TableCell>
                          <TableCell>Dyna</TableCell>
                          <TableCell>{index + 1}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-blue-50 font-semibold">
                        <TableCell colSpan={3} className="text-right">Total:</TableCell>
                        <TableCell>
                          {driver.loads.reduce((sum: number, load: any) => sum + (parseFloat(load.total_weight) || 0), 0).toFixed(3)}
                        </TableCell>
                        <TableCell colSpan={2}></TableCell>
                        <TableCell>
                          {driver.loads.reduce((sum: number, load: any) => sum + (parseFloat(load.net_weight) || 0), 0).toFixed(3)}
                        </TableCell>
                        <TableCell colSpan={2}></TableCell>
                      </TableRow>
                      <TableRow className="bg-slate-100">
                        <TableCell colSpan={9} className="py-3">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div><span className="font-semibold">Driver Name:</span> {driver.first_name} {driver.surname}</div>
                            <div><span className="font-semibold">Contact Details:</span> {driver.cell_number || driver.phone_number || '-'}</div>
                            <div><span className="font-semibold">Truck Registration:</span> {driver.loads[0]?.vehiclesc?.registration_number || '-'}</div>
                            <div><span className="font-semibold">Status:</span> {driver.status || 'Active'}</div>
                          </div>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </Card>
        ))
      )}
    </div>
  )
}