'use client'

import { format } from 'date-fns'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Save } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BasicInfoSection } from './trip-form/basic-info-section'
import { ClientSection } from './trip-form/client-section'
import { DriversVehiclesSection } from './trip-form/drivers-vehicles-section'
import { LocationsSection } from './trip-form/locations-section'
import { WaypointsSection } from './trip-form/waypoints-section'

import { useGlobalContext } from '@/context/global-context/context'
import DynamicInput from '@/components/ui/dynamic-input'
import { Separator } from '@/components/ui/separator'
import DetailCard from '@/components/ui/detail-card'
import { CardDescription, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'

// hooks
import { getAddressCoordinates } from '@/hooks/get-address-coordinates'

const TripForm = ({ onClose, id }) => {
  const supabase = createClient()

  // Local state for fetched data
  const [drivers, setDrivers] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [clients, setClients] = useState([])
  const [costCentres, setCostCentres] = useState([])
  const [stopPoints, setStopPoints] = useState([])
  const [loading, setLoading] = useState(false)
  const [formState, setFormState] = useState(null)
  const [currentTab, setCurrentTab] = useState(0)

  // Fetch all reference data from Supabase on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          { data: driversData },
          { data: vehiclesData },
          { data: clientsData },
          { data: costCentresData },
          { data: stopPointsData }
        ] = await Promise.all([
          supabase.from('drivers').select('*'),
          supabase.from('vehiclesc').select('*'),
          supabase.from('clients').select('*'),
          supabase.from('breakdown_cost_centers').select('*'),
          supabase.from('stop_points').select('*'),
        ])
        setDrivers(driversData || [])
        setVehicles(vehiclesData || [])
        setClients(clientsData || [])
        setCostCentres(costCentresData || [])
        setStopPoints(stopPointsData || [])
      } catch (err) {
        console.error('Error fetching reference data:', err)
      }
    }
    fetchData()
  }, [])

  // Fetch trip if editing
  useEffect(() => {
    const fetchTrip = async () => {
      if (!id) {
        // New trip
        setFormState({
          id: undefined,
          trip_id: `TRP-${Date.now()}`,
          orderNumber: '',
          rate: '',
          status: 'pending',
          startDate: format(new Date(), 'yyyy-MM-dd'),
          endDate: format(new Date(), 'yyyy-MM-dd'),
          costCentre: '',
          origin: '',
          destination: '',
          cargo: '',
          cargoWeight: '',
          notes: '',
          drivers: [],
          vehicles: [],
          vehicleAssignments: [],
          pickupLocations: [
            {
              location: '',
              address: '',
              contactPerson: '',
              contactNumber: '',
              operatingHours: '',
              scheduledTime: '',
              notes: '',
            },
          ],
          dropoffLocations: [
            {
              location: '',
              address: '',
              contactPerson: '',
              contactNumber: '',
              operatingHours: '',
              scheduledTime: '',
              notes: '',
            },
          ],
          waypoints: [],
          selectedStopPoints: [],
          stopPoints: [],
          selectedClient: '',
          clientDetails: {
            name: '',
            email: '',
            phone: '',
            address: '',
            contactPerson: '',
          },
          statusNotes: '',
        })
      } else {
        // Editing: fetch trip from Supabase
        const { data: trip, error } = await supabase.from('trips').select('*').eq('id', id).single()
        if (error) {
          console.error('Error fetching trip:', error)
          return
        }
        setFormState(trip)
      }
    }
    fetchTrip()
  }, [id])

  // Handle client selection and auto-populate locations and assignments
  const handleClientChange = (clientId) => {
    if (clientId === "new") {
      setFormState((prev) => ({
        ...prev,
        id: undefined,
        selectedClient: '',
        clientDetails: {
          name: '',
          email: '',
          phone: '',
          address: '',
          contactPerson: '',
        },
        pickupLocations: [
          {
            location: '',
            address: '',
            contactPerson: '',
            contactNumber: '',
            operatingHours: '',
            scheduledTime: '',
            notes: '',
          },
        ],
        dropoffLocations: [
          {
            location: '',
            address: '',
            contactPerson: '',
            contactNumber: '',
            operatingHours: '',
            scheduledTime: '',
            notes: '',
          },
        ],
      }))
      return
    }
    const selectedClient = clients.find((client) => client.id === clientId)
    if (selectedClient) {
      // Determine cost centre from client record
      let clientCostCentre =
        selectedClient.costCentre ||
        selectedClient.cost_centre ||
        selectedClient.costCentreId ||
        selectedClient.cost_centre_id ||
        null

      if (clientCostCentre && typeof clientCostCentre === 'string' && costCentres.length) {
        const foundById = costCentres.find((cc) => cc.id === clientCostCentre)
        const foundByName = costCentres.find((cc) => cc.name === clientCostCentre)
        if (foundById) clientCostCentre = foundById.id
        else if (foundByName) clientCostCentre = foundByName.id
      }

      // Auto-populate pickup and dropoff locations from client fields
      const pickupLocations = selectedClient.pickupLocations && selectedClient.pickupLocations.length > 0
        ? selectedClient.pickupLocations.map(loc => ({
          location: loc.name || '',
          address: loc.address || '',
          contactPerson: loc.contactPerson || '',
          contactNumber: loc.contactNumber || '',
          operatingHours: loc.operatingHours || '',
          scheduledTime: '',
          notes: '',
        }))
        : [
          {
            location: '',
            address: '',
            contactPerson: '',
            contactNumber: '',
            operatingHours: '',
            scheduledTime: '',
            notes: '',
          },
        ]

      const dropoffLocations = selectedClient.dropoffLocations && selectedClient.dropoffLocations.length > 0
        ? selectedClient.dropoffLocations.map(loc => ({
          location: loc.name || '',
          address: loc.address || '',
          contactPerson: loc.contactPerson || '',
          contactNumber: loc.contactNumber || '',
          operatingHours: loc.operatingHours || '',
          scheduledTime: '',
          notes: '',
        }))
        : [
          {
            location: '',
            address: '',
            contactPerson: '',
            contactNumber: '',
            operatingHours: '',
            scheduledTime: '',
            notes: '',
          },
        ]

      setFormState((prev) => ({
        ...prev,
        selectedClient: clientId,
        clientDetails: {
          name: selectedClient.name || '',
          email: selectedClient.email || '',
          phone: selectedClient.phone || '',
          address: selectedClient.address || '',
          contactPerson: selectedClient.contactPerson || '',
        },
        costCentre: clientCostCentre || prev.costCentre,
        pickupLocations,
        dropoffLocations,
      }))
    }
  }

  // Handle client details change
  const handleClientDetailsChange = (field, value) => {
    setFormState((prev) => ({
      ...prev,
      clientDetails: {
        ...prev.clientDetails,
        [field]: value,
      },
    }))
  }

  // Handle stop point selection for waypoints
  const handleStopPointSelection = (stopPointId, checked) => {
    const stopPoint = stopPoints.find((point) => point.id === stopPointId)

    if (checked) {
      setFormState((prev) => ({
        ...prev,
        selectedStopPoints: [...prev.selectedStopPoints, stopPointId],
        waypoints: [
          ...prev.waypoints,
          {
            id: stopPointId,
            location: stopPoint.name,
            arrivalTime: '',
            departureTime: '',
            notes: '',
          },
        ],
      }))
    } else {
      setFormState((prev) => ({
        ...prev,
        selectedStopPoints: prev.selectedStopPoints.filter(
          (id) => id !== stopPointId
        ),
        waypoints: prev.waypoints.filter(
          (waypoint) => waypoint.id !== stopPointId
        ),
      }))
    }
  }

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle date change
  const handleDateChange = (field, date) => {
    setFormState((prev) => ({
      ...prev,
      [field]: date ? format(date, 'yyyy-MM-dd') : '',
    }))
  }

  // Handle select change
  const handleSelectChange = (field, value) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Vehicle Assignment Handlers
  const handleVehicleChange = (vehicleIndex, vehicleId) => {
    const selectedVehicle = vehicles.find(
      (vehicle) => vehicle.id === vehicleId
    )
    const vehicleName = selectedVehicle
      ? `${selectedVehicle.model} (${selectedVehicle.regNumber})`
      : ''

    setFormState((prev) => {
      const updatedAssignments = [...prev.vehicleAssignments]
      updatedAssignments[vehicleIndex] = {
        ...updatedAssignments[vehicleIndex],
        vehicle: { id: vehicleId, name: vehicleName },
      }
      return {
        ...prev,
        vehicleAssignments: updatedAssignments,
      }
    })
  }

  const addVehicle = () => {
    setFormState((prev) => ({
      ...prev,
      vehicleAssignments: [
        ...prev.vehicleAssignments,
        {
          vehicle: { id: '', name: '' },
          drivers: [{ id: '', name: '' }],
          trailers: [],
        },
      ],
    }))
  }

  const removeVehicle = (vehicleIndex) => {
    setFormState((prev) => {
      const updatedAssignments = [...prev.vehicleAssignments]
      updatedAssignments.splice(vehicleIndex, 1)
      return {
        ...prev,
        vehicleAssignments:
          updatedAssignments.length > 0
            ? updatedAssignments
            : [
              {
                vehicle: { id: '', name: '' },
                drivers: [{ id: '', name: '' }],
                trailers: [],
              },
            ],
      }
    })
  }

  // Driver Handlers for specific vehicles
  const handleVehicleDriverChange = (vehicleIndex, driverIndex, driverId) => {
    const selectedDriver = drivers.find(
      (driver) => driver.id === driverId
    )
    const driverName = selectedDriver ? selectedDriver.name : ''

    setFormState((prev) => {
      const updatedAssignments = [...prev.vehicleAssignments]
      const updatedDrivers = [...updatedAssignments[vehicleIndex].drivers]
      updatedDrivers[driverIndex] = { id: driverId, name: driverName }
      updatedAssignments[vehicleIndex] = {
        ...updatedAssignments[vehicleIndex],
        drivers: updatedDrivers,
      }
      return {
        ...prev,
        vehicleAssignments: updatedAssignments,
      }
    })
  }

  const addVehicleDriver = (vehicleIndex) => {
    setFormState((prev) => {
      const updatedAssignments = [...prev.vehicleAssignments]
      updatedAssignments[vehicleIndex] = {
        ...updatedAssignments[vehicleIndex],
        drivers: [
          ...updatedAssignments[vehicleIndex].drivers,
          { id: '', name: '' },
        ],
      }
      return {
        ...prev,
        vehicleAssignments: updatedAssignments,
      }
    })
  }

  const removeVehicleDriver = (vehicleIndex, driverIndex) => {
    setFormState((prev) => {
      const updatedAssignments = [...prev.vehicleAssignments]
      const updatedDrivers = [...updatedAssignments[vehicleIndex].drivers]
      updatedDrivers.splice(driverIndex, 1)
      updatedAssignments[vehicleIndex] = {
        ...updatedAssignments[vehicleIndex],
        drivers:
          updatedDrivers.length > 0 ? updatedDrivers : [{ id: '', name: '' }],
      }
      return {
        ...prev,
        vehicleAssignments: updatedAssignments,
      }
    })
  }

  // Trailer Handlers for specific vehicles
  const handleVehicleTrailerChange = (
    vehicleIndex,
    trailerIndex,
    trailerId
  ) => {
    const selectedTrailer = vehicles.find(
      (trailer) => trailer.id === trailerId
    )
    const trailerName = selectedTrailer
      ? `${selectedTrailer.model} (${selectedTrailer.regNumber})`
      : ''

    setFormState((prev) => {
      const updatedAssignments = [...prev.vehicleAssignments]
      const updatedTrailers = [...updatedAssignments[vehicleIndex].trailers]
      updatedTrailers[trailerIndex] = { id: trailerId, name: trailerName }
      updatedAssignments[vehicleIndex] = {
        ...updatedAssignments[vehicleIndex],
        trailers: updatedTrailers,
      }
      return {
        ...prev,
        vehicleAssignments: updatedAssignments,
      }
    })
  }

  const addVehicleTrailer = (vehicleIndex) => {
    setFormState((prev) => {
      const updatedAssignments = [...prev.vehicleAssignments]
      updatedAssignments[vehicleIndex] = {
        ...updatedAssignments[vehicleIndex],
        trailers: [
          ...updatedAssignments[vehicleIndex].trailers,
          { id: '', name: '' },
        ],
      }
      return {
        ...prev,
        vehicleAssignments: updatedAssignments,
      }
    })
  }

  const removeVehicleTrailer = (vehicleIndex, trailerIndex) => {
    setFormState((prev) => {
      const updatedAssignments = [...prev.vehicleAssignments]
      const updatedTrailers = [...updatedAssignments[vehicleIndex].trailers]
      updatedTrailers.splice(trailerIndex, 1)
      updatedAssignments[vehicleIndex] = {
        ...updatedAssignments[vehicleIndex],
        trailers: updatedTrailers,
      }
      return {
        ...prev,
        vehicleAssignments: updatedAssignments,
      }
    })
  }

  // Handle driver selection
  const handleDriverChange = (index, driverId) => {
    const selectedDriver = drivers.find(
      (driver) => driver.id === driverId
    )
    const driverName = selectedDriver ? selectedDriver.name : ''

    setFormState((prev) => {
      const updatedDrivers = [...prev.drivers]
      updatedDrivers[index] = { id: driverId, name: driverName }
      return {
        ...prev,
        drivers: updatedDrivers,
      }
    })
  }

  // Add driver
  const addDriver = () => {
    setFormState((prev) => ({
      ...prev,
      drivers: [...prev.drivers, { id: '', name: '' }],
    }))
  }

  // Remove driver
  const removeDriver = (index) => {
    setFormState((prev) => {
      const updatedDrivers = [...prev.drivers]
      updatedDrivers.splice(index, 1)
      return {
        ...prev,
        drivers:
          updatedDrivers.length > 0 ? updatedDrivers : [{ id: '', name: '' }],
      }
    })
  }

  // Handle pickup location change
  const handlePickupLocationChange = (index, field, value) => {
    setFormState((prev) => {
      const updatedLocations = [...prev.pickupLocations]
      updatedLocations[index] = { ...updatedLocations[index], [field]: value }
      return {
        ...prev,
        pickupLocations: updatedLocations,
      }
    })
  }

  // Add pickup location
  const addPickupLocation = () => {
    setFormState((prev) => ({
      ...prev,
      pickupLocations: [
        ...prev.pickupLocations,
        {
          location: '',
          address: '',
          contactPerson: '',
          contactNumber: '',
          operatingHours: '',
          scheduledTime: '',
          notes: '',
        },
      ],
    }))
  }

  // Remove pickup location
  const removePickupLocation = (index) => {
    setFormState((prev) => {
      const updatedLocations = [...prev.pickupLocations]
      updatedLocations.splice(index, 1)
      return {
        ...prev,
        pickupLocations:
          updatedLocations.length > 0
            ? updatedLocations
            : [
              {
                location: '',
                address: '',
                contactPerson: '',
                contactNumber: '',
                operatingHours: '',
                scheduledTime: '',
                notes: '',
              },
            ],
      }
    })
  }

  // Handle dropoff location change
  const handleDropoffLocationChange = (index, field, value) => {
    setFormState((prev) => {
      const updatedLocations = [...prev.dropoffLocations]
      updatedLocations[index] = { ...updatedLocations[index], [field]: value }
      return {
        ...prev,
        dropoffLocations: updatedLocations,
      }
    })
  }

  // Add dropoff location
  const addDropoffLocation = () => {
    setFormState((prev) => ({
      ...prev,
      dropoffLocations: [
        ...prev.dropoffLocations,
        {
          location: '',
          address: '',
          contactPerson: '',
          contactNumber: '',
          operatingHours: '',
          scheduledTime: '',
          notes: '',
        },
      ],
    }))
  }

  // Remove dropoff location
  const removeDropoffLocation = (index) => {
    setFormState((prev) => {
      const updatedLocations = [...prev.dropoffLocations]
      updatedLocations.splice(index, 1)
      return {
        ...prev,
        dropoffLocations:
          updatedLocations.length > 0
            ? updatedLocations
            : [
              {
                location: '',
                address: '',
                contactPerson: '',
                contactNumber: '',
                operatingHours: '',
                scheduledTime: '',
                notes: '',
              },
            ],
      }
    })
  }

  // Handle stop points change
  const handleStopPointsChange = (stopPoints) => {
    setFormState((prev) => ({
      ...prev,
      stopPoints: stopPoints,
    }))
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Normalize and resolve references for drivers, vehicles, costCentre, etc.
      // 1. Resolve drivers
      const resolvedDrivers = (formState.drivers || []).map((drv) => {
        if (typeof drv === "object" && drv.id && drv.name) return drv
        const found = drivers.find((d) => String(d.id) === String(drv.id || drv))
        return found
          ? { id: String(found.id), name: found.first_name || found.name || "" }
          : { id: String(drv.id || drv), name: "" }
      })

      // 2. Resolve vehicles
      const resolvedVehicles = (formState.vehicles || []).map((veh) => {
        if (typeof veh === "object" && veh.id && veh.name) return veh
        const found = vehicles.find((v) => String(v.id) === String(veh.id || veh))
        return found
          ? { id: String(found.id), name: found.model ? `${found.model} (${found.regNumber})` : found.name || "" }
          : { id: String(veh.id || veh), name: "" }
      })

      // 3. Resolve vehicleAssignments (drivers and vehicles inside)
      const resolvedVehicleAssignments = (formState.vehicleAssignments || []).map((va) => ({
        ...va,
        vehicle: va.vehicle && va.vehicle.id
          ? (() => {
            const found = vehicles.find((v) => String(v.id) === String(va.vehicle.id))
            return found
              ? { id: String(found.id), name: found.model ? `${found.model} (${found.regNumber})` : found.name || "" }
              : { id: String(va.vehicle.id), name: "" }
          })()
          : va.vehicle,
        drivers: (va.drivers || []).map((drv) => {
          const found = drivers.find((d) => String(d.id) === String(drv.id || drv))
          return found
            ? { id: String(found.id), name: found.first_name || found.name || "" }
            : { id: String(drv.id || drv), name: "" }
        }),
        trailers: va.trailers || [],
      }))

      // 4. Resolve costCentre
      let resolvedCostCentre = formState.costCentre
      if (resolvedCostCentre && typeof resolvedCostCentre === "string") {
        const found = costCentres.find((cc) => String(cc.id) === String(resolvedCostCentre) || cc.name === resolvedCostCentre)
        resolvedCostCentre = found ? { id: String(found.id), name: found.name } : { id: String(resolvedCostCentre), name: "" }
      }

      // 5. Resolve clientDetails
      let resolvedClientDetails = formState.clientDetails
      if (formState.selectedClient && clients.length) {
        const found = clients.find((c) => String(c.id) === String(formState.selectedClient))
        if (found) {
          resolvedClientDetails = {
            name: found.name || "",
            email: found.email || "",
            phone: found.phone || "",
            address: found.address || "",
            contactPerson: found.contactPerson || "",
          }
        }
      }

      // 6. Ensure pickup/dropoff locations are arrays of objects
      const resolvedPickupLocations = Array.isArray(formState.pickupLocations)
        ? formState.pickupLocations.map((loc) => ({ ...loc }))
        : []
      const resolvedDropoffLocations = Array.isArray(formState.dropoffLocations)
        ? formState.dropoffLocations.map((loc) => ({ ...loc }))
        : []

      // 7. Check for duplicate driver assignments within this trip
      const assignedDriverIds = []
      const duplicateDrivers = []
      
      resolvedDrivers.forEach(driver => {
        if (driver.id) {
          if (assignedDriverIds.includes(driver.id)) {
            duplicateDrivers.push(drivers.find(d => d.id === driver.id)?.name || driver.name)
          } else {
            assignedDriverIds.push(driver.id)
          }
        }
      })
      
      resolvedVehicleAssignments.forEach(assignment => {
        assignment.drivers.forEach(driver => {
          if (driver.id) {
            if (assignedDriverIds.includes(driver.id)) {
              duplicateDrivers.push(drivers.find(d => d.id === driver.id)?.name || driver.name)
            } else {
              assignedDriverIds.push(driver.id)
            }
          }
        })
      })
      
      if (duplicateDrivers.length > 0) {
        alert(`Driver cannot be assigned to multiple vehicles: ${[...new Set(duplicateDrivers)].join(', ')}`)
        setLoading(false)
        return
      }
      
      const uniqueDriverIds = [...new Set(assignedDriverIds)]
      
      // Check if drivers are already assigned to active trips
      if (uniqueDriverIds.length > 0) {
        const { data: activeTrips } = await supabase
          .from('trips')
          .select('id, vehicle_assignments')
          .in('status', ['pending', 'in-progress', 'active'])
          .neq('id', formState.id || '')
        
        const busyDrivers = []
        activeTrips?.forEach(trip => {
          const assignments = trip.vehicle_assignments || []
          assignments.forEach(va => {
            va.drivers?.forEach(d => {
              if (uniqueDriverIds.includes(d.id)) {
                busyDrivers.push(drivers.find(dr => dr.id === d.id)?.name || d.name)
              }
            })
          })
        })
        
        if (busyDrivers.length > 0) {
          alert(`Driver(s) already assigned to active trip: ${busyDrivers.join(', ')}`)
          setLoading(false)
          return
        }
      }
      
      // 8. Fetch route_geometry from vehicle_routes as route_points
      let routePointsData = null
      const vehicleId = resolvedVehicleAssignments[0]?.vehicle?.id
      
      console.log('Fetching route for vehicle_id:', vehicleId, 'type:', typeof vehicleId, 'date:', formState.startDate)
      
      if (vehicleId && formState.startDate) {
        const { data: vehicleRoute, error: routeError } = await supabase
          .from('vehicle_routes')
          .select('*')
          .eq('vehicle_id', Number(vehicleId))
          .eq('scheduled_date', formState.startDate)
          .single()
        
        if (routeError) {
          console.log('No vehicle route found:', routeError.message, routeError.code)
        } else {
          routePointsData = vehicleRoute?.route_geometry || null
          console.log('Route found:', vehicleRoute?.id, 'geometry:', routePointsData ? 'Present' : 'Null')
        }
      } else {
        console.log('Missing vehicle_id or startDate')
      }
      
      const stopPointsData = resolvedDropoffLocations

      // 9. Prepare tripData with both camelCase and snake_case for all relevant fields
      const tripData = {
        ...formState,
        route: `${formState.origin} to ${formState.destination}`,
        driver: resolvedVehicleAssignments[0]?.drivers[0]?.name || 'Unassigned',
        vehicle: resolvedVehicles[0]?.name || 'Unassigned',
        vehicleAssignments: resolvedVehicleAssignments,
        costCentre: resolvedCostCentre,
        clientDetails: resolvedClientDetails,
        pickupLocations: resolvedPickupLocations,
        dropoffLocations: resolvedDropoffLocations,
        stopPoints: stopPointsData,
        routePoints: routePointsData,
        // snake_case for DB compatibility
        vehicle_assignments: resolvedVehicleAssignments,
        cost_centre: resolvedCostCentre,
        client_details: resolvedClientDetails,
        pickup_locations: resolvedPickupLocations,
        dropoff_locations: resolvedDropoffLocations,
        stop_points: stopPointsData,
        route_points: routePointsData,
        distance: 'Calculating...',
        statusNotes: formState.statusNotes,
        status_notes: formState.statusNotes,
        cargoWeight: formState.cargoWeight,
        cargo_weight: formState.cargoWeight,
        endDate: formState.endDate,
        end_date: formState.endDate,
        selectedClient: formState.selectedClient,
        selected_client: formState.selectedClient,
        selectedStopPoints: formState.selectedStopPoints,
        selected_stop_points: formState.selectedStopPoints,
        waypoints: formState.waypoints,
      }
      if (!tripData.id || isNaN(Number(tripData.id))) {
        delete tripData.id
      }
      
      console.log('Saving trip with route_points:', tripData.route_points ? 'Present' : 'Null')
      
      // Insert or update trip
      const { error } = await supabase.from('trips').upsert([tripData])
      if (error) throw error

      // Update driver availability to false
      if (uniqueDriverIds.length > 0) {
        const { error: driverError } = await supabase
          .from('drivers')
          .update({ available: false })
          .in('id', uniqueDriverIds)
        
        if (driverError) {
          console.error('Error updating driver availability:', driverError)
        }
      }
      
      onClose()
    } catch (err) {
      console.error('Error saving trip:', err)
      alert('Failed to save trip. Please try again.')
    }
    setLoading(false)
  }

  if (!formState) return <div>Loading...</div>

  const tabs = [
    { name: 'Trip Information', value: 'trip' },
    { name: 'Vehicle Information', value: 'vehicle' },
    { name: 'Location Information', value: 'location' },
    { name: 'Current Status', value: 'status' },
  ]

  const trip_information = [
    {
      htmlFor: 'id',
      label: 'ID',
      value: formState.id,
      required: false,
      readOnly: true,
    },
    {
      htmlFor: 'orderNumber',
      label: 'Order Number',
      value: formState.orderNumber,
      placeholder: 'Enter order number',
      required: true,
    },
    {
      htmlFor: 'rate',
      label: 'Rate',
      value: formState.rate,
      placeholder: 'Enter rate',
      type: 'number',
      required: true,
    },
    {
      type: 'select',
      htmlFor: 'costCentre',
      label: 'Cost Centre',
      placeholder: 'Select cost centre',
      value: formState.costCentre,
      required: true,
      options: costCentres?.map((cc) => {
        return { value: cc.id, label: cc.name }
      }),
    },

    {
      htmlFor: 'startDate',
      label: 'Start Date',
      type: 'date',
      value: formState.startDate,
      required: true,
    },
    {
      htmlFor: 'endDate',
      label: 'Expected End Date',
      type: 'date',
      value: formState.endDate,
      required: true,
    },
    {
      htmlFor: 'cargo',
      label: 'Cargo Description/Commodity',
      value: formState.cargo,
      placeholder: 'describe the cargo',
      required: true,
    },
    {
      htmlFor: 'cargoWeight',
      label: 'Cargo Weight',
      value: formState.cargoWeight,
      placeholder: 'e.g., 24 tons',
      type: 'number',
      required: true,
    },
  ]

  const client_information = [
    {
      htmlFor: 'clientName',
      label: 'Client Name',
      value: formState.clientDetails.name,
      field: 'name',
      placeholder: 'Enter client name',
      required: true,
    },
    {
      htmlFor: 'contactPerson',
      label: 'Client Contact Person',
      value: formState.clientDetails.contactPerson,
      field: 'contactPerson',
      placeholder: 'Enter contact Person',
      required: true,
    },
    {
      htmlFor: 'clientPhone',
      label: 'Client Phone Number',
      value: formState.clientDetails.phone,
      field: 'phone',
      placeholder: 'Enter phone number',
      required: true,
    },
    {
      htmlFor: 'clientEmail',
      label: 'Client Email',
      value: formState.clientDetails.email,
      field: 'email',
      placeholder: 'Enter email address',
      required: true,
    },
  ]
  // console.log('formData', formData.selectedClient)
  return (
    <div className=" h-full space-y-6p-4 w-full">
      <div className="flex items-center gap-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {id ? `Edit Trip` : 'Add New Trip'}
          </h2>
          <p className="text-muted-foreground">
            {id ? formState.clientDetails.name : 'Enter Trip Details'}
          </p>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <Tabs
          defaultValue="trip"
          value={tabs[currentTab]?.value}
          onValueChange={(value) => {
            const index = tabs.findIndex((tab) => tab.value === value)
            setCurrentTab(index)
          }}
          className="w-full"
        >
          <TabsList className="grid grid-cols-4 w-full">
            {tabs.map((tab, index) => (
              <TabsTrigger
                key={index}
                tabIndex={currentTab}
                value={tab.value}
                onClick={() => {
                  setCurrentTab(index)
                }}
              >
                {tab.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="trip" className="space-y-6">
            <DetailCard
              title={'Client Information'}
              description={'Select or enter client information'}
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="selectedClient">
                    Select Client (Optional)
                  </Label>
                  <Select
                    value={formState.selectedClient || "new"}
                    onValueChange={handleClientChange}
                  >
                    <SelectTrigger
                      id="selectedClient"
                      className="w-full border-[#d3d3d3]"
                    >
                      <SelectValue placeholder="Select existing client or leave blank for new client" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">
                        New Client (Manual Entry)
                      </SelectItem>
                      {clients?.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {client_information.map((client) => {
                  return (
                    <div key={client.htmlFor} className="space-y-2">
                      <Label htmlFor={client.htmlFor}>{client.label}</Label>
                      <Input
                        id={client.htmlFor}
                        value={client.value}
                        onChange={(e) =>
                          handleClientDetailsChange(
                            client.field,
                            e.target.value
                          )
                        }
                        placeholder={client.placeholder}
                        disabled={!!formState.selectedClient}
                        className={!!formState.selectedClient && 'bg-muted'}
                      />
                    </div>
                  )
                })}
              </div>
              <div className="space-y-2 mt-4">
                <Label htmlFor="clientAddress">Address</Label>
                <Textarea
                  id="clientAddress"
                  value={formState.clientDetails.address}
                  onChange={(e) =>
                    handleClientDetailsChange('address', e.target.value)
                  }
                  placeholder="Enter client address"
                  rows={3}
                  disabled={!!formState.selectedClient}
                  className="w-full border-[#d3d3d3]"
                />
              </div>

              <Separator className="my-4 space-y-1" />

              <div className="mb-6 space-y-1">
                <CardTitle>Trip Information</CardTitle>
                <CardDescription>Enter details for this trip</CardDescription>
              </div>

              <DynamicInput
                inputs={trip_information}
                handleSelectChange={handleSelectChange}
                handleChange={handleChange}
              />

              <div className="space-y-2 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="notes">Trip Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formState.notes}
                    onChange={handleChange}
                    placeholder="Additional information about this trip"
                    rows={4}
                    className="w-full border-[#d3d3d3]"
                  />
                </div>
              </div>
            </DetailCard>
          </TabsContent>

          <TabsContent value="vehicle" className="space-y-6">
            <DriversVehiclesSection
              formData={formState}
              handleDriverChange={handleDriverChange}
              addDriver={addDriver}
              removeDriver={removeDriver}
              handleVehicleChange={handleVehicleChange}
              addVehicle={addVehicle}
              removeVehicle={removeVehicle}
              drivers={drivers}
              vehicles={vehicles}
              handleVehicleDriverChange={handleVehicleDriverChange}
              addVehicleDriver={addVehicleDriver}
              removeVehicleDriver={removeVehicleDriver}
              handleVehicleTrailerChange={handleVehicleTrailerChange}
              addVehicleTrailer={addVehicleTrailer}
              removeVehicleTrailer={removeVehicleTrailer}
            />
          </TabsContent>

          <TabsContent value="location" className="space-y-6">
            <LocationsSection
              formData={formState}
              handlePickupLocationChange={handlePickupLocationChange}
              addPickupLocation={addPickupLocation}
              removePickupLocation={removePickupLocation}
              handleDropoffLocationChange={handleDropoffLocationChange}
              addDropoffLocation={addDropoffLocation}
              removeDropoffLocation={removeDropoffLocation}
              handleStopPointChange={handleStopPointsChange}
              clients={clients}
            />
          </TabsContent>

          <TabsContent value="status" className="space-y-6">
            <DetailCard
              title="Trip Status"
              description="Update the current status of this trip"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formState.status}
                    onValueChange={(value) =>
                      handleSelectChange('status', value)
                    }
                  >
                    <SelectTrigger
                      id="status"
                      className="w-full border-[#d3d3d3]"
                    >
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Optionally, show last updated and updated by if you have those fields */}
                {/* <div>
        <Label>Last Updated</Label>
        <div>{formData.statusLastUpdated || '-'}</div>
      </div>
      <div>
        <Label>Updated By</Label>
        <div>{formData.statusUpdatedBy || '-'}</div>
      </div> */}
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-1">
                <div className="space-y-2">
                  <Label htmlFor="statusNotes">Status Notes</Label>
                  <Textarea
                    id="statusNotes"
                    name="statusNotes"
                    value={formState.statusNotes || ''}
                    onChange={handleChange}
                    placeholder="Add any notes about the status change"
                    rows={3}
                  />
                </div>
              </div>
            </DetailCard>
          </TabsContent>
        </Tabs>

        {/* Form Actions */}
        <div className=" flex justify-between gap-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
          //onClick={handleSubmit}
          >
            {loading ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></span>
                Saving Trip...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Save Trip
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default TripForm
