'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Search, DollarSign, Truck, Calendar, FileText, X } from 'lucide-react'

export default function AuditPage() {
  const [auditRecords, setAuditRecords] = useState([])
  const [filteredRecords, setFilteredRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showSummary, setShowSummary] = useState(false)
  const [selectedTrip, setSelectedTrip] = useState(null)
  const [tripDetailsOpen, setTripDetailsOpen] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchAuditRecords()
  }, [])

  useEffect(() => {
    filterRecords()
  }, [auditRecords, statusFilter, searchTerm])

  const fetchAuditRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('audit')
        .select('*')
        .order('updated_at', { ascending: false })

      if (error) throw error
      setAuditRecords(data || [])
    } catch (error) {
      console.error('Error fetching audit records:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterRecords = () => {
    let filtered = auditRecords

    if (statusFilter !== 'all') {
      filtered = filtered.filter(record => record.status === statusFilter)
    } else {
      filtered = filtered.filter(record => record.status === 'delivered' || record.status === 'completed')
    }

    if (searchTerm) {
      filtered = filtered.filter(record => 
        record.trip_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.ordernumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.origin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.destination?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredRecords(filtered)
  }

  const calculateSummary = () => {
    const totalTrips = filteredRecords.length
    const totalCost = filteredRecords.reduce((sum, record) => sum + (record.actual_total_cost || 0), 0)
    const totalDistance = filteredRecords.reduce((sum, record) => sum + (record.actual_distance || 0), 0)
    const avgCostPerTrip = totalTrips > 0 ? totalCost / totalTrips : 0
    const avgCostPerKm = totalDistance > 0 ? totalCost / totalDistance : 0

    return {
      totalTrips,
      totalCost,
      totalDistance,
      avgCostPerTrip,
      avgCostPerKm,
      deliveredTrips: filteredRecords.filter(r => r.status === 'delivered').length,
      completedTrips: filteredRecords.filter(r => r.status === 'completed').length
    }
  }

  const summary = calculateSummary()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading audit records...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Audit Dashboard</h1>
        <Button 
          onClick={() => setShowSummary(!showSummary)}
          variant={showSummary ? "default" : "outline"}
        >
          <FileText className="w-4 h-4 mr-2" />
          {showSummary ? 'Hide Summary' : 'Show Summary'}
        </Button>
      </div>

      {showSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Trips</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalTrips}</div>
              <p className="text-xs text-muted-foreground">
                {summary.deliveredTrips} delivered, {summary.completedTrips} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R{summary.totalCost.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</div>
              <p className="text-xs text-muted-foreground">
                Avg: R{summary.avgCostPerTrip.toLocaleString('en-ZA', { minimumFractionDigits: 2 })} per trip
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Distance</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalDistance.toLocaleString('en-ZA')} km</div>
              <p className="text-xs text-muted-foreground">
                Avg: {(summary.totalDistance / Math.max(summary.totalTrips, 1)).toFixed(1)} km per trip
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cost per KM</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R{summary.avgCostPerKm.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Average rate</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by trip ID, order number, origin, or destination..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Audit Records ({filteredRecords.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Client</th>
                  <th className="text-left p-2">Cargo</th>
                  <th className="text-left p-2">Rate</th>
                  <th className="text-left p-2">Pickup Point</th>
                  <th className="text-left p-2">Drop Off Point</th>
                  <th className="text-left p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr 
                    key={record.trip_id} 
                    className="border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      setSelectedTrip(record)
                      setTripDetailsOpen(true)
                    }}
                  >
                    <td className="p-2">{record.selectedclient || record.selected_client || 'N/A'}</td>
                    <td className="p-2">{record.cargo || 'N/A'}</td>
                    <td className="p-2 font-semibold">
                      {record.rate ? `R${parseFloat(record.rate).toLocaleString('en-ZA')}` : 'N/A'}
                    </td>
                    <td className="p-2 text-sm">{record.origin || 'N/A'}</td>
                    <td className="p-2 text-sm">{record.destination || 'N/A'}</td>
                    <td className="p-2">
                      <Badge variant={record.status === 'completed' ? 'default' : record.status === 'delivered' ? 'secondary' : 'outline'}>
                        {record.status || 'pending'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredRecords.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No audit records found matching your criteria.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}