'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Save, Plus, Minus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CommodityDropdown } from '@/components/ui/commodity-dropdown'
import { VehicleDropdown } from '@/components/ui/vehicle-dropdown'
import { DriverDropdown } from '@/components/ui/driver-dropdown'
import { RouteMap } from '@/components/ui/route-map'
import { createClient } from '@/lib/supabase/client'

const LoadForm = ({ onClose, id }) => {
  const supabase = createClient()
  
  const [drivers, setDrivers] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(false)
  const [vehicleTrackingData, setVehicleTrackingData] = useState([])
  const [sortedDrivers, setSortedDrivers] = useState([])
  const [selectedDriverLocation, setSelectedDriverLocation] = useState(null)
  const [routeData, setRouteData] = useState({ distance: 0, duration: 0 })
  
  const [formState, setFormState] = useState({
    client: '',
    commodity: '',
    rate: '',
    orderNumber: '',
    comment: '',
    etaPickup: '',
    loadingLocation: '',
    etaDropoff: '',
    dropOffPoint: '',
    status: 'pending',
    vehicleAssignments: [{
      vehicle: { id: '', name: '' },
      trailer: { id: '', name: '' },
      drivers: [{ id: '', name: '' }]
    }]
  })

  // Fetch reference data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          { data: driversData },
          { data: vehiclesData },
          { data: clientsData },
          trackingResponse
        ] = await Promise.all([
          supabase.from('drivers').select('*'),
          supabase.from('vehicles').select('*').limit(1000),
          supabase.from('clients').select('*'),
          fetch('http://64.227.138.235:3000/api/eps-vehicles')
        ])
        
        const trackingData = await trackingResponse.json()
        const vehicleData = trackingData?.result?.data || trackingData?.data || trackingData || []
        
        setDrivers(driversData || [])
        setVehicles(vehiclesData || [])
        setClients(clientsData || [])
        setVehicleTrackingData(vehicleData)
        setSortedDrivers(driversData || [])
      } catch (err) {
        console.error('Error fetching data:', err)
      }
    }
    fetchData()
  }, [])

  // Fetch trip if editing
  useEffect(() => {
    if (id) {
      const fetchTrip = async () => {
        const { data, error } = await supabase.from('trips').select('*').eq('id', id).single()
        if (!error && data) {
          // Convert trip data back to load format
          const loadData = {
            ...data,
            client: data.clientDetails?.name || data.client_details?.name || '',
            commodity: data.cargo || '',
            rate: data.rate || '',
            orderNumber: data.orderNumber || '',
            comment: data.notes || '',
            etaPickup: data.pickupLocations?.[0]?.scheduledTime || data.pickup_locations?.[0]?.scheduled_time || '',
            loadingLocation: data.origin || data.pickupLocations?.[0]?.location || data.pickup_locations?.[0]?.location || '',
            etaDropoff: data.dropoffLocations?.[0]?.scheduledTime || data.dropoff_locations?.[0]?.scheduled_time || '',
            dropOffPoint: data.destination || data.dropoffLocations?.[0]?.location || data.dropoff_locations?.[0]?.location || '',
            vehicleAssignments: data.vehicleAssignments || data.vehicle_assignments || [{
              vehicle: { id: '', name: '' },
              trailer: { id: '', name: '' },
              drivers: [{ id: '', name: '' }]
            }]
          }
          setFormState(loadData)
        }
      }
      fetchTrip()
    }
  }, [id])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormState(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (field, value) => {
    setFormState(prev => ({ ...prev, [field]: value }))
  }

  // Calculate distance between two coordinates
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371 // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  // Get pickup location coordinates using Mapbox
  const getPickupCoordinates = async (location) => {
    if (!location) return null
    try {
      const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
      if (!mapboxToken) return null
      
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json?access_token=${mapboxToken}&country=za&limit=1`
      )
      const data = await response.json()
      if (data.features?.[0]?.center) {
        const [lon, lat] = data.features[0].center
        return { lat, lon }
      }
    } catch (error) {
      console.error('Error geocoding pickup location:', error)
    }
    return null
  }

  // Get sorted drivers by optimized route distance
  const getSortedDriversByDistance = async (pickupLocation, dropoffLocation) => {
    if (!pickupLocation) return drivers
    
    const [pickupCoords, dropoffCoords] = await Promise.all([
      getPickupCoordinates(pickupLocation),
      dropoffLocation ? getPickupCoordinates(dropoffLocation) : null
    ])
    
    if (!pickupCoords) return drivers
    
    const driversWithDistance = drivers.map(driver => {
      const driverFullName = `${driver.first_name} ${driver.surname}`.trim().toLowerCase()
      const matchingVehicle = Array.isArray(vehicleTrackingData) ? vehicleTrackingData.find(vehicle => 
        vehicle.driver_name && 
        vehicle.driver_name.toLowerCase() === driverFullName
      ) : null
      
      if (matchingVehicle?.latitude && matchingVehicle?.longitude) {
        const driverLat = parseFloat(matchingVehicle.latitude)
        const driverLon = parseFloat(matchingVehicle.longitude)
        
        // Calculate optimized route: Driver → Loading → Drop off
        const driverToLoading = calculateDistance(
          driverLat, driverLon,
          pickupCoords.lat, pickupCoords.lon
        )
        
        let totalDistance = driverToLoading
        
        if (dropoffCoords) {
          const loadingToDropoff = calculateDistance(
            pickupCoords.lat, pickupCoords.lon,
            dropoffCoords.lat, dropoffCoords.lon
          )
          totalDistance = driverToLoading + loadingToDropoff
        }
        
        return { 
          ...driver, 
          distance: Math.round(totalDistance * 10) / 10,
          driverToLoading: Math.round(driverToLoading * 10) / 10,
          loadingToDropoff: dropoffCoords ? Math.round(calculateDistance(
            pickupCoords.lat, pickupCoords.lon,
            dropoffCoords.lat, dropoffCoords.lon
          ) * 10) / 10 : null
        }
      }
      
      return { ...driver, distance: null }
    })
    
    return driversWithDistance.sort((a, b) => {
      if (a.distance === null && b.distance === null) return 0
      if (a.distance === null) return 1
      if (b.distance === null) return -1
      return a.distance - b.distance
    })
  }

  // Update sorted drivers when loading or dropoff location changes
  useEffect(() => {
    if (formState.loadingLocation) {
      getSortedDriversByDistance(formState.loadingLocation, formState.dropOffPoint).then(setSortedDrivers)
    } else {
      setSortedDrivers(drivers)
    }
  }, [formState.loadingLocation, formState.dropOffPoint, drivers, vehicleTrackingData])

  // Update driver location when first driver is selected
  useEffect(() => {
    const firstDriver = formState.vehicleAssignments[0]?.drivers[0]
    if (firstDriver?.id && !selectedDriverLocation) {
      const selectedDriver = drivers.find(d => d.id === firstDriver.id)
      if (selectedDriver) {
        const driverFullName = `${selectedDriver.first_name} ${selectedDriver.surname}`.trim().toLowerCase()
        const matchingVehicle = Array.isArray(vehicleTrackingData) ? vehicleTrackingData.find(vehicle => 
          vehicle.driver_name && 
          vehicle.driver_name.toLowerCase() === driverFullName
        ) : null
        
        if (matchingVehicle?.latitude && matchingVehicle?.longitude) {
          setSelectedDriverLocation({
            lat: parseFloat(matchingVehicle.latitude),
            lng: parseFloat(matchingVehicle.longitude)
          })
        }
      }
    }
  }, [formState.vehicleAssignments, drivers, vehicleTrackingData, selectedDriverLocation])

  // Vehicle Assignment Handlers
  const handleVehicleChange = (vehicleIndex, vehicleId) => {
    const selectedVehicle = vehicles.find(v => v.id === vehicleId)
    const vehicleName = selectedVehicle ? `${selectedVehicle.make} ${selectedVehicle.model} (${selectedVehicle.regNumber || selectedVehicle.registration_number})` : ''

    setFormState(prev => {
      const updatedAssignments = [...prev.vehicleAssignments]
      updatedAssignments[vehicleIndex] = {
        ...updatedAssignments[vehicleIndex],
        vehicle: { id: vehicleId, name: vehicleName }
      }
      return { ...prev, vehicleAssignments: updatedAssignments }
    })
  }

  const handleTrailerChange = (vehicleIndex, trailerId) => {
    const selectedTrailer = vehicles.find(v => v.id === trailerId)
    const trailerName = selectedTrailer ? `${selectedTrailer.make} ${selectedTrailer.model} (${selectedTrailer.regNumber || selectedTrailer.registration_number})` : ''

    setFormState(prev => {
      const updatedAssignments = [...prev.vehicleAssignments]
      updatedAssignments[vehicleIndex] = {
        ...updatedAssignments[vehicleIndex],
        trailer: { id: trailerId, name: trailerName }
      }
      return { ...prev, vehicleAssignments: updatedAssignments }
    })
  }

  const addVehicle = () => {
    setFormState(prev => ({
      ...prev,
      vehicleAssignments: [
        ...prev.vehicleAssignments,
        { vehicle: { id: '', name: '' }, trailer: { id: '', name: '' }, drivers: [{ id: '', name: '' }] }
      ]
    }))
  }

  const removeVehicle = (vehicleIndex) => {
    setFormState(prev => {
      const updatedAssignments = [...prev.vehicleAssignments]
      updatedAssignments.splice(vehicleIndex, 1)
      return {
        ...prev,
        vehicleAssignments: updatedAssignments.length > 0 ? updatedAssignments : [{ vehicle: { id: '', name: '' }, trailer: { id: '', name: '' }, drivers: [{ id: '', name: '' }] }]
      }
    })
  }

  // Driver Handlers
  const handleVehicleDriverChange = (vehicleIndex, driverIndex, driverId) => {
    const selectedDriver = drivers.find(d => d.id === driverId)
    const driverName = selectedDriver ? `${selectedDriver.first_name} ${selectedDriver.surname}` : ''

    setFormState(prev => {
      const updatedAssignments = [...prev.vehicleAssignments]
      const updatedDrivers = [...updatedAssignments[vehicleIndex].drivers]
      updatedDrivers[driverIndex] = { id: driverId, name: driverName }
      updatedAssignments[vehicleIndex] = {
        ...updatedAssignments[vehicleIndex],
        drivers: updatedDrivers
      }
      return { ...prev, vehicleAssignments: updatedAssignments }
    })

    // Update selected driver location for map
    if (selectedDriver) {
      const driverFullName = `${selectedDriver.first_name} ${selectedDriver.surname}`.trim().toLowerCase()
      const matchingVehicle = Array.isArray(vehicleTrackingData) ? vehicleTrackingData.find(vehicle => 
        vehicle.driver_name && 
        vehicle.driver_name.toLowerCase() === driverFullName
      ) : null
      
      if (matchingVehicle?.latitude && matchingVehicle?.longitude) {
        setSelectedDriverLocation({
          lat: parseFloat(matchingVehicle.latitude),
          lng: parseFloat(matchingVehicle.longitude)
        })
      }
    }
  }

  const addVehicleDriver = (vehicleIndex) => {
    setFormState(prev => {
      const updatedAssignments = [...prev.vehicleAssignments]
      updatedAssignments[vehicleIndex] = {
        ...updatedAssignments[vehicleIndex],
        drivers: [...updatedAssignments[vehicleIndex].drivers, { id: '', name: '' }]
      }
      return { ...prev, vehicleAssignments: updatedAssignments }
    })
  }

  const removeVehicleDriver = (vehicleIndex, driverIndex) => {
    setFormState(prev => {
      const updatedAssignments = [...prev.vehicleAssignments]
      const updatedDrivers = [...updatedAssignments[vehicleIndex].drivers]
      updatedDrivers.splice(driverIndex, 1)
      updatedAssignments[vehicleIndex] = {
        ...updatedAssignments[vehicleIndex],
        drivers: updatedDrivers.length > 0 ? updatedDrivers : [{ id: '', name: '' }]
      }
      return { ...prev, vehicleAssignments: updatedAssignments }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const loadData = {
        ...formState,
        vehicle_assignments: formState.vehicleAssignments
      }
      
      if (!loadData.id || isNaN(Number(loadData.id))) {
        delete loadData.id
      }

      // Convert load data to trip format
      const tripData = {
        ...loadData,
        trip_id: `LOAD-${Date.now()}`,
        orderNumber: loadData.orderNumber,
        cargo: loadData.commodity,
        origin: loadData.loadingLocation,
        destination: loadData.dropOffPoint,
        startDate: loadData.etaPickup ? loadData.etaPickup.split('T')[0] : new Date().toISOString().split('T')[0],
        endDate: loadData.etaDropoff ? loadData.etaDropoff.split('T')[0] : new Date().toISOString().split('T')[0],
        notes: loadData.comment,
        clientDetails: {
          name: loadData.client,
          email: '',
          phone: '',
          address: '',
          contactPerson: ''
        },
        pickupLocations: [{
          location: loadData.loadingLocation || '',
          address: loadData.loadingLocation || '',
          scheduledTime: loadData.etaPickup || ''
        }],
        dropoffLocations: [{
          location: loadData.dropOffPoint || '',
          address: loadData.dropOffPoint || '',
          scheduledTime: loadData.etaDropoff || ''
        }],
        // Dual format for compatibility
        vehicle_assignments: loadData.vehicleAssignments,
        client_details: {
          name: loadData.client,
          email: '',
          phone: '',
          address: '',
          contactPerson: ''
        },
        pickup_locations: [{
          location: loadData.loadingLocation || '',
          address: loadData.loadingLocation || '',
          scheduled_time: loadData.etaPickup || ''
        }],
        dropoff_locations: [{
          location: loadData.dropOffPoint || '',
          address: loadData.dropOffPoint || '',
          scheduled_time: loadData.etaDropoff || ''
        }]
      }
      
      const { error } = await supabase.from('trips').upsert([tripData])
      if (error) throw error
      
      onClose()
    } catch (err) {
      console.error('Error saving load:', err)
      alert('Failed to save load. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6 p-4 w-full">
      <div>
        <h2 className="text-2xl font-bold">{id ? 'Edit Load' : 'Create New Load'}</h2>
        <p className="text-gray-600">Enter load details and assign vehicles/drivers</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Load Information */}
        <Card>
          <CardHeader>
            <CardTitle>Load Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="client">Client</Label>
              <Select value={formState.client} onValueChange={(value) => handleSelectChange('client', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.name}>{client.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="commodity">Commodity</Label>
              <CommodityDropdown value={formState.commodity} onChange={(value) => handleSelectChange('commodity', value)} placeholder="Select commodity" />
            </div>

            <div>
              <Label htmlFor="rate">Rate</Label>
              <Input name="rate" value={formState.rate} onChange={handleChange} placeholder="Rate" />
            </div>

            <div>
              <Label htmlFor="orderNumber">Order Number</Label>
              <Input name="orderNumber" value={formState.orderNumber} onChange={handleChange} placeholder="Order Number" />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="comment">Comment</Label>
              <Textarea name="comment" value={formState.comment} onChange={handleChange} placeholder="Comment" />
            </div>
          </CardContent>
        </Card>

        {/* Location & Timing */}
        <Card>
          <CardHeader>
            <CardTitle>Location & Timing</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="etaPickup">ETA Pick Up</Label>
              <Input type="datetime-local" name="etaPickup" value={formState.etaPickup} onChange={handleChange} />
            </div>

            <div>
              <Label htmlFor="loadingLocation">Loading Location</Label>
              <Input name="loadingLocation" value={formState.loadingLocation} onChange={handleChange} placeholder="Loading Location" />
            </div>

            <div>
              <Label htmlFor="etaDropoff">ETA Drop Off</Label>
              <Input type="datetime-local" name="etaDropoff" value={formState.etaDropoff} onChange={handleChange} />
            </div>

            <div>
              <Label htmlFor="dropOffPoint">Drop Off Point</Label>
              <Input name="dropOffPoint" value={formState.dropOffPoint} onChange={handleChange} placeholder="Drop Off Point" />
            </div>
          </CardContent>
        </Card>

        {/* Route Map */}
        {formState.loadingLocation && selectedDriverLocation && (
          <Card>
            <CardHeader>
              <CardTitle>Route Visualization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RouteMap
                key={`${selectedDriverLocation.lat}-${selectedDriverLocation.lng}-${formState.loadingLocation}-${formState.dropOffPoint}`}
                driverLocation={selectedDriverLocation}
                loadingLocation={formState.loadingLocation}
                dropoffLocation={formState.dropOffPoint}
                driverName={formState.vehicleAssignments[0]?.drivers[0]?.name || "Selected Driver"}
                className="w-full h-[300px]"
                onRouteCalculated={setRouteData}
              />
              
              {/* Route Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-3">Main Route (Optimized)</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Loading:</span> {formState.loadingLocation}
                  </div>
                  {formState.dropOffPoint && (
                    <div>
                      <span className="font-medium">Drop-off:</span> {formState.dropOffPoint}
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Driver:</span> {(() => {
                      const firstDriver = formState.vehicleAssignments[0]?.drivers[0]
                      if (firstDriver?.id) {
                        const driver = drivers.find(d => d.id === firstDriver.id)
                        return driver ? `${driver.first_name} ${driver.surname}` : firstDriver.name || "Selected Driver"
                      }
                      return "No driver selected"
                    })()}
                  </div>
                  {routeData.distance > 0 && (
                    <>
                      <div className="border-t pt-2 mt-2">
                        <div className="font-medium text-blue-600 mb-1">Route Information:</div>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="font-medium">Total Distance:</span> {routeData.distance} km
                          </div>
                          <div>
                            <span className="font-medium">Estimated Time:</span> {Math.floor(routeData.duration / 60)}h {routeData.duration % 60}m
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Vehicle Assignments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              Vehicle Assignments
              <Button type="button" onClick={addVehicle} size="sm">
                <Plus className="h-4 w-4 mr-1" /> Add Vehicle
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formState.vehicleAssignments.map((assignment, vehicleIndex) => (
              <Card key={vehicleIndex} className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium">Vehicle {vehicleIndex + 1}</h4>
                  {formState.vehicleAssignments.length > 1 && (
                    <Button type="button" onClick={() => removeVehicle(vehicleIndex)} size="sm" variant="destructive">
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label>Select Horse (Vehicle)</Label>
                    <VehicleDropdown
                      value={assignment.vehicle.id}
                      onChange={(value) => handleVehicleChange(vehicleIndex, value)}
                      vehicles={vehicles.filter(v => v.vehicle_type === 'vehicle').map(v => ({
                        ...v,
                        regNumber: v.regNumber || v.registration_number
                      }))}
                      placeholder="Select horse (vehicle)"
                    />
                  </div>

                  <div>
                    <Label>Select Trailer</Label>
                    <VehicleDropdown
                      value={assignment.trailer?.id || ''}
                      onChange={(value) => handleTrailerChange(vehicleIndex, value)}
                      vehicles={vehicles.filter(v => v.vehicle_type !== 'vehicle').map(v => ({
                        ...v,
                        regNumber: v.regNumber || v.registration_number
                      }))}
                      placeholder="Select trailer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label>Drivers</Label>
                      <Button type="button" onClick={() => addVehicleDriver(vehicleIndex)} size="sm" variant="outline">
                        <Plus className="h-4 w-4 mr-1" /> Add Driver
                      </Button>
                    </div>
                    
                    {assignment.drivers.map((driver, driverIndex) => (
                      <div key={driverIndex} className="flex gap-2 mb-2">
                        <DriverDropdown
                          value={driver.id}
                          onChange={(value) => handleVehicleDriverChange(vehicleIndex, driverIndex, value)}
                          drivers={sortedDrivers}
                          placeholder="Select driver"
                          showDistance={!!formState.loadingLocation}
                        />
                        {assignment.drivers.length > 1 && (
                          <Button type="button" onClick={() => removeVehicleDriver(vehicleIndex, driverIndex)} size="sm" variant="destructive">
                            <Minus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-between gap-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></span>
                Saving Load...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Save Load
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default LoadForm