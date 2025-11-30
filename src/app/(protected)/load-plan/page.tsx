"use client"

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SecureButton } from '@/components/SecureButton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogPortal, DialogOverlay } from '@/components/ui/dialog'
import { X, FileText, CheckCircle, AlertTriangle, Clock, TrendingUp, Plus, Route, MapPin, Upload, FileSpreadsheet } from 'lucide-react'
import * as XLSX from 'xlsx'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { LocationAutocomplete } from '@/components/ui/location-autocomplete'
import { ProgressWithWaypoints } from '@/components/ui/progress-with-waypoints'
import { RouteOptimizer } from '@/components/ui/route-optimizer'
import { RouteTracker } from '@/components/ui/route-tracker'
import { RoutePreviewMap } from '@/components/ui/route-preview-map'
import { RouteConfirmationModal } from '@/components/ui/route-confirmation-modal'
import { RouteEditModal } from '@/components/ui/route-edit-modal'
import { DateTimePicker } from '@/components/ui/datetime-picker'
import { CommodityDropdown } from '@/components/ui/commodity-dropdown'
import { ClientDropdown } from '@/components/ui/client-dropdown'
import { ClientAddressPopup } from '@/components/ui/client-address-popup'
import { NewCustomerModal } from '@/components/ui/new-customer-modal'
import { toast } from 'sonner'
import { DriverDropdown } from '@/components/ui/driver-dropdown'
import { VehicleDropdown } from '@/components/ui/vehicle-dropdown'
import { VehicleTypeDropdown } from '@/components/ui/vehicle-type-dropdown'
import { TrailerDropdown } from '@/components/ui/trailer-dropdown'
import { StopPointDropdown } from '@/components/ui/stop-point-dropdown'
import { VehicleRouteMap } from '@/components/ui/vehicle-route-map'
import { markDriversUnavailable } from '@/lib/utils/driver-availability'
import { canAssignOrderToVehicle, sortVehiclesByPriority, assignVehiclesWithDrivers, updateDriverAvailability, resetAllDriversAvailable } from '@/lib/vehicle-assignment-rules'
import { geocodeWithRules } from '@/lib/geocoding-rules'
import { reoptimizeVehicleRoute } from '@/lib/reoptimize-vehicle-route'


export default function LoadPlanPage() {
  const supabase = createClient()
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    if (type === 'success') {
      toast.success(message)
    } else {
      toast.error(message)
    }
  }
  const [loads, setLoads] = useState([
    {
      id: 'test-1',
      trip_id: 'TEST-123',
      client: 'Test Client',
      commodity: 'Test Cargo',
      rate: '1000',
      startdate: '2025-01-15',
      enddate: '2025-01-16',
      status: 'pending',
      vehicleassignments: []
    }
  ])
  const [clients, setClients] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [drivers, setDrivers] = useState([])
  const [costCenters, setCostCenters] = useState([])
  const [availableDrivers, setAvailableDrivers] = useState([])
  const [vehicleTrackingData, setVehicleTrackingData] = useState([])
  const [vehicleAssignments, setVehicleAssignments] = useState<any[]>([])
  const [unassignedOrders, setUnassignedOrders] = useState<any[]>([])
  const [selectedVehicleForDetails, setSelectedVehicleForDetails] = useState<any>(null)
  const [showVehicleDetailsModal, setShowVehicleDetailsModal] = useState(false)
  const [isReoptimizing, setIsReoptimizing] = useState(false)
  const [draggedOrder, setDraggedOrder] = useState<any>(null)
  const [draggedOverIndex, setDraggedOverIndex] = useState<number | null>(null)
  const [selectedDate, setSelectedDate] = useState('today')
  const [todayAssignments, setTodayAssignments] = useState<any[]>([])
  const [tomorrowAssignments, setTomorrowAssignments] = useState<any[]>([])
  const [dayAfterAssignments, setDayAfterAssignments] = useState<any[]>([])

  // Create Load form state
  const [client, setClient] = useState('')
  const [selectedClient, setSelectedClient] = useState(null)
  const [manualClientName, setManualClientName] = useState('')
  const [showAddressPopup, setShowAddressPopup] = useState(false)
  const [commodity, setCommodity] = useState('')
  const [costCenter, setCostCenter] = useState('')
  const [rate, setRate] = useState('')
  const [orderNumber, setOrderNumber] = useState(`ORD-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`)
  const [comment, setComment] = useState('')
  // Address & ETA section
  const [etaPickup, setEtaPickup] = useState('')
  const [loadingLocation, setLoadingLocation] = useState('Fuchs Lubricants, Stikland Industrial, 9 Square Street, Bellville 7530')
  const [etaDropoff, setEtaDropoff] = useState('')
  const [dropOffPoint, setDropOffPoint] = useState('')
  const [showSecondSection, setShowSecondSection] = useState(false)
  const secondRef = useRef<HTMLDivElement | null>(null)
  const [optimizedRoute, setOptimizedRoute] = useState<any>(null)
  const [showRouteModal, setShowRouteModal] = useState(false)
  const [isOptimizing, setIsOptimizing] = useState(false)

  // Driver assignments state
  const [driverAssignments, setDriverAssignments] = useState([{ id: '', name: '' }])
  const [selectedVehicleId, setSelectedVehicleId] = useState('')
  const [selectedTrailerId, setSelectedTrailerId] = useState('')
  const [selectedVehicleType, setSelectedVehicleType] = useState('')
  const [selectedDriverLocation, setSelectedDriverLocation] = useState(null)

  // Cost calculation state
  const [selectedVehicle, setSelectedVehicle] = useState('')
  const [fuelPricePerLiter, setFuelPricePerLiter] = useState('21.55')
  const [estimatedDistance, setEstimatedDistance] = useState(0)
  const [approximateFuelCost, setApproximateFuelCost] = useState(0)
  const [approximatedCPK, setApproximatedCPK] = useState(0)
  const [approximatedVehicleCost, setApproximatedVehicleCost] = useState(0)
  const [approximatedDriverCost, setApproximatedDriverCost] = useState(0)
  const [totalVehicleCost, setTotalVehicleCost] = useState(0)
  const [goodsInTransitPremium, setGoodsInTransitPremium] = useState('')
  const [tripType, setTripType] = useState('local')
  const [stopPoints, setStopPoints] = useState([])
  const [availableStopPoints, setAvailableStopPoints] = useState([])
  const [isLoadingStopPoints, setIsLoadingStopPoints] = useState(false)
  const [customStopPoints, setCustomStopPoints] = useState([])
  const [tripDays, setTripDays] = useState(1)
  const [isManuallyOrdered, setIsManuallyOrdered] = useState(false)

  // Excel upload state
  const [excelFile, setExcelFile] = useState<File | null>(null)
  const [parsedOrders, setParsedOrders] = useState<any[]>([])
  const [newClients, setNewClients] = useState<string[]>([])
  const [isProcessingExcel, setIsProcessingExcel] = useState(false)
  const [excelError, setExcelError] = useState<string | null>(null)
  const [excelSuccess, setExcelSuccess] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false)
  const [pendingCustomer, setPendingCustomer] = useState<{ id: string; name: string; location?: string } | null>(null)
  const [hasUnknownLocations, setHasUnknownLocations] = useState(false)

  const DEFAULT_LOADING_SITE = "Fuchs Lubricants, Stikland Industrial, 9 Square Street, Bellville 7530"

  // Rate Card System - Variable Costs
  const RATE_CARD_SYSTEM = {
    'TAUTLINER': {
      fuel_rate: 4070,      // R4,070 fuel component
      base_rate: 7280,      // R7,280 base rate
      ppk: 3.00,           // R3.00 per km
      profit_margin: 0.111, // 11.1%
      extra_stop: 0,       // No extra stop cost
    },
    'TAUT X-BRDER - BOTSWANA': {
      fuel_rate: 3500,
      base_rate: 6500,
      ppk: 2.80,
      profit_margin: 0.10,
      extra_stop: 500,
    },
    'TAUT X-BRDER - NAMIBIA': {
      fuel_rate: 3800,
      base_rate: 7000,
      ppk: 2.90,
      profit_margin: 0.10,
      extra_stop: 500,
    },
    'CITRUS LOAD (+1 DAY STANDING FPT)': {
      fuel_rate: 4070,
      base_rate: 7280,
      ppk: 3.00,
      profit_margin: 0.111,
      extra_stop: 0,
      standing_day_cost: 2000, // Extra standing day cost
    },
    '14M/15M COMBO (NEW)': {
      fuel_rate: 3200,
      base_rate: 6800,
      ppk: 2.50,
      profit_margin: 0.12,
      extra_stop: 300,
    },
    '14M/15M REEFER': {
      fuel_rate: 3500,
      base_rate: 7500,
      ppk: 2.80,
      profit_margin: 0.12,
      extra_stop: 400,
    },
    '9 METER (NEW)': {
      fuel_rate: 2800,
      base_rate: 5500,
      ppk: 2.20,
      profit_margin: 0.11,
      extra_stop: 250,
    },
    '8T JHB (NEW - EPS)': {
      fuel_rate: 2200,
      base_rate: 4800,
      ppk: 1.80,
      profit_margin: 0.10,
      extra_stop: 200,
    },
    '8T JHB (NEW) - X-BRDER - MOZ': {
      fuel_rate: 2400,
      base_rate: 5200,
      ppk: 1.90,
      profit_margin: 0.10,
      extra_stop: 300,
    },
    '8T JHB (OLD)': {
      fuel_rate: 2000,
      base_rate: 4200,
      ppk: 1.60,
      profit_margin: 0.09,
      extra_stop: 150,
    },
    '14 TON CURTAIN': {
      fuel_rate: 3400,
      base_rate: 6200,
      ppk: 2.60,
      profit_margin: 0.11,
      extra_stop: 350,
    },
    '1TON BAKKIE': {
      fuel_rate: 1200,
      base_rate: 2800,
      ppk: 1.20,
      profit_margin: 0.08,
      extra_stop: 100,
    },
  }

  // Fetch loads and reference data
  // Fetch stop points with pagination and caching
  const fetchStopPoints = async () => {
    if (availableStopPoints.length > 0) return // Already loaded

    setIsLoadingStopPoints(true)
    try {
      const { data: stopPointsData, error: stopPointsError } = await supabase
        .from('stop_points')
        .select('id, name, name2, coordinates')
        .order('name')
      // .limit(1000) // Removed limit to get all stop points

      if (stopPointsError) {
        console.error('Stop points error:', stopPointsError)
      } else {
        setAvailableStopPoints(stopPointsData || [])
      }
    } catch (err) {
      console.error('Error fetching stop points:', err)
    }
    setIsLoadingStopPoints(false)
  }

  const fetchData = async () => {
    console.log('Starting fetchData...')
    try {
      console.log('Fetching from Supabase...')
      const [
        { data: loadsData, error: loadsError },
        { data: clientsData, error: clientsError },
        { data: vehiclesData, error: vehiclesError },
        { data: driversData, error: driversError },
        { data: costCentersData, error: costCentersError },
        trackingResponse
      ] = await Promise.all([
        supabase.from('trips').select('*').order('created_at', { ascending: false }),
        supabase.from('eps_client_list').select('id, name, coordinates').order('name'),
        supabase.from('vehiclesc').select('id, registration_number, engine_number, vin_number, make, model, sub_model, manufactured_year, vehicle_type, load_capacity, description, restrictions'),
        supabase.from('drivers').select('*'),
        supabase.from('cost_centers').select('*'),
        fetch('http://64.227.138.235:3000/api/eps-vehicles')
      ])



      console.log('Supabase errors:', { loadsError, clientsError, vehiclesError, driversError, costCentersError })

      const trackingData = await trackingResponse.json()
      const vehicleData = trackingData?.result?.data || trackingData?.data || trackingData || []

      // Format drivers from drivers table
      const formattedDrivers = (driversData || []).map(driver => ({
        id: driver.id,
        name: `${driver.first_name} ${driver.surname}`.trim(),
        first_name: driver.first_name || '',
        surname: driver.surname || '',
        available: driver.available
      }))

      // Filter available drivers
      const availableDriversList = formattedDrivers.filter(d => d.available === true)

      // Helper function to parse JSON fields
      const parseJsonField = (field) => {
        if (!field) return null
        if (typeof field === 'object') return field
        try {
          return JSON.parse(field)
        } catch {
          return null
        }
      }

      // Convert trip data to load format for display
      const loadData = (loadsData || []).map(trip => {
        const clientDetails = parseJsonField(trip.clientdetails)
        const pickupLocations = parseJsonField(trip.pickuplocations)
        const dropoffLocations = parseJsonField(trip.dropofflocations)

        return {
          ...trip,
          client: clientDetails?.name || '',
          commodity: trip.cargo || '',
          etaPickup: pickupLocations?.[0]?.scheduled_time || trip.startdate || '',
          etaDropoff: dropoffLocations?.[0]?.scheduled_time || trip.enddate || '',
          loadingLocation: trip.origin || '',
          dropOffPoint: trip.destination || ''
        }
      })

      console.log('Raw loads data:', loadsData)
      console.log('Raw loads count:', loadsData?.length || 0)
      console.log('Processed load data:', loadData)
      console.log('Processed loads count:', loadData?.length || 0)

      setLoads(loadData)
      setClients(clientsData || [])
      setVehicles(vehiclesData || [])
      setDrivers(formattedDrivers)
      setAvailableDrivers(availableDriversList)
      setVehicleTrackingData(vehicleData)
      setCostCenters(costCentersData || [])
      setAvailableStopPoints([])
    } catch (err) {
      console.error('Error fetching data:', err)
    }
  }

  useEffect(() => {
    fetchData()
    loadPendingOrders()
    loadAssignmentsFromDatabase()
  }, [])

  // Sync vehicleAssignments with selected tab when day assignments change
  useEffect(() => {
    if (selectedDate === 'today' && todayAssignments.length > 0) {
      setVehicleAssignments(todayAssignments)
    } else if (selectedDate === 'tomorrow' && tomorrowAssignments.length > 0) {
      setVehicleAssignments(tomorrowAssignments)
    } else if (selectedDate === 'dayafter' && dayAfterAssignments.length > 0) {
      setVehicleAssignments(dayAfterAssignments)
    }
  }, [todayAssignments, tomorrowAssignments, dayAfterAssignments, selectedDate])

  const loadAssignmentsFromDatabase = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const dayAfter = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().split('T')[0]

      console.log('Loading assignments from database for dates:', { today, tomorrow, dayAfter })

      // Get all orders scheduled for 3-day period
      const { data: assignedOrders } = await supabase
        .from('pending_orders')
        .select('*')
        .in('scheduled_date', [today, tomorrow, dayAfter])
        .not('assigned_vehicle_id', 'is', null)

      console.log('Found assigned orders:', assignedOrders?.length || 0)

      // Get route data for all vehicles
      const { data: vehicleRoutes } = await supabase
        .from('vehicle_routes')
        .select('vehicle_id, scheduled_date, distance, duration')
        .in('scheduled_date', [today, tomorrow, dayAfter])

      const routeMap = new Map()
      vehicleRoutes?.forEach(route => {
        routeMap.set(`${route.vehicle_id}-${route.scheduled_date}`, route)
      })

      if (assignedOrders && assignedOrders.length > 0) {
        // Get all vehicles and drivers
        const [{ data: allVehicles }, { data: allDrivers }] = await Promise.all([
          supabase.from('vehiclesc').select('*'),
          supabase.from('drivers').select('id, first_name, surname, available')
        ])

        // Group orders by vehicle and date
        const createAssignmentsForDate = (dateStr: string) => {
          const vehicleMap = new Map()
          const dateOrders = assignedOrders.filter(o => o.scheduled_date === dateStr)

          dateOrders.forEach(order => {
            const vehicleId = order.assigned_vehicle_id
            const vehicle = allVehicles?.find(v => v.id === vehicleId)
            const driver = order.assigned_driver_id ? allDrivers?.find(d => d.id === order.assigned_driver_id) : null

            if (vehicle) {
              if (!vehicleMap.has(vehicleId)) {
                const routeKey = `${vehicleId}-${dateStr}`
                const routeData = routeMap.get(routeKey)
                vehicleMap.set(vehicleId, {
                  vehicle: vehicle,
                  assignedOrders: [],
                  totalWeight: 0,
                  capacity: parseInt(vehicle.load_capacity) || 0,
                  utilization: 0,
                  assignedDrivers: driver ? [driver] : [],
                  destinationGroup: null,
                  routeDistance: routeData?.distance ? Math.round(routeData.distance) : null,
                  routeDuration: routeData?.duration ? Math.round(routeData.duration) : null
                })
              }

              const assignment = vehicleMap.get(vehicleId)
              const orderWithZone = {
                ...order,
                customerName: order.customer_name,
                tripId: order.trip_id,
                totalWeight: order.total_weight,
                location_group: order.location_group,
                locationGroup: order.location_group
              }
              assignment.assignedOrders.push(orderWithZone)
              assignment.totalWeight += order.total_weight
              
              // Set vehicle's destination group from stored destination_group
              if (order.destination_group && !assignment.destinationGroup) {
                assignment.destinationGroup = order.destination_group
              }
              
              console.log(`Order ${order.customer_name} has location_group: ${order.location_group}`)
            }
          })

          const assignments = Array.from(vehicleMap.values())
          assignments.forEach(a => {
            a.utilization = a.capacity > 0 ? (a.totalWeight / a.capacity) * 100 : 0
          })

          return assignments
        }

        const todayAssigns = createAssignmentsForDate(today)
        const tomorrowAssigns = createAssignmentsForDate(tomorrow)
        const dayAfterAssigns = createAssignmentsForDate(dayAfter)

        console.log('Created assignments:', {
          today: todayAssigns.length,
          tomorrow: tomorrowAssigns.length,
          dayAfter: dayAfterAssigns.length
        })

        setTodayAssignments(todayAssigns)
        setTomorrowAssignments(tomorrowAssigns)
        setDayAfterAssignments(dayAfterAssigns)
        setVehicleAssignments(todayAssigns)
        
        console.log('Assignments loaded and set successfully')
      }
    } catch (error) {
      console.error('Error loading assignments:', error)
    }
  }

  // Vehicle type options
  const vehicleTypeOptions = [
    'TAUTLINER',
    'TAUT X-BRDER - BOTSWANA',
    'TAUT X-BRDER - NAMIBIA',
    'CITRUS LOAD (+1 DAY STANDING FPT)',
    '14M/15M COMBO (NEW)',
    '14M/15M REEFER',
    '9 METER (NEW)',
    '8T JHB (NEW - EPS)',
    '8T JHB (NEW) - X-BRDER - MOZ',
    '8T JHB (OLD)',
    '14 TON CURTAIN',
    '1TON BAKKIE'
  ]

  // Filter vehicles based on selected type
  const filteredVehicles = useMemo(() => {
    if (!selectedVehicleType) return vehicles

    const keywords = {
      'TAUTLINER': ['taut', 'liner'],
      'TAUT X-BRDER - BOTSWANA': ['taut', 'botswana', 'x-border'],
      'TAUT X-BRDER - NAMIBIA': ['taut', 'namibia', 'x-border'],
      'CITRUS LOAD (+1 DAY STANDING FPT)': ['citrus', 'fpt'],
      '14M/15M COMBO (NEW)': ['14m', '15m', 'combo'],
      '14M/15M REEFER': ['14m', '15m', 'reefer'],
      '9 METER (NEW)': ['9m', '9 meter'],
      '8T JHB (NEW - EPS)': ['8t', '8 ton', 'jhb'],
      '8T JHB (NEW) - X-BRDER - MOZ': ['8t', '8 ton', 'jhb', 'moz'],
      '8T JHB (OLD)': ['8t', '8 ton', 'jhb', 'old'],
      '14 TON CURTAIN': ['14 ton', 'curtain'],
      '1TON BAKKIE': ['1 ton', 'bakkie']
    }

    const typeKeywords = keywords[selectedVehicleType] || []

    return vehicles.filter(vehicle => {
      const searchText = `${vehicle.model || vehicle.make || ''}`.toLowerCase()
      return typeKeywords.some(keyword => searchText.includes(keyword.toLowerCase()))
    })
  }, [vehicles, selectedVehicleType])

  // Memoized vehicle and driver lookups
  const vehicleMap = useMemo(() =>
    new Map(vehicles.map(v => [v.id, v.registration_number])), [vehicles]
  )

  const driverMap = useMemo(() =>
    new Map(drivers.map(d => [d.id, `${d.first_name} ${d.surname}`])), [drivers]
  )

  // Calculate distance between two coordinates
  const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
    const R = 6371 // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }, [])

  // Get pickup location coordinates using Mapbox
  const getPickupCoordinates = useCallback(async (location) => {
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
  }, [])

  // Get sorted drivers by distance from pickup location
  const getSortedDriversByDistance = useCallback(async (pickupLocation) => {
    if (!pickupLocation) return drivers

    const pickupCoords = await getPickupCoordinates(pickupLocation)
    if (!pickupCoords) return drivers

    // Use stored vehicle tracking data
    const driversWithDistance = drivers.map(driver => {
      // Find matching vehicle by driver name
      const trackingData = Array.isArray(vehicleTrackingData) ? vehicleTrackingData : []
      const driverFullName = `${driver.first_name} ${driver.surname}`.trim().toLowerCase()
      const matchingVehicle = trackingData.find(vehicle =>
        vehicle.driver_name &&
        vehicle.driver_name.toLowerCase() === driverFullName
      )

      if (matchingVehicle?.latitude && matchingVehicle?.longitude) {
        const distance = calculateDistance(
          pickupCoords.lat, pickupCoords.lon,
          parseFloat(matchingVehicle.latitude), parseFloat(matchingVehicle.longitude)
        )
        return { ...driver, distance: Math.round(distance * 10) / 10 }
      }

      return { ...driver, distance: null }
    })

    // Sort by distance (closest first, then drivers without coordinates)
    return driversWithDistance.sort((a, b) => {
      if (a.distance === null && b.distance === null) return 0
      if (a.distance === null) return 1
      if (b.distance === null) return -1
      return a.distance - b.distance
    })
  }, [drivers, calculateDistance, getPickupCoordinates, vehicleTrackingData])

  // State for sorted drivers
  const [sortedDrivers, setSortedDrivers] = useState(drivers)
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false)



  // Preview route when locations change - get Mapbox timing data
  useEffect(() => {
    const previewRoute = async () => {
      console.log('Route preview triggered:', { loadingLocation, dropOffPoint, stopPoints, customStopPoints })
      if (!loadingLocation || !dropOffPoint) {
        setOptimizedRoute(null)
        return
      }

      setIsOptimizing(true)
      try {
        const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
        if (!mapboxToken) {
          setIsOptimizing(false)
          return
        }

        // Check if we have driver location for complete route
        const firstDriver = driverAssignments[0]
        let driverLocation = null

        if (firstDriver?.id) {
          const driver = drivers.find(d => d.id === firstDriver.id)
          if (driver) {
            const driverFullName = `${driver.first_name} ${driver.surname}`.trim().toLowerCase()
            const trackingData = Array.isArray(vehicleTrackingData) ? vehicleTrackingData : []
            const matchingVehicle = trackingData.find(vehicle =>
              vehicle.driver_name &&
              vehicle.driver_name.toLowerCase() === driverFullName
            )

            if (matchingVehicle?.latitude && matchingVehicle?.longitude) {
              driverLocation = {
                lat: parseFloat(matchingVehicle.latitude),
                lng: parseFloat(matchingVehicle.longitude)
              }
            }
          }
        }

        // Get stop points data if available
        let stopPointsData = []
        if (stopPoints.length > 0 || customStopPoints.some(p => p)) {
          try {
            stopPointsData = await getSelectedStopPointsData()
            console.log('Stop points data for route:', stopPointsData)
            // Filter out invalid stop points
            stopPointsData = stopPointsData.filter(point =>
              point && point.coordinates && point.coordinates.length > 0
            )
          } catch (error) {
            console.error('Error getting stop points data:', error)
            stopPointsData = []
          }
        }

        // Geocode loading and drop-off locations
        const [loadingResponse, dropOffResponse] = await Promise.all([
          fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(loadingLocation)}.json?access_token=${mapboxToken}&country=za&limit=1`),
          fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(dropOffPoint)}.json?access_token=${mapboxToken}&country=za&limit=1`)
        ])

        const [loadingData, dropOffData] = await Promise.all([
          loadingResponse.json(),
          dropOffResponse.json()
        ])

        if (loadingData.features?.[0] && dropOffData.features?.[0]) {
          const loadingCoords = loadingData.features[0].center
          const dropOffCoords = dropOffData.features[0].center

          // Build waypoints string including stop points
          let waypoints = `${loadingCoords[0]},${loadingCoords[1]}`

          // Add stop points as waypoints
          if (stopPointsData.length > 0) {
            const stopWaypoints = stopPointsData.map(point => {
              const coords = point.coordinates
              const avgLng = coords.reduce((sum, coord) => sum + coord[0], 0) / coords.length
              const avgLat = coords.reduce((sum, coord) => sum + coord[1], 0) / coords.length
              return `${avgLng},${avgLat}`
            }).filter(waypoint => waypoint && !waypoint.includes('NaN'))

            if (stopWaypoints.length > 0) {
              waypoints += `;${stopWaypoints.join(';')}`
            }
          }

          waypoints += `;${dropOffCoords[0]},${dropOffCoords[1]}`

          // If we have driver location, create complete route: driver → loading → stops → drop-off
          if (driverLocation) {
            waypoints = `${driverLocation.lng},${driverLocation.lat};${waypoints}`
          }

          console.log('Calculating route with waypoints:', waypoints)

          // Always use directions API for now to avoid complexity
          const apiEndpoint = `https://api.mapbox.com/directions/v5/mapbox/driving/${waypoints}`
          const apiParams = 'geometries=geojson&overview=full&annotations=duration,distance&exclude=ferry'

          const directionsResponse = await fetch(
            `${apiEndpoint}?access_token=${mapboxToken}&${apiParams}`
          )

          if (!directionsResponse.ok) {
            console.error('API request failed:', directionsResponse.status, directionsResponse.statusText)
            setOptimizedRoute(null)
            return
          }

          const directionsData = await directionsResponse.json()
          console.log('Directions API response:', directionsData)

          if (directionsData.code !== 'Ok') {
            console.error('API returned error:', directionsData)
            setOptimizedRoute(null)
            return
          }

          const route = directionsData.routes?.[0]
          if (route) {
            const routeInfo = {
              route: route,
              distance: route.distance,
              duration: route.duration,
              hasDriverLocation: !!driverLocation,
              stopPoints: stopPointsData,
              geometry: route.geometry
            }
            console.log('Setting optimized route:', routeInfo)
            setOptimizedRoute(routeInfo)
          } else {
            console.error('No routes found:', directionsData)
            setOptimizedRoute(null)
          }
        }
      } catch (error) {
        console.error('Route preview failed:', error)
        setOptimizedRoute(null)
      }
      setIsOptimizing(false)
    }

    // Add a small delay to prevent too frequent updates
    const timeoutId = setTimeout(previewRoute, 500)
    return () => clearTimeout(timeoutId)
  }, [loadingLocation, dropOffPoint, stopPoints, customStopPoints, driverAssignments, isManuallyOrdered])



  // Update sorted drivers when pickup location changes
  useEffect(() => {
    if (loadingLocation) {
      // Refresh vehicle tracking data when location changes
      fetch('http://64.227.138.235:3000/api/eps-vehicles')
        .then(response => response.json())
        .then(trackingData => {
          const vehicleData = trackingData?.result?.data || trackingData?.data || trackingData || []
          setVehicleTrackingData(vehicleData)
          return getSortedDriversByDistance(loadingLocation)
        })
        .then((sorted) => {
          setSortedDrivers(sorted)
          const availableWithDistance = sorted.filter(d => d.available === true)
          setAvailableDrivers(availableWithDistance)
        })
        .catch(error => {
          console.error('Error updating driver distances:', error)
        })
    } else {
      setSortedDrivers(drivers)
      setAvailableDrivers(drivers.filter(d => d.available === true))
    }
  }, [loadingLocation])

  // Calculate estimated distance when locations change
  useEffect(() => {
    const calculateRouteDistance = async () => {
      if (!loadingLocation || !dropOffPoint) {
        console.log('Missing locations for distance calc:', { loadingLocation, dropOffPoint })
        setEstimatedDistance(0)
        return
      }

      try {
        const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
        if (!mapboxToken) {
          console.log('No Mapbox token available')
          return
        }

        console.log('Calculating distance between:', loadingLocation, 'and', dropOffPoint)

        // First geocode the locations to get coordinates
        const [originResponse, destResponse] = await Promise.all([
          fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(loadingLocation)}.json?access_token=${mapboxToken}&country=za&limit=1`),
          fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(dropOffPoint)}.json?access_token=${mapboxToken}&country=za&limit=1`)
        ])

        const [originData, destData] = await Promise.all([
          originResponse.json(),
          destResponse.json()
        ])

        if (!originData.features?.[0] || !destData.features?.[0]) {
          console.log('Could not geocode locations')
          return
        }

        const originCoords = originData.features[0].center
        const destCoords = destData.features[0].center

        console.log('Origin coords:', originCoords, 'Dest coords:', destCoords)

        const response = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${originCoords[0]},${originCoords[1]};${destCoords[0]},${destCoords[1]}?access_token=${mapboxToken}&geometries=geojson`
        )
        const data = await response.json()
        console.log('Mapbox response:', data)

        if (data.routes?.[0]?.distance) {
          const distanceKm = Math.round(data.routes[0].distance / 1000)
          console.log('Distance calculated:', distanceKm, 'km')
          setEstimatedDistance(distanceKm)
        } else {
          console.log('No route found in response')
        }
      } catch (error) {
        console.error('Error calculating distance:', error)
      }
    }

    calculateRouteDistance()
  }, [loadingLocation, dropOffPoint])

  // Rate Card Calculation Function
  const calculateRateCardCost = useCallback((vehicleType, kms, days) => {
    if (!vehicleType || !RATE_CARD_SYSTEM[vehicleType]) {
      return {
        fuel_cost: 0,
        base_cost: 0,
        transport_cost: 0,
        extra_stop_cost: 0,
        standing_day_cost: 0,
        profit_amount: 0,
        total_transport: 0,
        ppk_cost: 0
      }
    }

    const rateCard = RATE_CARD_SYSTEM[vehicleType]

    // Rate Card Components
    const fuel_cost = rateCard.fuel_rate // Fixed fuel component
    const base_cost = rateCard.base_rate // Fixed base rate
    const ppk_cost = kms * rateCard.ppk  // Per kilometer cost
    const extra_stop_cost = rateCard.extra_stop || 0
    const standing_day_cost = (rateCard.standing_day_cost || 0) * (days > 1 ? days - 1 : 0)

    // Transport Cost = Fuel + Base + PPK + Standing Days
    const transport_cost = fuel_cost + base_cost + ppk_cost + standing_day_cost

    // Profit Calculation
    const profit_amount = transport_cost * rateCard.profit_margin

    // Total Transport = Transport + Profit + Extra Stops
    const total_transport = transport_cost + profit_amount + extra_stop_cost

    return {
      fuel_cost,
      base_cost,
      transport_cost,
      extra_stop_cost,
      standing_day_cost,
      profit_amount,
      total_transport,
      ppk_cost
    }
  }, [RATE_CARD_SYSTEM])

  // Calculate costs when relevant values change
  useEffect(() => {
    if (selectedVehicleType && estimatedDistance > 0) {
      const costBreakdown = calculateRateCardCost(selectedVehicleType, estimatedDistance, tripDays)

      setApproximateFuelCost(costBreakdown.fuel_cost)
      setApproximatedVehicleCost(costBreakdown.base_cost + costBreakdown.ppk_cost)
      setApproximatedDriverCost(costBreakdown.standing_day_cost + costBreakdown.extra_stop_cost)
      setTotalVehicleCost(costBreakdown.total_transport)

      // CPK = total cost per kilometer
      const cpk = estimatedDistance > 0 ? costBreakdown.total_transport / estimatedDistance : 0
      setApproximatedCPK(cpk)
    } else {
      // Reset values when no vehicle type selected
      setApproximateFuelCost(0)
      setApproximatedVehicleCost(0)
      setApproximatedDriverCost(0)
      setTotalVehicleCost(0)
      setApproximatedCPK(0)
    }
  }, [selectedVehicleType, estimatedDistance, tripDays, calculateRateCardCost])

  // Note: Vehicle and driver costs are now handled by the rate card system
  // Legacy cost calculations removed to prevent conflicts with rate card system

  // Calculate total cost using rate card system
  useEffect(() => {
    if (selectedVehicleType && estimatedDistance > 0) {
      const costBreakdown = calculateRateCardCost(selectedVehicleType, estimatedDistance, tripDays)
      const total = costBreakdown.total_transport + (parseFloat(goodsInTransitPremium) || 0)
      setTotalVehicleCost(total)
    } else {
      const total = approximateFuelCost + approximatedVehicleCost + approximatedDriverCost + (parseFloat(goodsInTransitPremium) || 0)
      setTotalVehicleCost(total)
    }
  }, [selectedVehicleType, estimatedDistance, tripDays, approximateFuelCost, approximatedVehicleCost, approximatedDriverCost, goodsInTransitPremium, calculateRateCardCost])

  // Calculate distance from point to route line
  const distanceToRoute = useCallback((pointLat, pointLng, routeCoords) => {
    if (!routeCoords || routeCoords.length < 2) return Infinity

    let minDistance = Infinity
    for (let i = 0; i < routeCoords.length - 1; i++) {
      const [lng1, lat1] = routeCoords[i]
      const [lng2, lat2] = routeCoords[i + 1]

      // Distance from point to line segment
      const A = pointLat - lat1
      const B = pointLng - lng1
      const C = lat2 - lat1
      const D = lng2 - lng1

      const dot = A * C + B * D
      const lenSq = C * C + D * D
      let param = -1
      if (lenSq !== 0) param = dot / lenSq

      let xx, yy
      if (param < 0) {
        xx = lat1
        yy = lng1
      } else if (param > 1) {
        xx = lat2
        yy = lng2
      } else {
        xx = lat1 + param * C
        yy = lng1 + param * D
      }

      const distance = calculateDistance(pointLat, pointLng, xx, yy)
      minDistance = Math.min(minDistance, distance)
    }
    return minDistance
  }, [calculateDistance])

  // Filter stop points within 25km of route and between origin/destination
  const filteredStopPoints = useMemo(() => {
    if (!loadingLocation || !dropOffPoint || !optimizedRoute?.route?.geometry?.coordinates) {
      return availableStopPoints
    }

    const routeCoords = optimizedRoute.route.geometry.coordinates
    const [originLng, originLat] = routeCoords[0]
    const [destLng, destLat] = routeCoords[routeCoords.length - 1]

    return availableStopPoints.filter(point => {
      if (!point.coordinates) return false

      try {
        const coordPairs = point.coordinates.split(' ')
          .filter(coord => coord.trim())
          .map(coord => {
            const [lng, lat] = coord.split(',')
            return [parseFloat(lng), parseFloat(lat)]
          })
          .filter(pair => !isNaN(pair[0]) && !isNaN(pair[1]))

        if (coordPairs.length === 0) return false

        // Use centroid of stop point polygon
        const avgLng = coordPairs.reduce((sum, coord) => sum + coord[0], 0) / coordPairs.length
        const avgLat = coordPairs.reduce((sum, coord) => sum + coord[1], 0) / coordPairs.length

        // Check if within 25km of route
        const distance = distanceToRoute(avgLat, avgLng, routeCoords)
        if (distance > 25) return false

        // Check if between origin and destination
        const distToOrigin = calculateDistance(avgLat, avgLng, originLat, originLng)
        const distToDest = calculateDistance(avgLat, avgLng, destLat, destLng)
        const originToDestDist = calculateDistance(originLat, originLng, destLat, destLng)

        // Point is between origin and destination if sum of distances is roughly equal to direct distance
        return (distToOrigin + distToDest) <= (originToDestDist * 1.2) // 20% tolerance
      } catch (error) {
        return false
      }
    })
  }, [availableStopPoints, loadingLocation, dropOffPoint, optimizedRoute, distanceToRoute, calculateDistance])

  // Get selected stop points with coordinates including custom locations
  const getSelectedStopPointsData = useCallback(async () => {
    console.log('getSelectedStopPointsData called with:', { stopPoints, customStopPoints, availableStopPoints: availableStopPoints.length })

    // Ensure stop points are loaded if not already available
    if (availableStopPoints.length === 0 && (stopPoints.length > 0 || customStopPoints.some(p => p))) {
      console.log('Loading stop points from database...')
      try {
        const { data: stopPointsData, error: stopPointsError } = await supabase
          .from('stop_points')
          .select('id, name, name2, coordinates')
          .order('name')

        if (stopPointsError) {
          console.error('Stop points error:', stopPointsError)
        } else {
          setAvailableStopPoints(stopPointsData || [])
          console.log('Loaded stop points:', stopPointsData?.length || 0)
        }
      } catch (err) {
        console.error('Error fetching stop points:', err)
      }
    }

    const results = []

    for (let i = 0; i < stopPoints.length; i++) {
      const pointId = stopPoints[i]
      const customLocation = customStopPoints[i]
      console.log(`Processing stop point ${i}:`, { pointId, customLocation })

      if (customLocation) {
        // Geocode custom location
        try {
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(customLocation)}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&country=za&limit=1`
          )
          const data = await response.json()
          if (data.features?.[0]) {
            const [lng, lat] = data.features[0].center
            results.push({
              id: `custom_${i}`,
              name: customLocation,
              coordinates: [[lng, lat]]
            })
          }
        } catch (error) {
          console.error('Error geocoding custom location:', error)
        }
      } else if (pointId) {
        // Use existing stop point - use current availableStopPoints or fetch directly
        let point = availableStopPoints.find(p => p.id.toString() === pointId)

        // If not found in current array, fetch directly from database
        if (!point) {
          console.log('Stop point not found in cache, fetching from database...')
          try {
            const { data: pointData, error } = await supabase
              .from('stop_points')
              .select('id, name, name2, coordinates')
              .eq('id', pointId)
              .single()

            if (!error && pointData) {
              point = pointData
              console.log('Fetched stop point from database:', point)
            }
          } catch (err) {
            console.error('Error fetching individual stop point:', err)
          }
        }

        console.log('Found stop point for ID', pointId, ':', point)
        if (point?.coordinates) {
          try {
            const coordPairs = point.coordinates.split(' ')
              .filter(coord => coord.trim())
              .map(coord => {
                const [lng, lat] = coord.split(',')
                return [parseFloat(lng), parseFloat(lat)]
              })
              .filter(pair => !isNaN(pair[0]) && !isNaN(pair[1]))

            console.log('Parsed coordinates:', coordPairs)
            results.push({
              id: point.id,
              name: point.name,
              coordinates: coordPairs
            })
          } catch (error) {
            console.error('Error parsing coordinates:', error)
          }
        } else {
          console.log('No coordinates found for point:', pointId)
          console.log('Point found but no coordinates:', point)
        }
      }
    }

    console.log('getSelectedStopPointsData returning:', results)
    return results
  }, [stopPoints, customStopPoints, availableStopPoints])

  // Optimized handlers with useCallback
  const handleDriverChange = useCallback((driverIndex, driverId) => {
    const selectedDriver = drivers.find(d => d.id === driverId)
    setDriverAssignments(prev => {
      const updated = [...prev]
      updated[driverIndex] = {
        id: driverId,
        name: selectedDriver?.surname || '',
        first_name: selectedDriver?.first_name || '',
        surname: selectedDriver?.surname || ''
      }
      return updated
    })

    // Show driver location on map
    if (selectedDriver) {
      const driverFullName = `${selectedDriver.first_name} ${selectedDriver.surname}`.trim().toLowerCase()
      const trackingData = Array.isArray(vehicleTrackingData) ? vehicleTrackingData : []
      const matchingVehicle = trackingData.find(vehicle =>
        vehicle.driver_name &&
        vehicle.driver_name.toLowerCase() === driverFullName
      )

      if (matchingVehicle?.latitude && matchingVehicle?.longitude) {
        setSelectedDriverLocation({
          driver: selectedDriver,
          vehicle: matchingVehicle,
          latitude: parseFloat(matchingVehicle.latitude),
          longitude: parseFloat(matchingVehicle.longitude)
        })
        // Force route recalculation when driver changes
        setOptimizedRoute(null)
      } else {
        setSelectedDriverLocation(null)
      }
    } else {
      setSelectedDriverLocation(null)
    }
  }, [drivers, vehicleTrackingData])

  const addDriver = useCallback(() => {
    setDriverAssignments(prev => [...prev, { id: '', name: '' }])
  }, [])

  // Auto-select closest driver when dropdown is opened
  const handleDriverDropdownOpen = useCallback(async (driverIndex) => {
    if (!loadingLocation) return

    setIsCalculatingDistance(true)
    try {
      // Refresh vehicle tracking data first
      const trackingResponse = await fetch('http://64.227.138.235:3000/api/eps-vehicles')
      const trackingData = await trackingResponse.json()
      const vehicleData = trackingData?.result?.data || trackingData?.data || trackingData || []
      setVehicleTrackingData(vehicleData)

      const sorted = await getSortedDriversByDistance(loadingLocation)
      setSortedDrivers(sorted)

      // Auto-select closest driver if available
      const closestDriver = sorted.find(d => d.distance !== null)
      if (closestDriver) {
        handleDriverChange(driverIndex, closestDriver.id)
      }
    } catch (error) {
      console.error('Error calculating driver distances:', error)
    }
    setIsCalculatingDistance(false)
  }, [loadingLocation, getSortedDriversByDistance, handleDriverChange])

  // Helper to get assigned vehicles/drivers display
  const getAssignmentsDisplay = (load) => {
    const assignments = load.vehicleAssignments || load.vehicle_assignments || []
    if (!assignments.length) return 'Unassigned'

    return assignments.map(assignment => {
      const vehicleName = assignment.vehicle?.name || 'Unknown Vehicle'
      const driverNames = assignment.drivers?.map(d => d.name).filter(Boolean).join(', ') || 'No Driver'
      return `${vehicleName} (${driverNames})`
    }).join('; ')
  }

  // Parse JSON fields safely
  const parseJsonField = (field) => {
    if (!field) return []
    if (Array.isArray(field)) return field
    try {
      return JSON.parse(field)
    } catch {
      return []
    }
  }

  const [summaryOpen, setSummaryOpen] = useState(false)
  const [selectedLoad, setSelectedLoad] = useState<any | null>(null)
  // Routing assigned items
  const [assignedItems, setAssignedItems] = useState<any[]>([])
  // Left items available to assign
  const [leftItems, setLeftItems] = useState<any[]>([
    { id: 'a', title: 'VINCEMUS INVESTMENTS (P...)', addr: 'Johannesburg, South Africa', addr2: 'Estcourt, 3310, South Africa' },
    { id: 'b', title: 'TRADELANDER 5 CC', addr: 'Randfontein, South Africa' }
  ])

  const handleCreateClick = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    if (!client || !commodity || !loadingLocation || !dropOffPoint) {
      showToast('Please fill out all required fields', 'error')
      return
    }

    handleCreate()
  }

  const handleClientSelect = (clientData) => {
    if (typeof clientData === 'object' && clientData.coordinates) {
      setSelectedClient(clientData)
      setClient(clientData.name)
      setManualClientName('') // Clear manual input
      setShowAddressPopup(true)
    } else {
      setClient(typeof clientData === 'string' ? clientData : clientData?.name || '')
      setSelectedClient(clientData)
      setManualClientName('') // Clear manual input
    }
  }

  const handleUseAsPickup = () => {
    if (selectedClient?.coordinates) {
      try {
        const coords = selectedClient.coordinates.split(' ')[0].split(',')
        if (coords.length >= 2) {
          const lng = parseFloat(coords[0])
          const lat = parseFloat(coords[1])
          if (!isNaN(lng) && !isNaN(lat)) {
            fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`)
              .then(response => response.json())
              .then(data => {
                if (data.features && data.features.length > 0) {
                  setLoadingLocation(data.features[0].place_name)
                } else {
                  setLoadingLocation(`${lat},${lng}`)
                }
              })
              .catch(() => setLoadingLocation(`${lat},${lng}`))
          }
        }
      } catch (error) {
        console.error('Error parsing coordinates:', error)
      }
    }
    setShowAddressPopup(false)
  }

  const handleUseAsDropoff = () => {
    if (selectedClient?.coordinates) {
      try {
        const coords = selectedClient.coordinates.split(' ')[0].split(',')
        if (coords.length >= 2) {
          const lng = parseFloat(coords[0])
          const lat = parseFloat(coords[1])
          if (!isNaN(lng) && !isNaN(lat)) {
            fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`)
              .then(response => response.json())
              .then(data => {
                if (data.features && data.features.length > 0) {
                  setDropOffPoint(data.features[0].place_name)
                } else {
                  setDropOffPoint(`${lat},${lng}`)
                }
              })
              .catch(() => setDropOffPoint(`${lat},${lng}`))
          }
        }
      } catch (error) {
        console.error('Error parsing coordinates:', error)
      }
    }
    setShowAddressPopup(false)
  }

  const handleSkipAddress = () => {
    setShowAddressPopup(false)
  }



  // Excel upload handlers
  const handleExcelFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setExcelFile(selectedFile)
      setExcelError(null)
      setExcelSuccess(null)
    }
  }

  const parseExcelFile = async () => {
    if (!excelFile) return

    setIsProcessingExcel(true)
    setExcelError(null)

    try {
      // Read Excel file
      const arrayBuffer = await excelFile.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[]

      if (jsonData.length < 2) {
        throw new Error('Excel file must contain at least a header row and one data row')
      }

      // Get existing customers from customers table
      const { data: existingCustomers } = await supabase
        .from('customers')
        .select('customer_id, latitude, longitude, address, zone')

      const customerMap = new Map(existingCustomers?.map(c => [c.customer_id, c]) || [])

      // Parse data rows
      const orders: any[] = []
      const detectedNewClients: Array<{id: string, name: string, location: string}> = []

      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i]
        if (!row || row.length < 8) continue

        const [
          delivery,
          shipToParty,
          nameOfShipToParty,
          shippingPoint,
          totalWeight,
          locationOfShipToParty,
          deliveryDate,
          netWeight,
          drums = ''
        ] = row

        if (!delivery || !shipToParty || !nameOfShipToParty) continue

        const customerId = String(shipToParty).trim()
        const customerName = String(nameOfShipToParty).trim()
        const location = String(locationOfShipToParty || '').trim()
        const existingCustomer = customerMap.get(customerId)
        const isNewClient = !existingCustomer

        if (isNewClient && !detectedNewClients.find(c => c.id === customerId)) {
          detectedNewClients.push({ id: customerId, name: customerName, location })
        }

        // Use customer's stored location if available, otherwise use from Excel
        const orderLocation = existingCustomer?.address || location
        const orderLat = existingCustomer?.latitude || null
        const orderLng = existingCustomer?.longitude || null
        const orderZone = existingCustomer?.zone || null

        orders.push({
          trip_id: String(delivery).trim(),
          customer_id: customerId,
          customer_name: customerName,
          shipping_point: String(shippingPoint || '').trim(),
          total_weight: parseFloat(String(totalWeight)) || 0,
          location: orderLocation,
          delivery_date: String(deliveryDate || '').trim(),
          net_weight: parseFloat(String(netWeight)) || 0,
          drums: parseFloat(String(drums)) || 0,
          status: 'unassigned',
          latitude: orderLat,
          longitude: orderLng,
          location_group: orderZone,
          needs_customer_setup: !existingCustomer
        })
      }

      // Geocode only orders that need it (new customers without coordinates)
      // Check for new customers and prompt for location
      if (detectedNewClients.length > 0) {
        setIsProcessingExcel(false)
        setParsedOrders(orders)
        ;(window as any).pendingCustomers = detectedNewClients
        setPendingCustomer(detectedNewClients[0])
        setShowNewCustomerModal(true)
        return
      }

      const ordersNeedingGeocode = orders.filter(o => !o.latitude || !o.longitude)
      
      if (ordersNeedingGeocode.length > 0) {
        const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
        if (!mapboxToken) {
          throw new Error('Mapbox token not found - cannot geocode locations')
        }

        console.log(`Starting geocoding for ${ordersNeedingGeocode.length} orders...`)
        let successCount = 0
        const failedOrders = []

        for (const order of ordersNeedingGeocode) {
          if (!order.location) {
            console.error(`Order ${order.trip_id} has no location`)
            failedOrders.push({ order: order.trip_id, location: 'MISSING', reason: 'No location provided' })
            continue
          }

          try {
            const result = await geocodeWithRules(order.customer_name, order.location, mapboxToken)
            
            if (!result) {
              console.error(`❌ No results for "${order.location}"`)
              failedOrders.push({ order: order.trip_id, location: order.location, reason: 'Location not found by Mapbox' })
              continue
            }

            order.latitude = result.lat
            order.longitude = result.lng
            order.location_group = result.location_group
            successCount++
            console.log(`✓ Geocoded "${order.location}" → ${order.location_group} (${result.place_name})`)
          } catch (error) {
            console.error(`❌ Geocoding error for "${order.location}":`, error)
            failedOrders.push({ order: order.trip_id, location: order.location, reason: error.message })
          }
        }

        console.log(`Geocoding complete: ${successCount} success, ${failedOrders.length} failed`)

        if (failedOrders.length > 0) {
          console.error('Failed geocoding details:', failedOrders)
          throw new Error(
            `Geocoding failed for ${failedOrders.length} order(s):\n` +
            failedOrders.map(f => `- ${f.order}: "${f.location}" (${f.reason})`).join('\n')
          )
        }
      } else {
        console.log('All orders have coordinates from customer records')
      }

      // Save to pending_orders table
      const { error: insertError } = await supabase
        .from('pending_orders')
        .insert(orders)

      if (insertError) throw insertError

      // Load from database
      await loadPendingOrders()

      setParsedOrders(orders)
      setNewClients(detectedNewClients)
      
      // Check for new customers that need setup
      const newCustomerIds = orders
        .filter(o => o.needs_customer_setup)
        .map(o => ({ id: o.customer_id, name: o.customer_name, location: o.location }))
        .filter((v, i, a) => a.findIndex(t => t.id === v.id) === i)

      if (newCustomerIds.length > 0) {
        setExcelSuccess(`Successfully parsed ${orders.length} orders. ${newCustomerIds.length} new customer(s) need setup before assignment.`)
        // Store all pending customers and show modal for first one
        window.pendingCustomers = newCustomerIds
        setPendingCustomer(newCustomerIds[0])
        setShowNewCustomerModal(true)
      } else {
        setExcelSuccess(`Successfully parsed ${orders.length} orders. All orders in unassigned bucket. Ready for auto-assignment.`)
      }

    } catch (err) {
      console.error('Error parsing Excel file:', err)
      const errorMessage = err instanceof Error ? err.message : (typeof err === 'string' ? err : JSON.stringify(err) || 'Failed to parse Excel file')
      setExcelError(errorMessage)
    } finally {
      setIsProcessingExcel(false)
    }
  }

  const loadPendingOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('pending_orders')
        .select('*')
        .in('status', ['unassigned', 'scheduled', 'assigned', 'in-trip'])
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading pending orders:', error)
        setUnassignedOrders([])
        setHasUnknownLocations(false)
        return
      }

      if (data) {
        const orders = data.map(order => ({
          ...order,
          customerName: order.customer_name,
          tripId: order.trip_id,
          totalWeight: order.total_weight,
          location_group: order.location_group,
          priority: order.priority || 0
        }))
        setUnassignedOrders(orders)
        
        // Check if any orders have unknown locations
        const today = new Date().toISOString().split('T')[0]
        const hasUnknown = orders.some(o => 
          o.scheduled_date === today && (!o.latitude || !o.longitude)
        )
        setHasUnknownLocations(hasUnknown)
      } else {
        setUnassignedOrders([])
        setHasUnknownLocations(false)
      }
    } catch (err) {
      console.error('Error in loadPendingOrders:', err)
      setUnassignedOrders([])
      setHasUnknownLocations(false)
    }
  }

  const assignVehiclesToOrders = async () => {
    if (unassignedOrders.length === 0) return

    setIsProcessingExcel(true)
    setExcelError(null)

    try {
      // Insert new clients first
      const newClientsToInsert = unassignedOrders
        .filter(order => order.isNewClient)
        .map(order => ({
          id: parseInt(order.customerId),
          client_code: order.customerId,
          name: order.customerName,
          address: order.location,
          type: 'client'
        }))

      if (newClientsToInsert.length > 0) {
        const { error: clientInsertError } = await supabase
          .from('eps_client_list')
          .insert(newClientsToInsert)

        if (clientInsertError) {
          console.error('Error inserting new clients:', clientInsertError)
        } else {
          toast.success(`Added ${newClientsToInsert.length} new client(s) to database`)
        }
      }

      // Get vehicles with capacity and restrictions
      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from('vehiclesc')
        .select('id, registration_number, load_capacity, restrictions, vehicle_type, description')

      if (vehiclesError) throw new Error('Failed to fetch vehicles')

      // 72-Hour Cascading Assignment Logic with Incremental Support
      const today = new Date().toISOString().split('T')[0]
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const dayAfter = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().split('T')[0]

      let totalAssignedCount = 0
      let totalDriversAssigned = 0
      let allDayAssignments = { today: [], tomorrow: [], dayAfter: [] }

      // Get existing assignments from database to preserve them
      const { data: existingAssignments } = await supabase
        .from('pending_orders')
        .select('*, vehiclesc!inner(id, registration_number, load_capacity, restrictions)')
        .in('scheduled_date', [today, tomorrow, dayAfter])
        .eq('status', 'assigned')
        .not('assigned_vehicle_id', 'is', null)

      // Build existing vehicle assignments map
      const existingVehicleLoads = new Map()
      if (existingAssignments) {
        existingAssignments.forEach(order => {
          const key = `${order.assigned_vehicle_id}-${order.scheduled_date}`
          if (!existingVehicleLoads.has(key)) {
            existingVehicleLoads.set(key, {
              vehicleId: order.assigned_vehicle_id,
              date: order.scheduled_date,
              currentWeight: 0,
              orders: []
            })
          }
          const load = existingVehicleLoads.get(key)
          load.currentWeight += order.total_weight
          load.orders.push(order)
        })
      }

      // Get ONLY new unassigned orders (exclude orders already assigned to vehicles)
      let remainingOrders = unassignedOrders.filter(o => 
        o.status === 'unassigned' &&  // ONLY truly unassigned orders
        !o.assigned_vehicle_id &&      // No vehicle assigned
        !o.scheduled_date              // Not scheduled yet
      )
      console.log(`Starting 72-hour assignment with ${remainingOrders.length} new unassigned orders`)
      console.log(`Existing assignments: ${existingVehicleLoads.size} vehicle-date combinations`)
      console.log(`Filtered out ${unassignedOrders.length - remainingOrders.length} already-processed orders`)

      // Day 1: Assign to TODAY - but only to vehicles with remaining capacity and NOT on trip
      console.log('Day 1: Starting assignment with available capacity...')
      
      // Get vehicles that are currently on trips today
      const { data: vehiclesOnTrip } = await supabase
        .from('pending_orders')
        .select('assigned_vehicle_id')
        .eq('scheduled_date', today)
        .eq('status', 'in-trip')
      
      const vehicleIdsOnTrip = new Set(vehiclesOnTrip?.map(o => o.assigned_vehicle_id).filter(Boolean) || [])
      console.log(`Vehicles on trip today: ${vehicleIdsOnTrip.size}`, Array.from(vehicleIdsOnTrip))
      
      // Calculate remaining capacity for each vehicle TODAY
      const vehiclesWithCapacityToday = vehiclesData.map(vehicle => {
        const key = `${vehicle.id}-${today}`
        const existing = existingVehicleLoads.get(key)
        const usedCapacity = existing ? existing.currentWeight : 0
        const capacity = parseInt(vehicle.load_capacity) || 0
        const remainingCapacity = capacity - usedCapacity
        const isOnTrip = vehicleIdsOnTrip.has(vehicle.id)
        
        return {
          ...vehicle,
          load_capacity: remainingCapacity,
          originalCapacity: capacity,
          remainingCapacity,
          usedCapacity,
          hasCapacity: remainingCapacity > 0 && capacity > 0 && !isOnTrip
        }
      }).filter(v => v.hasCapacity)
      
      console.log(`Vehicles with remaining capacity today: ${vehiclesWithCapacityToday.length}/${vehiclesData.length}`)
      vehiclesWithCapacityToday.forEach(v => {
        console.log(`  ${v.registration_number}: ${v.remainingCapacity}kg remaining (${v.usedCapacity}kg used)`)
      })
      
      // Reset all drivers to available for today's assignment
      await resetAllDriversAvailable()
      const todayAssignments = await assignVehiclesWithDrivers(remainingOrders, vehiclesWithCapacityToday, 1)
      const todayAssignedIds = new Set()
      
      // Merge with existing assignments and preserve location_group
      todayAssignments.forEach(assignment => {
        const key = `${assignment.vehicle.id}-${today}`
        const existing = existingVehicleLoads.get(key)
        if (existing) {
          assignment.assignedOrders = [...existing.orders.map(o => ({...o, location_group: o.location_group})), ...assignment.assignedOrders]
          assignment.totalWeight += existing.currentWeight
          assignment.utilization = (assignment.totalWeight / assignment.capacity) * 100
        }
      })
      
      console.log('Starting database updates for today assignments...')
      for (const assignment of todayAssignments) {
        if (assignment.assignedOrders.length > 0) {
          console.log(`Vehicle ${assignment.vehicle.registration_number} (ID: ${assignment.vehicle.id}): ${assignment.assignedOrders.length} orders`)
          console.log(`Order location_groups:`, assignment.assignedOrders.map(o => o.location_group))
          console.log(`Assigned drivers array:`, assignment.assignedDrivers)
          
          const driverId = (assignment.assignedDrivers && assignment.assignedDrivers.length > 0) 
            ? assignment.assignedDrivers[0].id 
            : null
          console.log(`Driver ID to assign: ${driverId}`, assignment.assignedDrivers)
          
          if (!driverId) {
            console.warn(`⚠️ No driver assigned to vehicle ${assignment.vehicle.registration_number}`)
          }
          
          for (let idx = 0; idx < assignment.assignedOrders.length; idx++) {
            const order = assignment.assignedOrders[idx]
            if (!order.id) {
              console.error(`❌ Order missing ID, skipping:`, order)
              continue
            }
            
            // Preserve location_group from assignment
            const orderLocationGroup = order.location_group || order.locationGroup
            
            const { data: updateData, error: updateError} = await supabase
              .from('pending_orders')
              .update({
                status: 'assigned',
                assigned_vehicle_id: assignment.vehicle.id,
                assigned_driver_id: driverId,
                scheduled_date: today,
                delivery_sequence: idx + 1,
                location_group: orderLocationGroup,
                destination_group: assignment.destinationGroup
              })
              .eq('id', order.id)
              .select()
            
            if (updateError) {
              console.error(`❌ Error updating order ${order.id}:`, updateError.message)
            } else if (!updateData || updateData.length === 0) {
              console.error(`❌ Order ${order.id} not found or not updated`)
            } else {
              console.log(`✓ Assigned order ${order.id} to vehicle ${assignment.vehicle.id} for ${today} (zone: ${orderLocationGroup})`)
              todayAssignedIds.add(order.id)
            }
          }
          // Store route geometry for this vehicle
          if ((assignment as any).routeGeometry || assignment.routeDistance) {
            const geom = (assignment as any).routeGeometry
            let routeCoords = null
            
            if (geom) {
              // Handle different geometry formats
              if (geom.coordinates) {
                routeCoords = geom.coordinates
              } else if (Array.isArray(geom)) {
                routeCoords = geom
              }
            }
            
            const { error: routeError } = await supabase
              .from('vehicle_routes')
              .upsert({
                vehicle_id: assignment.vehicle.id,
                scheduled_date: today,
                route_geometry: routeCoords,
                distance: assignment.routeDistance || 0,
                duration: assignment.routeDuration || 0,
                updated_at: new Date().toISOString()
              }, {
                onConflict: 'vehicle_id,scheduled_date'
              })
            
            if (routeError) {
              console.error(`Failed to store route geometry for ${assignment.vehicle.registration_number}:`, routeError)
            } else {
              console.log(`✓ Stored route geometry for ${assignment.vehicle.registration_number}: ${routeCoords ? routeCoords.length : 0} points, ${assignment.routeDistance}km, ${assignment.routeDuration}min`)
            }
          }
          
          if (assignment.assignedDrivers && assignment.assignedDrivers.length > 0) {
            const driverIds = assignment.assignedDrivers.map(d => d.id)
            await updateDriverAvailability(driverIds, false)
            totalDriversAssigned += driverIds.length
            console.log(`✓ Marked ${driverIds.length} driver(s) unavailable: ${assignment.assignedDrivers.map(d => `${d.first_name} ${d.surname}`).join(', ')}`)
          }
        }
      }
      const todayCount = todayAssignments.flatMap(a => a.assignedOrders).length
      totalAssignedCount += todayCount
      allDayAssignments.today = todayAssignments
      const finalTodayCount = todayAssignments.reduce((sum, a) => sum + a.assignedOrders.length, 0)
      console.log(`Day 1: Assigned ${finalTodayCount} orders to ${todayAssignments.filter(a => a.assignedOrders.length > 0).length} vehicles (${todayCount} from Geoapify, ${finalTodayCount - todayCount} from greedy fit)`)

      // Check remaining orders
      remainingOrders = remainingOrders.filter(o => !todayAssignedIds.has(o.id))
      
      console.log(`Day 2: ${remainingOrders.length} orders remaining after Day 1`)
      
      // Calculate vehicles with remaining capacity
      const vehiclesWithCapacity = vehiclesWithCapacityToday.filter(v => {
        const assigned = todayAssignments.find(a => a.vehicle.id === v.id)
        if (!assigned) return v.remainingCapacity > 0
        const usedWeight = assigned.totalWeight
        return (v.load_capacity - usedWeight) > 0
      })
      
      console.log(`Vehicles still with capacity: ${vehiclesWithCapacity.length}/${vehiclesWithCapacityToday.length}`)
      
      // Try to fit remaining orders into vehicles with capacity
      if (remainingOrders.length > 0 && vehiclesWithCapacity.length > 0) {
        console.log(`Attempting to fit ${remainingOrders.length} remaining orders into ${vehiclesWithCapacity.length} vehicles with capacity...`)
        
        // Simple greedy assignment: assign each order to first vehicle that can fit it
        const additionalAssignments = []
        const remainingAfterFit = []
        
        for (const order of remainingOrders) {
          let assigned = false
          for (const vehicle of vehiclesWithCapacity) {
            const existingAssignment = todayAssignments.find(a => a.vehicle.id === vehicle.id)
            const currentWeight = existingAssignment ? existingAssignment.totalWeight : 0
            const availableCapacity = vehicle.load_capacity - currentWeight
            
            if (order.total_weight <= availableCapacity) {
              // Can fit this order
              if (existingAssignment) {
                existingAssignment.assignedOrders.push(order)
                existingAssignment.totalWeight += order.total_weight
                existingAssignment.utilization = (existingAssignment.totalWeight / existingAssignment.capacity) * 100
              } else {
                // Create new assignment for this vehicle
                const newAssignment = {
                  vehicle: vehicle,
                  assignedOrders: [order],
                  totalWeight: order.total_weight,
                  capacity: vehicle.load_capacity,
                  utilization: (order.total_weight / vehicle.load_capacity) * 100,
                  assignedDrivers: [],
                  destinationGroup: order.location_group || 'Other'
                }
                todayAssignments.push(newAssignment)
                additionalAssignments.push(newAssignment)
              }
              todayAssignedIds.add(order.id)
              assigned = true
              console.log(`✓ Fitted order ${order.trip_id} (${order.total_weight}kg) into ${vehicle.registration_number}`)
              break
            }
          }
          if (!assigned) {
            remainingAfterFit.push(order)
          }
        }
        
        // Update database for greedy fit assignments
        console.log(`Updating database for ${additionalAssignments.length} vehicles with greedy-fit orders...`)
        
        for (const assignment of todayAssignments) {
          // Find orders that were added by greedy fit (not in original Geoapify assignment)
          const greedyOrders = assignment.assignedOrders.filter(o => 
            todayAssignedIds.has(o.id) && 
            remainingOrders.some(ro => ro.id === o.id)
          )
          
          if (greedyOrders.length === 0) continue
          
          const driverId = assignment.assignedDrivers?.[0]?.id || null
          console.log(`Vehicle ${assignment.vehicle.registration_number}: updating ${greedyOrders.length} greedy-fit orders`)
          
          for (let idx = 0; idx < greedyOrders.length; idx++) {
            const order = greedyOrders[idx]
            const { error } = await supabase.from('pending_orders').update({
              status: 'assigned',
              assigned_vehicle_id: assignment.vehicle.id,
              assigned_driver_id: driverId,
              scheduled_date: today,
              delivery_sequence: assignment.assignedOrders.indexOf(order) + 1,
              location_group: order.location_group,
              destination_group: assignment.destinationGroup
            }).eq('id', order.id)
            
            if (error) {
              console.error(`Failed to update order ${order.id}:`, error)
            } else {
              console.log(`✓ Greedy-fit: Assigned order ${order.trip_id} (ID: ${order.id}) to vehicle ${assignment.vehicle.registration_number}`)
            }
          }
        }
        
        remainingOrders = remainingAfterFit
        console.log(`After fitting: ${remainingOrders.length} orders still unassigned`)
      }
      
      // Only cascade if there are remaining orders AND no vehicles can take them
      const shouldCascade = remainingOrders.length > 0 && vehiclesWithCapacity.length === 0
      
      if (shouldCascade) {
        console.log(`Day 2: Cascading ${remainingOrders.length} orders to tomorrow (all vehicles at capacity)`)
      } else if (remainingOrders.length > 0) {
        console.log(`⚠️ ${remainingOrders.length} orders remain but could not fit in available capacity`)
      }
      
      if (shouldCascade) {
        console.log('Day 2: Starting assignment (today at capacity)...')
        
        // Get vehicles on trip tomorrow
        const { data: vehiclesOnTripTomorrow } = await supabase
          .from('pending_orders')
          .select('assigned_vehicle_id')
          .eq('scheduled_date', tomorrow)
          .eq('status', 'in-trip')
        
        const vehicleIdsOnTripTomorrow = new Set(vehiclesOnTripTomorrow?.map(o => o.assigned_vehicle_id).filter(Boolean) || [])
        
        // Calculate remaining capacity for tomorrow
        const vehiclesWithCapacityTomorrow = vehiclesData.map(vehicle => {
          const key = `${vehicle.id}-${tomorrow}`
          const existing = existingVehicleLoads.get(key)
          const usedCapacity = existing ? existing.currentWeight : 0
          const capacity = parseInt(vehicle.load_capacity) || 0
          const remainingCapacity = capacity - usedCapacity
          const isOnTrip = vehicleIdsOnTripTomorrow.has(vehicle.id)
          
          return {
            ...vehicle,
            load_capacity: remainingCapacity,
            remainingCapacity,
            hasCapacity: remainingCapacity > 0 && capacity > 0 && !isOnTrip
          }
        }).filter(v => v.hasCapacity)
        
        console.log(`Using ${vehiclesWithCapacityTomorrow.length} vehicles with capacity for tomorrow (${vehicleIdsOnTripTomorrow.size} on trip, ${vehiclesData.length - vehiclesWithCapacityTomorrow.length - vehicleIdsOnTripTomorrow.size} at capacity)`)
        
        // Reset all drivers to available for tomorrow's assignment
        await resetAllDriversAvailable()
        const tomorrowAssignments = await assignVehiclesWithDrivers(remainingOrders, vehiclesWithCapacityTomorrow, 1)
        
        // Merge with existing and preserve location_group
        tomorrowAssignments.forEach(assignment => {
          const key = `${assignment.vehicle.id}-${tomorrow}`
          const existing = existingVehicleLoads.get(key)
          if (existing) {
            assignment.assignedOrders = [...existing.orders.map(o => ({...o, location_group: o.location_group})), ...assignment.assignedOrders]
            assignment.totalWeight += existing.currentWeight
            assignment.utilization = (assignment.totalWeight / assignment.capacity) * 100
          }
        })
        console.log(`Day 2: Got ${tomorrowAssignments.filter(a => a.assignedOrders.length > 0).length} vehicles with orders`)
        const tomorrowAssignedIds = new Set()
        for (const assignment of tomorrowAssignments) {
          if (assignment.assignedOrders.length > 0) {
            console.log(`Vehicle ${assignment.vehicle.registration_number}: ${assignment.assignedOrders.length} orders`)
            console.log(`Assigned drivers:`, assignment.assignedDrivers?.map(d => `${d.first_name} ${d.surname}`).join(', ') || 'None')
            const driverId = assignment.assignedDrivers?.[0]?.id || null
            for (const order of assignment.assignedOrders) {
              if (!order.id) continue
              const orderLocationGroup = order.location_group || order.locationGroup
              const { error } = await supabase.from('pending_orders').update({
                status: 'assigned',
                assigned_vehicle_id: assignment.vehicle.id,
                assigned_driver_id: driverId,
                scheduled_date: tomorrow,
                location_group: orderLocationGroup,
                destination_group: assignment.destinationGroup
              }).eq('id', order.id)
              if (!error) {
                tomorrowAssignedIds.add(order.id)
                console.log(`✓ Assigned order ${order.id} to vehicle ${assignment.vehicle.id} for ${tomorrow} (zone: ${orderLocationGroup})`)
              }
            }
            if (assignment.assignedDrivers && assignment.assignedDrivers.length > 0) {
              console.log(`✓ Assigned ${assignment.assignedDrivers.length} driver(s) to ${assignment.vehicle.registration_number} for tomorrow: ${assignment.assignedDrivers.map(d => `${d.first_name} ${d.surname}`).join(', ')}`)
            }
          }
        }
        const tomorrowCount = tomorrowAssignments.flatMap(a => a.assignedOrders).length
        totalAssignedCount += tomorrowCount
        allDayAssignments.tomorrow = tomorrowAssignments
        console.log(`Day 2: Assigned ${tomorrowCount} orders to ${tomorrowAssignments.filter(a => a.assignedOrders.length > 0).length} vehicles`)

        // Day 3: Assign remaining to day after (use all vehicles, max 3 days)
        remainingOrders = remainingOrders.filter(o => !tomorrowAssignedIds.has(o.id))
        console.log(`Day 3: ${remainingOrders.length} orders remaining for day after`)
        if (remainingOrders.length > 0) {
          console.log('Day 3: Starting assignment...')
          
          // Get vehicles on trip day after
          const { data: vehiclesOnTripDayAfter } = await supabase
            .from('pending_orders')
            .select('assigned_vehicle_id')
            .eq('scheduled_date', dayAfter)
            .eq('status', 'in-trip')
          
          const vehicleIdsOnTripDayAfter = new Set(vehiclesOnTripDayAfter?.map(o => o.assigned_vehicle_id).filter(Boolean) || [])
          
          // Calculate remaining capacity for day after
          const vehiclesWithCapacityDayAfter = vehiclesData.map(vehicle => {
            const key = `${vehicle.id}-${dayAfter}`
            const existing = existingVehicleLoads.get(key)
            const usedCapacity = existing ? existing.currentWeight : 0
            const capacity = parseInt(vehicle.load_capacity) || 0
            const remainingCapacity = capacity - usedCapacity
            const isOnTrip = vehicleIdsOnTripDayAfter.has(vehicle.id)
            
            return {
              ...vehicle,
              load_capacity: remainingCapacity,
              remainingCapacity,
              hasCapacity: remainingCapacity > 0 && capacity > 0 && !isOnTrip
            }
          }).filter(v => v.hasCapacity)
          
          console.log(`Using ${vehiclesWithCapacityDayAfter.length} vehicles with capacity for day after (${vehicleIdsOnTripDayAfter.size} on trip, ${vehiclesData.length - vehiclesWithCapacityDayAfter.length - vehicleIdsOnTripDayAfter.size} at capacity)`)
          
          // Reset all drivers to available for day after assignment
        await resetAllDriversAvailable()
        const dayAfterAssignments = await assignVehiclesWithDrivers(remainingOrders, vehiclesWithCapacityDayAfter, 1)
          
          // Merge with existing and preserve location_group
          dayAfterAssignments.forEach(assignment => {
            const key = `${assignment.vehicle.id}-${dayAfter}`
            const existing = existingVehicleLoads.get(key)
            if (existing) {
              assignment.assignedOrders = [...existing.orders.map(o => ({...o, location_group: o.location_group})), ...assignment.assignedOrders]
              assignment.totalWeight += existing.currentWeight
              assignment.utilization = (assignment.totalWeight / assignment.capacity) * 100
            }
          })
          console.log(`Day 3: Got ${dayAfterAssignments.filter(a => a.assignedOrders.length > 0).length} vehicles with orders`)
          for (const assignment of dayAfterAssignments) {
            if (assignment.assignedOrders.length > 0) {
              console.log(`Vehicle ${assignment.vehicle.registration_number}: ${assignment.assignedOrders.length} orders`)
              console.log(`Assigned drivers:`, assignment.assignedDrivers?.map(d => `${d.first_name} ${d.surname}`).join(', ') || 'None')
              const driverId = assignment.assignedDrivers?.[0]?.id || null
              for (const order of assignment.assignedOrders) {
                if (!order.id) continue
                const orderLocationGroup = order.location_group || order.locationGroup
                const { error } = await supabase.from('pending_orders').update({
                  status: 'assigned',
                  assigned_vehicle_id: assignment.vehicle.id,
                  assigned_driver_id: driverId,
                  scheduled_date: dayAfter,
                  location_group: orderLocationGroup,
                  destination_group: assignment.destinationGroup
                }).eq('id', order.id)
                if (!error) {
                  console.log(`✓ Assigned order ${order.id} to vehicle ${assignment.vehicle.id} for ${dayAfter} (zone: ${orderLocationGroup})`)
                }
              }
              if (assignment.assignedDrivers && assignment.assignedDrivers.length > 0) {
                console.log(`✓ Assigned ${assignment.assignedDrivers.length} driver(s) to ${assignment.vehicle.registration_number} for day after: ${assignment.assignedDrivers.map(d => `${d.first_name} ${d.surname}`).join(', ')}`)
              }
            }
          }
          const dayAfterCount = dayAfterAssignments.flatMap(a => a.assignedOrders).length
          totalAssignedCount += dayAfterCount
          allDayAssignments.dayAfter = dayAfterAssignments
          console.log(`Day 3: Assigned ${dayAfterCount} orders to ${dayAfterAssignments.filter(a => a.assignedOrders.length > 0).length} vehicles`)
        } else {
          console.log('Day 3: No orders remaining')
        }
      } else {
        console.log('Day 2: No orders remaining')
      }

      // Store all day assignments
      setTodayAssignments(allDayAssignments.today)
      setTomorrowAssignments(allDayAssignments.tomorrow)
      setDayAfterAssignments(allDayAssignments.dayAfter)
      
      // Handle truly unassigned orders (not assigned to any day)
      const allAssignedOrderIds = new Set([
        ...allDayAssignments.today.flatMap(a => a.assignedOrders.map(o => o.id)),
        ...allDayAssignments.tomorrow.flatMap(a => a.assignedOrders.map(o => o.id)),
        ...allDayAssignments.dayAfter.flatMap(a => a.assignedOrders.map(o => o.id))
      ])
      
      const trulyUnassigned = remainingOrders.filter(o => !allAssignedOrderIds.has(o.id))
      
      if (trulyUnassigned.length > 0) {
        console.log(`\n⚠️ ${trulyUnassigned.length} orders could not be assigned to any day`)
        // These orders stay as 'unassigned' - don't force schedule them
      }

      // Auto-optimize routes for all assigned vehicles using Mapbox Optimization API
      const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
      if (mapboxToken) {
        const loadingResponse = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(DEFAULT_LOADING_SITE)}.json?access_token=${mapboxToken}&country=za&limit=1`
        )
        const loadingData = await loadingResponse.json()
        const depotCoords = loadingData.features?.[0]?.center

        if (depotCoords) {
          const [depotLng, depotLat] = depotCoords

          for (const dayAssignments of [allDayAssignments.today, allDayAssignments.tomorrow, allDayAssignments.dayAfter]) {
            for (const assignment of dayAssignments.filter(a => a.assignedOrders.length > 0)) {
              const validOrders = assignment.assignedOrders.filter(o => o.latitude && o.longitude)
              
              if (validOrders.length === 0) continue
              if (validOrders.length > 12) {
                console.log(`Vehicle ${assignment.vehicle.registration_number} has ${validOrders.length} stops, using batch optimization`)
                continue
              }

              try {
                const coordinates = [
                  `${depotLng},${depotLat}`,
                  ...validOrders.map(o => `${o.longitude},${o.latitude}`),
                  `${depotLng},${depotLat}`
                ].join(';')

                const response = await fetch(
                  `https://api.mapbox.com/optimized-trips/v1/mapbox/driving/${coordinates}?` +
                  `access_token=${mapboxToken}&source=first&destination=last&roundtrip=true&geometries=geojson&overview=full`
                )

                if (response.ok) {
                  const data = await response.json()
                  if (data.code === 'Ok' && data.trips?.[0]?.waypoints) {
                    const trip = data.trips[0]
                    
                    // Reorder based on optimized waypoints
                    const optimizedOrders = trip.waypoints
                      .slice(1, -1)
                      .map(wp => validOrders[wp.waypoint_index - 1])
                      .filter(Boolean)

                    if (optimizedOrders.length > 0) {
                      assignment.assignedOrders = optimizedOrders
                      assignment.optimizedRoute = {
                        geometry: trip.geometry,
                        distance: trip.distance,
                        duration: trip.duration
                      }
                      assignment.routeDistance = Math.round(trip.distance / 1000)
                      assignment.routeDuration = Math.round(trip.duration / 60)

                      console.log(`✓ Optimized route for ${assignment.vehicle.registration_number}: ${assignment.routeDistance}km, ${assignment.routeDuration}min`)
                    }
                  }
                }
              } catch (error) {
                console.error(`Route optimization failed for ${assignment.vehicle.registration_number}:`, error)
              }
            }
          }
        }
      }

      // Update state and refresh data
      setVehicleAssignments(allDayAssignments.today)
      await loadPendingOrders()
      await loadAssignmentsFromDatabase()

      const todayVehicles = allDayAssignments.today.filter(a => a.assignedOrders.length > 0).length
      const tomorrowVehicles = allDayAssignments.tomorrow.filter(a => a.assignedOrders.length > 0).length
      const dayAfterVehicles = allDayAssignments.dayAfter.filter(a => a.assignedOrders.length > 0).length

      const actualTodayCount = allDayAssignments.today.reduce((sum, a) => sum + a.assignedOrders.length, 0)
      const finalTomorrowCount = allDayAssignments.tomorrow.reduce((sum, a) => sum + a.assignedOrders.length, 0)
      const finalDayAfterCount = allDayAssignments.dayAfter.reduce((sum, a) => sum + a.assignedOrders.length, 0)

      const remainingCount = remainingOrders.length

      let successMessage = `72-Hour Incremental Assignment Complete:\n`
      successMessage += `• Today: ${finalTodayCount} orders → ${todayVehicles} vehicles\n`
      if (finalTomorrowCount > 0) {
        successMessage += `• Tomorrow: ${finalTomorrowCount} orders → ${tomorrowVehicles} vehicles\n`
      }
      if (finalDayAfterCount > 0) {
        successMessage += `• Day After: ${finalDayAfterCount} orders → ${dayAfterVehicles} vehicles\n`
      }
      if (remainingCount > 0) {
        successMessage += `• ${remainingCount} orders could not fit (all vehicles at capacity for 3 days)`
      }
      successMessage += `\n✓ Existing assignments preserved, new orders added to available space`
      setExcelSuccess(successMessage)

    } catch (err) {
      console.error('Error assigning vehicles:', err)
      setExcelError(err instanceof Error ? err.message : 'Failed to assign vehicles')
    } finally {
      setIsProcessingExcel(false)
    }
  }



  const createTripsForAllVehicles = async () => {
    if (todayAssignments.length === 0) return

    setIsProcessingExcel(true)
    setExcelError(null)

    try {
      let createdTrips = 0
      const today = new Date().toISOString().split('T')[0]

      // Get vehicles that already have trips today
      const { data: vehiclesWithTrips } = await supabase
        .from('pending_orders')
        .select('assigned_vehicle_id')
        .eq('scheduled_date', today)
        .eq('status', 'in-trip')
      
      const vehicleIdsWithTrips = new Set(vehiclesWithTrips?.map(o => o.assigned_vehicle_id).filter(Boolean) || [])
      console.log(`Vehicles already on trips today: ${vehicleIdsWithTrips.size}`, Array.from(vehicleIdsWithTrips))

      // Process only today
      const allAssignments = [
        { assignments: todayAssignments, date: today, label: 'Today' }
      ]

      for (const { assignments, date, label } of allAssignments) {
        console.log(`${label} assignments:`, assignments.length, 'total vehicles')
        console.log(`${label} assignments with orders:`, assignments.filter(a => a.assignedOrders?.length > 0).length)
        const assignedVehicles = assignments.filter(a => a.assignedOrders && a.assignedOrders.length > 0 && !vehicleIdsWithTrips.has(a.vehicle.id))
        if (assignedVehicles.length === 0) {
          console.log(`Skipping ${label} - no vehicles with orders or all already on trips`)
          continue
        }

        console.log(`Creating trips for ${label} (${date}): ${assignedVehicles.length} vehicles`)

        for (const assignment of assignedVehicles) {
        // Skip if no driver assigned
        if (!assignment.assignedDrivers || assignment.assignedDrivers.length === 0) {
          console.log(`Skipping ${assignment.vehicle.registration_number} - no driver assigned`)
          continue
        }

        // PAIRED VEHICLES: CN30435 + Mission Trailer work together
        const isPaired = assignment.vehicle.registration_number === 'CN30435' || assignment.vehicle.registration_number === 'Mission Trailer'
        
        // Skip Mission Trailer - it's a trailer, not a standalone vehicle
        if (assignment.vehicle.registration_number === 'Mission Trailer') {
          console.log(`Skipping Mission Trailer - it's a trailer towed by CN30435`)
          continue
        }
        
        // For CN30435, combine customer locations from both vehicles
        let customerLocations = assignment.assignedOrders
          .filter(order => order.latitude && order.longitude)
          .map(order => `${order.longitude},${order.latitude}`)
        
        let allOrders = [...assignment.assignedOrders]
        
        if (isPaired) {
          const trailerAssignment = assignedVehicles.find(a => a.vehicle.registration_number === 'Mission Trailer')
          if (trailerAssignment && trailerAssignment.assignedOrders.length > 0) {
            const trailerLocations = trailerAssignment.assignedOrders
              .filter(order => order.latitude && order.longitude)
              .map(order => `${order.longitude},${order.latitude}`)
            customerLocations = [...customerLocations, ...trailerLocations]
            allOrders = [...allOrders, ...trailerAssignment.assignedOrders]
            console.log(`CN30435 towing Mission Trailer: ${allOrders.length} total orders`)
          }
        }

        if (customerLocations.length === 0) continue

        // Fetch route from vehicle_routes table
        let routeId = null
        let routePoints = null
        let stopPoints = []
        
        const { data: vehicleRoute } = await supabase
          .from('vehicle_routes')
          .select('route_geometry, distance, duration')
          .eq('vehicle_id', assignment.vehicle.id)
          .eq('scheduled_date', date)
          .single()
        
        if (vehicleRoute?.route_geometry && assignment.assignedOrders.length > 0) {
          // Use route geometry from database
          routePoints = vehicleRoute.route_geometry
          
          // Build stop points with sequence based on optimized order
          stopPoints = assignment.assignedOrders.map((order, idx) => ({
            lat: order.latitude,
            lng: order.longitude,
            customer: order.customer_name,
            sequence: idx + 1
          }))
        }

          // Generate unique trip ID in format ADV-5XXXXX
          const randomNum = Math.floor(10000 + Math.random() * 90000)
          const tripId = `ADV-5${randomNum}`
          const orderNumber = `ORD-${Math.floor(10000 + Math.random() * 90000)}`

          // For paired vehicles, include both in vehicle assignments
          const vehicleAssignments = [{
            drivers: assignment.assignedDrivers?.map(d => ({
              id: d.id,
              name: `${d.first_name} ${d.surname}`.trim()
            })) || [],
            vehicle: {
              id: assignment.vehicle.id,
              name: assignment.vehicle.registration_number
            }
          }]
          
          // Add Mission Trailer if this is CN30435 (trailer is towed, not separate)
          if (assignment.vehicle.registration_number === 'CN30435') {
            const trailerAssignment = assignedVehicles.find(a => a.vehicle.registration_number === 'Mission Trailer')
            if (trailerAssignment && trailerAssignment.assignedOrders.length > 0) {
              vehicleAssignments.push({
                drivers: [], // Trailer has no separate driver
                vehicle: {
                  id: trailerAssignment.vehicle.id,
                  name: `${trailerAssignment.vehicle.registration_number} (Trailer)`
                }
              })
            }
          }
          
          const tripData = {
            trip_id: tripId,
            ordernumber: orderNumber,
            rate: '0',
            cargo: '',
            origin: DEFAULT_LOADING_SITE,
            destination: assignment.destinationGroup || 'Multiple Locations',
            notes: isPaired ? `Trip for CN30435 towing Mission Trailer` : `Trip for ${assignment.vehicle.registration_number}`,
            status: 'pending',
            startdate: date,
            enddate: date,
            route: routeId ? routeId.toString() : null,
            route_points: routePoints || [],
            stop_points: stopPoints,
          clientdetails: {
            name: 'Multiple Clients',
            email: '',
            phone: '',
            address: '',
            contactPerson: ''
          },
          pickuplocations: [{
            location: DEFAULT_LOADING_SITE,
            address: DEFAULT_LOADING_SITE,
            scheduled_time: new Date().toISOString()
          }],
          dropofflocations: allOrders.map(order => ({
            location: order.location,
            address: order.location,
            scheduled_time: new Date().toISOString()
          })),
          vehicleassignments: vehicleAssignments,
          trip_type: 'local',
          total_vehicle_cost: 0,
          estimated_distance: 0
        }

          console.log(`Creating trip for ${assignment.vehicle.registration_number}:`, { tripId, orderCount: assignment.assignedOrders.length })
          const { data, error } = await supabase.from('trips').insert([tripData]).select()
          if (error) {
            console.error(`❌ Failed to create trip for ${assignment.vehicle.registration_number}:`, error)
            console.error('Error details:', {
              message: error.message,
              details: error.details,
              hint: error.hint,
              code: error.code
            })
            console.error('Trip data that failed:', JSON.stringify(tripData, null, 2))
          } else {
            createdTrips++
            if (isPaired) {
              console.log(`✓ Created trip ${tripId} for CN30435 towing Mission Trailer`)
            } else {
              console.log(`✓ Created trip ${tripId} for ${assignment.vehicle.registration_number}`)
            }
            
            // Update orders with trip_id and status 'in-trip' for ALL orders (including trailer's)
            for (const order of allOrders) {
              const { error: updateError } = await supabase
                .from('pending_orders')
                .update({ 
                  status: 'in-trip',
                  trip_id: tripId
                })
                .eq('id', order.id)
              if (updateError) {
                console.error(`❌ Failed to update order ${order.id}:`, updateError)
              } else {
                console.log(`✓ Updated order ${order.id} with trip_id ${tripId}`)
              }
            }
          }
        }
      }

      await fetchData()
      await loadPendingOrders()
      
      const allAssignedVehicles = todayAssignments.filter(a => a.assignedOrders && a.assignedOrders.length > 0)
      const vehiclesWithoutDrivers = allAssignedVehicles.filter(a => !a.assignedDrivers || a.assignedDrivers.length === 0).length
      const vehiclesAlreadyOnTrip = vehicleIdsWithTrips.size
      
      let message = `Successfully created ${createdTrips} trip${createdTrips !== 1 ? 's' : ''} for today with optimized routes!`
      if (vehiclesAlreadyOnTrip > 0) {
        message += `\n\n✓ ${vehiclesAlreadyOnTrip} vehicle${vehiclesAlreadyOnTrip !== 1 ? 's' : ''} already on trip - skipped.`
      }
      if (vehiclesWithoutDrivers > 0) {
        message += `\n\n⚠️ ${vehiclesWithoutDrivers} vehicle${vehiclesWithoutDrivers !== 1 ? 's' : ''} skipped - no driver assigned. Assign drivers to create trips for remaining vehicles.`
      }
      setExcelSuccess(message)

    } catch (err) {
      console.error('Error creating trips:', err)
      setExcelError(err instanceof Error ? err.message : 'Failed to create trips')
    } finally {
      setIsProcessingExcel(false)
    }
  }

  const handleOrderDragStart = (order: any, index: number) => {
    setDraggedOrder({ order, index })
  }

  const handleOrderDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDraggedOverIndex(index)
  }

  const handleOrderReorder = async (dropIndex: number) => {
    if (!draggedOrder || !selectedVehicleForDetails || draggedOrder.index === dropIndex) {
      setDraggedOrder(null)
      setDraggedOverIndex(null)
      return
    }

    setIsReoptimizing(true)
    try {
      const orders = [...selectedVehicleForDetails.assignedOrders]
      const [movedOrder] = orders.splice(draggedOrder.index, 1)
      orders.splice(dropIndex, 0, movedOrder)

      // Update sequences in database
      const scheduledDate = selectedDate === 'today' ? new Date().toISOString().split('T')[0] : 
                           selectedDate === 'tomorrow' ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] : 
                           new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().split('T')[0]

      for (let idx = 0; idx < orders.length; idx++) {
        await supabase
          .from('pending_orders')
          .update({ delivery_sequence: idx + 1 })
          .eq('id', orders[idx].id)
      }

      // Update modal state
      setSelectedVehicleForDetails({
        ...selectedVehicleForDetails,
        assignedOrders: orders
      })

      toast.success('Delivery sequence updated')
      await loadAssignmentsFromDatabase()
    } catch (error) {
      console.error('Error reordering:', error)
      toast.error('Failed to reorder')
    } finally {
      setIsReoptimizing(false)
      setDraggedOrder(null)
      setDraggedOverIndex(null)
    }
  }

  const handleOrderDrop = async (targetZone: 'vehicle' | 'unassigned') => {
    if (!draggedOrder || !selectedVehicleForDetails) return

    setIsReoptimizing(true)
    try {
      const vehicleId = selectedVehicleForDetails.vehicle.id
      const scheduledDate = selectedDate === 'today' ? new Date().toISOString().split('T')[0] : 
                           selectedDate === 'tomorrow' ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] : 
                           new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().split('T')[0]

      if (targetZone === 'unassigned') {
        // Remove from vehicle
        const orderToRemove = draggedOrder.order || draggedOrder
        await supabase
          .from('pending_orders')
          .update({ 
            status: 'unassigned',
            assigned_vehicle_id: null,
            assigned_driver_id: null,
            scheduled_date: null,
            delivery_sequence: null
          })
          .eq('id', orderToRemove.id)

        // Update local state
        const updatedOrders = selectedVehicleForDetails.assignedOrders.filter(o => o.id !== orderToRemove.id)
        
        // Re-optimize remaining orders
        const { orders: optimizedOrders, distance, duration, geometry } = await reoptimizeVehicleRoute(updatedOrders)
        
        // Update sequences in database
        for (let idx = 0; idx < optimizedOrders.length; idx++) {
          await supabase
            .from('pending_orders')
            .update({ delivery_sequence: idx + 1 })
            .eq('id', optimizedOrders[idx].id)
        }

        // Store route geometry
        if (geometry) {
          await supabase
            .from('vehicle_routes')
            .upsert({
              vehicle_id: vehicleId,
              scheduled_date: scheduledDate,
              route_geometry: (() => {
                const coords = geometry?.coordinates || geometry
                return Array.isArray(coords?.[0]?.[0]) ? coords.flat() : coords
              })(),
              distance,
              duration,
              updated_at: new Date().toISOString()
            }, { onConflict: 'vehicle_id,scheduled_date' })
        }

        // Update modal state
        setSelectedVehicleForDetails({
          ...selectedVehicleForDetails,
          assignedOrders: optimizedOrders,
          totalWeight: optimizedOrders.reduce((sum, o) => sum + (o.totalWeight || o.total_weight || 0), 0),
          utilization: (optimizedOrders.reduce((sum, o) => sum + (o.totalWeight || o.total_weight || 0), 0) / selectedVehicleForDetails.capacity) * 100,
          optimizedRoute: geometry ? { geometry, distance, duration } : null
        })

        toast.success('Order removed and route re-optimized')
      }

      // Refresh data
      await loadPendingOrders()
      await loadAssignmentsFromDatabase()
    } catch (error) {
      console.error('Error moving order:', error)
      toast.error('Failed to move order')
    } finally {
      setIsReoptimizing(false)
      setDraggedOrder(null)
    }
  }

  const clearExcelData = async () => {
    // Delete all pending orders from database
    await supabase.from('pending_orders').delete().neq('id', 0)

    setExcelFile(null)
    setParsedOrders([])
    setNewClients([])
    setExcelError(null)
    setExcelSuccess(null)
    setVehicleAssignments([])
    setUnassignedOrders([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleCreate = async () => {
    try {
      // Save route to database for both trip types when creating the load
      let routeId = null
      if (loadingLocation && dropOffPoint) {
        try {
          const selectedStopPoints = await getSelectedStopPointsData()
          const waypoints = selectedStopPoints.map(point => {
            const coords = point.coordinates
            const avgLng = coords.reduce((sum, coord) => sum + coord[0], 0) / coords.length
            const avgLat = coords.reduce((sum, coord) => sum + coord[1], 0) / coords.length
            return `${avgLng},${avgLat}`
          })

          const routeResponse = await fetch('/api/routes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              origin: loadingLocation,
              destination: dropOffPoint,
              orderId: orderNumber,
              pickupTime: etaPickup,
              waypoints: waypoints
            })
          })

          if (routeResponse.ok) {
            const routeData = await routeResponse.json()
            routeId = routeData.route?.id
          }
        } catch (routeError) {
          console.error('Error saving route:', routeError)
          // Continue with load creation even if route saving fails
        }
      }

      const tripData = {
        trip_id: `LOAD-${Date.now()}`,
        ordernumber: orderNumber,
        rate: rate,
        cargo: commodity,
        origin: loadingLocation,
        destination: dropOffPoint,
        notes: comment,
        status: 'pending',
        startdate: etaPickup ? etaPickup.split('T')[0] : null,
        enddate: etaDropoff ? etaDropoff.split('T')[0] : null,
        route: routeId ? routeId.toString() : null, // Link to saved route

        clientdetails: selectedClient ? {
          name: selectedClient.name,
          email: '',
          phone: selectedClient.phone || '',
          address: selectedClient.address || '',
          contactPerson: selectedClient.contact_person || '',
          client_id: selectedClient.client_id || '',
          vat_number: selectedClient.vat_number || ''
        } : {
          name: client,
          email: '',
          phone: '',
          address: '',
          contactPerson: ''
        },
        pickuplocations: [{
          location: loadingLocation || '',
          address: loadingLocation || '',
          scheduled_time: etaPickup || ''
        }],
        dropofflocations: [{
          location: dropOffPoint || '',
          address: dropOffPoint || '',
          scheduled_time: etaDropoff || ''
        }],
        vehicleassignments: [{
          drivers: driverAssignments.filter(d => d.id).map(d => ({
            id: d.id,
            name: d.name || `${d.first_name || ''} ${d.surname || ''}`.trim()
          })),
          vehicle: {
            id: selectedVehicleId,
            name: selectedVehicleId ? vehicles.find(v => v.id.toString() === selectedVehicleId)?.registration_number || '' : ''
          },
          trailer: {
            id: selectedTrailerId,
            name: selectedTrailerId ? vehicles.find(v => v.id.toString() === selectedTrailerId)?.registration_number || '' : ''
          }
        }],
        trip_type: tripType,
        selected_stop_points: stopPoints.map((pointId, index) => {
          if (customStopPoints[index]) {
            return { type: 'custom', name: customStopPoints[index], id: `custom_${index}` }
          } else if (pointId) {
            const point = availableStopPoints.find(p => p.id.toString() === pointId)
            return point ? { type: 'existing', ...point } : null
          }
          return null
        }).filter(Boolean),
        selected_vehicle_type: selectedVehicleType,
        approximate_fuel_cost: approximateFuelCost,
        approximated_cpk: approximatedCPK,
        approximated_vehicle_cost: approximatedVehicleCost,
        approximated_driver_cost: approximatedDriverCost,
        total_vehicle_cost: totalVehicleCost,
        goods_in_transit_premium: parseFloat(goodsInTransitPremium) || null,
        estimated_distance: estimatedDistance,
        fuel_price_per_liter: parseFloat(fuelPricePerLiter) || null
      }

      console.log('Inserting trip data:', tripData)
      const { data, error } = await supabase.from('trips').insert([tripData])
      if (error) {
        console.error('Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        throw new Error(`Database error: ${error.message || 'Unknown error'}`)
      }
      console.log('Trip created successfully:', data)

      // Mark assigned drivers as unavailable
      const assignedDriverIds = driverAssignments
        .map(d => d.id)
        .filter(id => id)

      if (assignedDriverIds.length > 0) {
        try {
          await markDriversUnavailable(assignedDriverIds)
          showToast(`${assignedDriverIds.length} driver(s) marked as unavailable`, 'success')
        } catch (error) {
          console.error('Error updating driver availability:', error)
          showToast('Load created successfully, but failed to update driver availability', 'warning')
        }
      }

      // Reset form
      setClient(''); setSelectedClient(null); setManualClientName(''); setCommodity(''); setRate(''); setOrderNumber(''); setComment('')
      setEtaPickup(''); setLoadingLocation(''); setEtaDropoff(''); setDropOffPoint('')
      setDriverAssignments([{ id: '', name: '' }])
      setSelectedVehicleId('')
      setSelectedTrailerId('')
      setTripType('local')
      setStopPoints([]) // Reset stop points for both trip types
      setCustomStopPoints([])
      setFuelPricePerLiter('')
      setGoodsInTransitPremium('')
      setSelectedVehicleType('')
      setShowSecondSection(false)
      setOptimizedRoute(null)

      // Refresh data
      fetchData()

      showToast('Load created successfully!', 'success')
    } catch (err) {
      console.error('Error creating load:', err)
      showToast('Something went wrong while creating the load', 'error')
    }
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="p-6 space-y-6 w-full">
        <h1 className="text-2xl font-bold mb-6">Load Plan</h1>

        <div className="space-y-6">
          {/* Excel Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Import Open Orders from Excel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="excel-file">Select Excel File</Label>
                  <Input
                    ref={fileInputRef}
                    id="excel-file"
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleExcelFileSelect}
                    className="mt-1"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <Button
                    onClick={parseExcelFile}
                    disabled={!excelFile || isProcessingExcel}
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    {isProcessingExcel ? 'Processing...' : 'Parse Excel'}
                  </Button>
                  {(excelFile || parsedOrders.length > 0) && (
                    <Button variant="outline" onClick={clearExcelData}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {excelError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{excelError}</AlertDescription>
                </Alert>
              )}

              {excelSuccess && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>{excelSuccess}</AlertDescription>
                </Alert>
              )}

              {newClients.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-medium mb-1">New clients detected: {newClients.join(', ')}</p>
                  </AlertDescription>
                </Alert>
              )}

              {(unassignedOrders.length > 0 || todayAssignments.length > 0 || tomorrowAssignments.length > 0 || dayAfterAssignments.length > 0) && (
                <div className="space-y-6">
                  <div className="bg-white rounded-xl border shadow-sm">
                    <div className="p-4 border-b">
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-slate-600 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">{unassignedOrders.length}</span>
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-slate-700">Orders awaiting assignment</span>
                            {unassignedOrders.some(o => (o.priority || 0) > 0) && (
                              <p className="text-xs text-orange-600 font-medium">
                                {unassignedOrders.filter(o => (o.priority || 0) > 0).length} priority orders from previous days
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {hasUnknownLocations && (
                            <>
                              <Button
                                onClick={async () => {
                                  try {
                                    setIsProcessingExcel(true)
                                    
                                    // Get all customers with locations
                                    const { data: customers } = await supabase
                                      .from('customers')
                                      .select('customer_id, latitude, longitude, address, zone')
                                    
                                    if (!customers || customers.length === 0) {
                                      toast.info('No customer locations found in database')
                                      return
                                    }
                                    
                                    // Get orders without coordinates
                                    const { data: ordersWithoutCoords } = await supabase
                                      .from('pending_orders')
                                      .select('*')
                                      .is('latitude', null)
                                    
                                    if (!ordersWithoutCoords || ordersWithoutCoords.length === 0) {
                                      toast.info('All orders already have locations')
                                      return
                                    }
                                    
                                    // Match and update
                                    let updatedCount = 0
                                    for (const order of ordersWithoutCoords) {
                                      const customer = customers.find(c => c.customer_id === order.customer_id)
                                      if (customer) {
                                        await supabase
                                          .from('pending_orders')
                                          .update({
                                            latitude: customer.latitude,
                                            longitude: customer.longitude,
                                            location: customer.address,
                                            location_group: customer.zone
                                          })
                                          .eq('id', order.id)
                                        updatedCount++
                                      }
                                    }
                                    
                                    await loadPendingOrders()
                                    toast.success(`Synced ${updatedCount} orders with customer locations`)
                                  } catch (error) {
                                    console.error('Error:', error)
                                    toast.error('Failed to sync locations')
                                  } finally {
                                    setIsProcessingExcel(false)
                                  }
                                }}
                                disabled={isProcessingExcel}
                                size="sm"
                                variant="outline"
                                className="border-blue-300 hover:bg-blue-50 text-blue-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Sync Customer Locations
                              </Button>
                              <Button
                                onClick={async () => {
                                  try {
                                    const today = new Date().toISOString().split('T')[0]
                                    
                                    // Get all orders for today
                                    const { data: todayOrders, error } = await supabase
                                      .from('pending_orders')
                                      .select('*')
                                      .eq('scheduled_date', today)
                                    
                                    if (error) {
                                      console.error('Query error:', error)
                                      toast.error('Failed to fetch orders')
                                      return
                                    }
                                    
                                    // Filter orders without coordinates
                                    const ordersWithoutCoords = (todayOrders || []).filter(o => !o.latitude || !o.longitude)
                                    
                                    if (ordersWithoutCoords.length === 0) {
                                      toast.info('All orders already have locations')
                                      return
                                    }
                                    
                                    // Get unique customers needing setup
                                    const customersNeedingSetup = ordersWithoutCoords
                                      .map(o => ({ id: o.customer_id, name: o.customer_name, location: o.location }))
                                      .filter((v, i, a) => a.findIndex(t => t.id === v.id) === i)
                                    
                                    if (customersNeedingSetup.length > 0) {
                                      toast.info(`Found ${customersNeedingSetup.length} customer(s) with unknown locations`)
                                      window.pendingCustomers = customersNeedingSetup
                                      setPendingCustomer(customersNeedingSetup[0])
                                      setShowNewCustomerModal(true)
                                    }
                                  } catch (error) {
                                    console.error('Error:', error)
                                    toast.error('Failed to check locations')
                                  }
                                }}
                                size="sm"
                                variant="outline"
                                className="border-orange-300 hover:bg-orange-50 text-orange-700"
                              >
                                <MapPin className="h-4 w-4 mr-1" />
                                Setup New Customers
                              </Button>
                            </>
                          )}
                          {vehicleAssignments.some(a => a.assignedOrders.length > 0) && (
                            <Button
                              onClick={async () => {
                                try {
                                  // Get all orders that are assigned but NOT on trips yet
                                  const { data: assignedNotOnTrip } = await supabase
                                    .from('pending_orders')
                                    .select('*')
                                    .eq('status', 'assigned')
                                    .not('assigned_vehicle_id', 'is', null)

                                  // Check for orders on trips
                                  const { data: ordersOnTrip } = await supabase
                                    .from('pending_orders')
                                    .select('*')
                                    .eq('status', 'in-trip')
                                    .not('assigned_vehicle_id', 'is', null)

                                  if (ordersOnTrip && ordersOnTrip.length > 0) {
                                    toast.error(`Cannot unassign ${ordersOnTrip.length} order(s) - they are on a trip. Complete or cancel trips first.`)
                                    return
                                  }

                                  if (!assignedNotOnTrip || assignedNotOnTrip.length === 0) {
                                    toast.info('No assigned orders to unassign')
                                    return
                                  }

                                  // Collect unique driver IDs from orders being unassigned
                                  const driverIdsToRelease = new Set()
                                  assignedNotOnTrip.forEach(order => {
                                    if (order.assigned_driver_id) {
                                      driverIdsToRelease.add(order.assigned_driver_id)
                                    }
                                  })

                                  // Unassign only orders that are NOT on trips
                                  await supabase
                                    .from('pending_orders')
                                    .update({ 
                                      status: 'unassigned', 
                                      assigned_vehicle_id: null,
                                      assigned_driver_id: null,
                                      scheduled_date: null
                                    })
                                    .eq('status', 'assigned')

                                  // Mark drivers as available again
                                  if (driverIdsToRelease.size > 0) {
                                    await updateDriverAvailability(Array.from(driverIdsToRelease), true)
                                    console.log(`Marked ${driverIdsToRelease.size} drivers as available`)
                                  }

                                  setVehicleAssignments([])
                                  setTodayAssignments([])
                                  setTomorrowAssignments([])
                                  setDayAfterAssignments([])
                                  await loadPendingOrders()
                                  toast.success(`${assignedNotOnTrip.length} orders unassigned and ${driverIdsToRelease.size} drivers released`)
                                } catch (error) {
                                  toast.error('Failed to unassign orders')
                                }
                              }}
                              disabled={isProcessingExcel}
                              size="sm"
                              variant="outline"
                              className="border-slate-300 hover:bg-slate-100"
                            >
                              Unassign All
                            </Button>
                          )}
                          <Button
                            onClick={assignVehiclesToOrders}
                            disabled={isProcessingExcel}
                            size="sm"
                            className="bg-slate-700 hover:bg-slate-800 text-white shadow-sm"
                          >
                            {isProcessingExcel ? 'Assigning...' : '72-Hour Auto Assignment'}
                          </Button>
                          {todayAssignments.some(a => a.assignedOrders.length > 0) && (
                            <Button
                              onClick={createTripsForAllVehicles}
                              disabled={isProcessingExcel}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white shadow-sm"
                            >
                              {isProcessingExcel ? 'Creating...' : 'Create Today\'s Trips'}
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Available Orders by Dynamic Zone */}
                      {unassignedOrders.filter(o => o.status === 'unassigned').length > 0 && (
                        <div className="mt-4 mb-4">
                          <h3 className="text-sm font-semibold mb-3 text-slate-700">Available Orders by Zone ({unassignedOrders.filter(o => o.status === 'unassigned').length})</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {Object.entries(
                              unassignedOrders
                                .filter(o => o.status === 'unassigned')
                                .reduce((groups, order) => {
                                  // Use dynamic zone if available, otherwise fallback
                                  const location = order.location_group || 'Unknown Zone'
                                  if (!groups[location]) groups[location] = []
                                  groups[location].push(order)
                                  return groups
                                }, {} as Record<string, any[]>)
                            ).map(([location, orders]) => (
                              <div key={location} className="p-3 border rounded-lg bg-blue-50 border-blue-200">
                                <div className="flex items-center justify-between mb-2">
                                  <p className="text-xs font-semibold text-blue-900 truncate">{location}</p>
                                  <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">{orders.length}</span>
                                </div>
                                <p className="text-xs text-blue-700 mb-1">{Math.round(orders.reduce((sum, o) => sum + (o.totalWeight || 0), 0)).toLocaleString()}kg total</p>
                                <div className="text-xs text-blue-600 space-y-0.5">
                                  {orders.slice(0, 3).map((o, i) => (
                                    <div key={i} className="truncate">• {o.customerName || o.customer_name}</div>
                                  ))}
                                  {orders.length > 3 && <div className="text-blue-500">+{orders.length - 3} more</div>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 72-Hour Planning Window */}
                      <div className="mt-4">
                        <h3 className="text-lg font-semibold mb-4">72-Hour Planning Window</h3>
                        <Tabs value={selectedDate} onValueChange={(value) => {
                          setSelectedDate(value)
                          if (value === 'today') setVehicleAssignments(todayAssignments)
                          else if (value === 'tomorrow') setVehicleAssignments(tomorrowAssignments)
                          else if (value === 'dayafter') setVehicleAssignments(dayAfterAssignments)
                        }} className="w-full">
                          <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="today" className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              Today ({new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})
                            </TabsTrigger>
                            <TabsTrigger value="tomorrow" className="flex items-center gap-2">
                              <Route className="h-4 w-4" />
                              Tomorrow ({new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})
                            </TabsTrigger>
                            <TabsTrigger value="dayafter" className="flex items-center gap-2">
                              <Route className="h-4 w-4" />
                              Day After ({new Date(Date.now() + 48 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})
                            </TabsTrigger>
                          </TabsList>

                          <TabsContent value="today" className="mt-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                              <div className="p-3 rounded-lg border bg-green-50 flex items-center space-x-3">
                                <CheckCircle className="h-6 w-6 text-green-500" />
                                <div>
                                  <p className="text-xs text-gray-600">Assigned Orders</p>
                                  <p className="text-lg font-semibold">{todayAssignments.reduce((sum, a) => sum + a.assignedOrders.length, 0)}</p>
                                </div>
                              </div>
                              <div className="p-3 rounded-lg border bg-purple-50 flex items-center space-x-3">
                                <Route className="h-6 w-6 text-purple-500" />
                                <div>
                                  <p className="text-xs text-gray-600">Vehicles Used</p>
                                  <p className="text-lg font-semibold">{todayAssignments.filter(a => a.assignedOrders.length > 0).length}</p>
                                </div>
                              </div>
                              <div className="p-3 rounded-lg border bg-blue-50 flex items-center space-x-3">
                                <TrendingUp className="h-6 w-6 text-blue-500" />
                                <div>
                                  <p className="text-xs text-gray-600">Total Weight</p>
                                  <p className="text-lg font-semibold">{Math.round(todayAssignments.reduce((sum, a) => sum + a.totalWeight, 0)).toLocaleString()}kg</p>
                                </div>
                              </div>
                              <div className="p-3 rounded-lg border bg-orange-50 flex items-center space-x-3">
                                <AlertTriangle className="h-6 w-6 text-orange-500" />
                                <div>
                                  <p className="text-xs text-gray-600">Avg Utilization</p>
                                  <p className="text-lg font-semibold">{todayAssignments.filter(a => a.assignedOrders.length > 0).length > 0 ? Math.round(todayAssignments.filter(a => a.assignedOrders.length > 0).reduce((sum, a) => sum + a.utilization, 0) / todayAssignments.filter(a => a.assignedOrders.length > 0).length) : 0}%</p>
                                </div>
                              </div>
                            </div>
                          </TabsContent>

                          <TabsContent value="tomorrow" className="mt-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                              <div className="p-3 rounded-lg border bg-green-50 flex items-center space-x-3">
                                <CheckCircle className="h-6 w-6 text-green-500" />
                                <div>
                                  <p className="text-xs text-gray-600">Assigned Orders</p>
                                  <p className="text-lg font-semibold">{tomorrowAssignments.reduce((sum, a) => sum + a.assignedOrders.length, 0)}</p>
                                </div>
                              </div>
                              <div className="p-3 rounded-lg border bg-purple-50 flex items-center space-x-3">
                                <Route className="h-6 w-6 text-purple-500" />
                                <div>
                                  <p className="text-xs text-gray-600">Vehicles Used</p>
                                  <p className="text-lg font-semibold">{tomorrowAssignments.filter(a => a.assignedOrders.length > 0).length}</p>
                                </div>
                              </div>
                              <div className="p-3 rounded-lg border bg-blue-50 flex items-center space-x-3">
                                <TrendingUp className="h-6 w-6 text-blue-500" />
                                <div>
                                  <p className="text-xs text-gray-600">Total Weight</p>
                                  <p className="text-lg font-semibold">{Math.round(tomorrowAssignments.reduce((sum, a) => sum + a.totalWeight, 0)).toLocaleString()}kg</p>
                                </div>
                              </div>
                              <div className="p-3 rounded-lg border bg-orange-50 flex items-center space-x-3">
                                <AlertTriangle className="h-6 w-6 text-orange-500" />
                                <div>
                                  <p className="text-xs text-gray-600">Avg Utilization</p>
                                  <p className="text-lg font-semibold">{tomorrowAssignments.filter(a => a.assignedOrders.length > 0).length > 0 ? Math.round(tomorrowAssignments.filter(a => a.assignedOrders.length > 0).reduce((sum, a) => sum + a.utilization, 0) / tomorrowAssignments.filter(a => a.assignedOrders.length > 0).length) : 0}%</p>
                                </div>
                              </div>
                            </div>
                          </TabsContent>

                          <TabsContent value="dayafter" className="mt-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                              <div className="p-3 rounded-lg border bg-green-50 flex items-center space-x-3">
                                <CheckCircle className="h-6 w-6 text-green-500" />
                                <div>
                                  <p className="text-xs text-gray-600">Assigned Orders</p>
                                  <p className="text-lg font-semibold">{dayAfterAssignments.reduce((sum, a) => sum + a.assignedOrders.length, 0)}</p>
                                </div>
                              </div>
                              <div className="p-3 rounded-lg border bg-purple-50 flex items-center space-x-3">
                                <Route className="h-6 w-6 text-purple-500" />
                                <div>
                                  <p className="text-xs text-gray-600">Vehicles Used</p>
                                  <p className="text-lg font-semibold">{dayAfterAssignments.filter(a => a.assignedOrders.length > 0).length}</p>
                                </div>
                              </div>
                              <div className="p-3 rounded-lg border bg-blue-50 flex items-center space-x-3">
                                <TrendingUp className="h-6 w-6 text-blue-500" />
                                <div>
                                  <p className="text-xs text-gray-600">Total Weight</p>
                                  <p className="text-lg font-semibold">{Math.round(dayAfterAssignments.reduce((sum, a) => sum + a.totalWeight, 0)).toLocaleString()}kg</p>
                                </div>
                              </div>
                              <div className="p-3 rounded-lg border bg-orange-50 flex items-center space-x-3">
                                <AlertTriangle className="h-6 w-6 text-orange-500" />
                                <div>
                                  <p className="text-xs text-gray-600">Avg Utilization</p>
                                  <p className="text-lg font-semibold">{dayAfterAssignments.filter(a => a.assignedOrders.length > 0).length > 0 ? Math.round(dayAfterAssignments.filter(a => a.assignedOrders.length > 0).reduce((sum, a) => sum + a.utilization, 0) / dayAfterAssignments.filter(a => a.assignedOrders.length > 0).length) : 0}%</p>
                                </div>
                              </div>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </div>
                    </div>
                  </div>

                  {(vehicleAssignments.length > 0 || todayAssignments.length > 0 || tomorrowAssignments.length > 0 || dayAfterAssignments.length > 0) && (() => {
                    // Group vehicles by zones from auto-assignment
                    const displayAssignments = vehicleAssignments.length > 0 ? vehicleAssignments : (selectedDate === 'today' ? todayAssignments : selectedDate === 'tomorrow' ? tomorrowAssignments : dayAfterAssignments)
                    
                    // Handle paired vehicles - always show together
                    const filteredAssignments = displayAssignments.filter(a => {
                      if (a.assignedOrders.length === 0) return false
                      
                      // For paired vehicles, if one has orders, show both
                      if (a.vehicle.registration_number === 'CN30435' || a.vehicle.registration_number === 'Mission Trailer') {
                        const missionTrailer = displayAssignments.find(v => v.vehicle.registration_number === 'Mission Trailer')
                        const cn30435 = displayAssignments.find(v => v.vehicle.registration_number === 'CN30435')
                        
                        // If either has orders, show both (they always travel together)
                        if (missionTrailer && cn30435) {
                          const hasOrders = missionTrailer.assignedOrders.length > 0 || cn30435.assignedOrders.length > 0
                          if (hasOrders) {
                            // Share the same driver between both
                            const sharedDriver = cn30435.assignedDrivers || missionTrailer.assignedDrivers
                            if (sharedDriver && sharedDriver.length > 0) {
                              cn30435.assignedDrivers = sharedDriver
                              missionTrailer.assignedDrivers = sharedDriver
                            }
                            return true
                          }
                        }
                        return false
                      }
                      
                      return true
                    })
                    
                    const assignedVehicles = filteredAssignments
                    const routeGroups = assignedVehicles.reduce((groups, assignment) => {
                      // Use destinationGroup from auto-assignment if available
                      let dynamicZone = assignment.destinationGroup || 'Other'
                      
                      // Fallback: calculate from orders' location_group if destinationGroup not set
                      if (!assignment.destinationGroup || assignment.destinationGroup === 'Other') {
                        const orderZones = assignment.assignedOrders
                          .map(o => o.location_group || o.locationGroup)
                          .filter(Boolean)
                        
                        if (orderZones.length > 0) {
                          const zoneCounts = orderZones.reduce((acc, zone) => {
                            acc[zone] = (acc[zone] || 0) + 1
                            return acc
                          }, {})
                          const sortedZones = Object.entries(zoneCounts).sort((a, b) => b[1] - a[1])
                          
                          // If multiple zones, show primary + count
                          if (sortedZones.length > 1 && sortedZones[1][1] > 0) {
                            dynamicZone = `${sortedZones[0][0]} +${sortedZones.length - 1}`
                          } else {
                            dynamicZone = sortedZones[0][0]
                          }
                        }
                      }
                      
                      // Paired vehicles always share same zone and driver
                      if (assignment.vehicle.registration_number === 'CN30435' || assignment.vehicle.registration_number === 'Mission Trailer') {
                        const cn30435 = assignedVehicles.find(a => a.vehicle.registration_number === 'CN30435')
                        const trailer = assignedVehicles.find(a => a.vehicle.registration_number === 'Mission Trailer')
                        
                        if (cn30435 && trailer) {
                          // Use zone from whichever has orders, or CN30435's zone
                          dynamicZone = cn30435.destinationGroup || trailer.destinationGroup || dynamicZone
                          // Share driver
                          const sharedDriver = cn30435.assignedDrivers || trailer.assignedDrivers
                          cn30435.assignedDrivers = sharedDriver
                          trailer.assignedDrivers = sharedDriver
                          // Both use same zone
                          cn30435.dynamicZone = dynamicZone
                          trailer.dynamicZone = dynamicZone
                        }
                      }
                      
                      assignment.dynamicZone = dynamicZone
                      if (!groups[dynamicZone]) groups[dynamicZone] = []
                      groups[dynamicZone].push(assignment)
                      return groups
                    }, {} as Record<string, any[]>)

                    return (
                      <div className="space-y-6">
                        <div className="flex items-center gap-2">
                          <div className="h-1 w-1 rounded-full bg-slate-600"></div>
                          <h4 className="font-semibold text-slate-800 text-base">Vehicle Assignments by Route</h4>
                        </div>
                        {Object.entries(routeGroups).map(([route, assignments]) => (
                          <div key={route} className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden">
                            <div className={`px-4 py-2.5 ${route === 'Unassigned Route'
                              ? 'bg-gradient-to-r from-gray-500 to-gray-400'
                              : 'bg-gradient-to-r from-slate-700 to-slate-600'
                              }`}>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                  <div className="p-1.5 bg-white/20 rounded-md backdrop-blur-sm">
                                    <MapPin className="h-4 w-4 text-white" />
                                  </div>
                                  <div>
                                    <h5 className="font-semibold text-white text-sm">{route}</h5>
                                    <p className="text-xs text-slate-200">{assignments.length} vehicle{assignments.length !== 1 ? 's' : ''} • {assignments.reduce((sum, a) => sum + a.assignedOrders.length, 0)} order{assignments.reduce((sum, a) => sum + a.assignedOrders.length, 0) !== 1 ? 's' : ''}</p>
                                  </div>
                                </div>
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-md">
                                  <span className="text-lg font-bold text-white">
                                    {assignments.reduce((sum, a) => sum + a.assignedOrders.length, 0)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="p-5 bg-slate-50">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {assignments.map((assignment, index) => {
                                  const isPaired = assignment.vehicle.registration_number === 'CN30435' || assignment.vehicle.registration_number === 'Mission Trailer'
                                  return (
                                    <div
                                      key={index}
                                      className="group p-4 border border-slate-200 rounded-lg bg-white hover:border-slate-400 hover:shadow-md transition-all cursor-pointer"
                                      onClick={() => {
                                        const dateParam = selectedDate === 'today' ? new Date().toISOString().split('T')[0] : selectedDate === 'tomorrow' ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] : new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().split('T')[0]
                                        window.location.href = `/load-plan/vehicle/${assignment.vehicle.id}?date=${dateParam}`
                                      }}
                                    >
                                      <div className="flex justify-between items-start mb-3">
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2">
                                            <p className="font-semibold text-slate-800 text-sm truncate">{assignment.vehicle.registration_number}</p>
                                            {isPaired && (
                                              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded font-medium">Paired</span>
                                            )}
                                            {assignment.assignedOrders.some(o => o.status === 'in-trip') && (
                                              <span className="px-1.5 py-0.5 bg-blue-600 text-white text-xs rounded font-bold">ON TRIP</span>
                                            )}
                                          </div>
                                          <p className="text-xs text-slate-500 mt-0.5 truncate">{assignment.vehicle.description}</p>
                                          {assignment.assignedDrivers && assignment.assignedDrivers.length > 0 && (
                                            <div className="mt-1">
                                              <p className="text-xs text-green-600 font-medium">
                                                Driver: {assignment.assignedDrivers.map(d => `${d.first_name} ${d.surname}`).join(', ')}
                                              </p>
                                            </div>
                                          )}
                                        </div>
                                        <span className={`ml-2 px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap ${assignment.utilization > 95 ? 'bg-red-50 text-red-700 border border-red-200' :
                                          assignment.utilization > 85 ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                            'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                          }`}>
                                          {assignment.utilization.toFixed(0)}%
                                        </span>
                                      </div>
                                      <div className="space-y-2">
                                        <div className="flex justify-between text-xs">
                                          <span className="text-slate-500">Capacity</span>
                                          <span className="font-medium text-slate-700">{assignment.capacity.toLocaleString()}kg</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                          <span className="text-slate-500">Loaded</span>
                                          <span className="font-medium text-slate-700">{Math.round(assignment.totalWeight).toLocaleString()}kg</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                          <span className="text-slate-500">Orders</span>
                                          <span className="font-medium text-slate-700">{assignment.assignedOrders.length}</span>
                                        </div>
                                        {assignment.routeDistance && (
                                          <div className="flex justify-between text-xs">
                                            <span className="text-slate-500">Distance</span>
                                            <span className="font-medium text-slate-700">{assignment.routeDistance}km</span>
                                          </div>
                                        )}
                                        {assignment.routeDuration && (
                                          <div className="flex justify-between text-xs">
                                            <span className="text-slate-500">Duration</span>
                                            <span className="font-medium text-slate-700">{Math.floor(assignment.routeDuration / 60)}h {assignment.routeDuration % 60}m</span>
                                          </div>
                                        )}
                                        {assignment.optimizedRoute && (
                                          <div className="flex justify-between text-xs">
                                            <span className="text-slate-500">Route</span>
                                            <span className="font-medium text-green-700 flex items-center gap-1">
                                              <CheckCircle className="h-3 w-3" />
                                              Optimized
                                            </span>
                                          </div>
                                        )}
                                        {assignment.assignedDrivers && assignment.assignedDrivers.length > 0 && (
                                          <div className="flex justify-between text-xs">
                                            <span className="text-slate-500">Drivers</span>
                                            <span className="font-medium text-slate-700">{assignment.assignedDrivers.length}</span>
                                          </div>
                                        )}
                                        <div className="pt-2">
                                          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                            <div
                                              className={`h-1.5 rounded-full transition-all ${assignment.utilization > 95 ? 'bg-red-500' :
                                                assignment.utilization > 85 ? 'bg-amber-500' :
                                                  'bg-emerald-500'
                                                }`}
                                              style={{ width: `${Math.min(assignment.utilization, 100)}%` }}
                                            ></div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Unassigned Vehicles Section */}
                        {(() => {
                          const displayAssignments = vehicleAssignments.length > 0 ? vehicleAssignments : (selectedDate === 'today' ? todayAssignments : dayAfterAssignments)
                          
                          // Filter unassigned vehicles, excluding paired vehicles that shouldn't be shown
                          const unassignedVehicles = displayAssignments.filter(a => {
                            if (a.assignedOrders.length > 0) return false
                            
                            // For paired vehicles, don't show empty ones if pairing isn't justified
                            if (a.vehicle.registration_number === 'CN30435' || a.vehicle.registration_number === 'Mission Trailer') {
                              const missionTrailer = displayAssignments.find(v => v.vehicle.registration_number === 'Mission Trailer')
                              const cn30435 = displayAssignments.find(v => v.vehicle.registration_number === 'CN30435')
                              
                              if (missionTrailer && cn30435) {
                                const combinedWeight = missionTrailer.totalWeight + cn30435.totalWeight
                                const combinedCapacity = missionTrailer.capacity + cn30435.capacity
                                const combinedUtilization = (combinedWeight / combinedCapacity) * 100
                                
                                // Don't show empty paired vehicles if pairing isn't justified
                                const isPairingJustified = combinedUtilization >= 50 || combinedWeight >= 800
                                console.log(`Unassigned pairing check for ${a.vehicle.registration_number}: combined weight ${combinedWeight}kg, utilization ${combinedUtilization.toFixed(1)}%, justified: ${isPairingJustified}`)
                                if (!isPairingJustified) {
                                  console.log(`Hiding unassigned ${a.vehicle.registration_number} - pairing not justified`)
                                  return false
                                }
                              }
                            }
                            
                            return true
                          })
                          return unassignedVehicles.length > 0 ? (
                            <div className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden">
                              <div className="bg-gradient-to-r from-gray-500 to-gray-400 px-4 py-2.5">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2.5">
                                    <div className="p-1.5 bg-white/20 rounded-md backdrop-blur-sm">
                                      <AlertTriangle className="h-4 w-4 text-white" />
                                    </div>
                                    <div>
                                      <h5 className="font-semibold text-white text-sm">Unassigned Vehicles</h5>
                                      <p className="text-xs text-slate-200">{unassignedVehicles.length} vehicle{unassignedVehicles.length !== 1 ? 's' : ''} • 0 orders</p>
                                    </div>
                                  </div>
                                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-md">
                                    <span className="text-lg font-bold text-white">0</span>
                                  </div>
                                </div>
                              </div>
                              <div className="p-5 bg-gray-50">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {unassignedVehicles.map((assignment, index) => (
                                    <div key={index} className="p-4 border border-gray-200 rounded-lg bg-white">
                                      <div className="flex justify-between items-start mb-3">
                                        <div className="flex-1 min-w-0">
                                          <p className="font-semibold text-gray-800 text-sm truncate">{assignment.vehicle.registration_number}</p>
                                          <p className="text-xs text-gray-500 mt-0.5 truncate">{assignment.vehicle.description}</p>
                                        </div>
                                        <span className="ml-2 px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-100 text-gray-600">0%</span>
                                      </div>
                                      <div className="space-y-2">
                                        <div className="flex justify-between text-xs">
                                          <span className="text-gray-500">Capacity</span>
                                          <span className="font-medium text-gray-700">{assignment.capacity.toLocaleString()}kg</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                          <span className="text-gray-500">Status</span>
                                          <span className="font-medium text-gray-700">Available</span>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ) : null
                        })()}
                      </div>
                    )
                  })()}

                  {(vehicleAssignments.length > 0 || todayAssignments.length > 0 || dayAfterAssignments.length > 0) && (() => {
                    const trulyUnassigned = unassignedOrders.filter(o => o.status === 'unassigned')
                    return trulyUnassigned.length > 0 ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="h-1 w-1 rounded-full bg-red-600"></div>
                          <h4 className="font-semibold text-slate-800 text-base">Remaining Unassigned Orders</h4>
                          <span className="ml-auto px-2.5 py-1 bg-red-100 text-red-700 rounded-md text-xs font-semibold">{trulyUnassigned.length}</span>
                        </div>
                        <div className="border border-red-200 rounded-xl bg-white shadow-sm overflow-hidden">
                          <div className="bg-gradient-to-r from-red-50 to-red-100 px-5 py-3 border-b border-red-200">
                            <p className="text-xs text-red-700 font-medium">These orders could not be assigned (check capacity/restrictions)</p>
                          </div>
                          <div className="p-4 bg-red-50/30">
                            <div className="space-y-2">
                              {trulyUnassigned.map((order, index) => (
                                <div key={index} className="p-3 bg-white rounded-lg border border-red-100 hover:border-red-200 transition-colors">
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-semibold text-slate-800 truncate">{order.customerName}</p>
                                      <p className="text-xs text-slate-500 mt-0.5">Trip: {order.tripId}</p>
                                      {order.priority > 0 && (
                                        <p className="text-xs text-orange-600 font-medium mt-0.5">Priority: {order.priority} (carried over)</p>
                                      )}
                                    </div>
                                    <div className="text-right ml-3">
                                      <p className="text-sm font-semibold text-slate-800">{Math.round(order.totalWeight).toLocaleString()}kg</p>
                                      {order.drums > 0 && (
                                        <p className="text-xs text-slate-500 mt-0.5">{order.drums} drums</p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null
                  })()}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>


      <ClientAddressPopup
        isOpen={showAddressPopup}
        onClose={() => setShowAddressPopup(false)}
        client={selectedClient}
        onUseAsPickup={handleUseAsPickup}
        onUseAsDropoff={handleUseAsDropoff}
        onSkip={handleSkipAddress}
      />

      <NewCustomerModal
        isOpen={showNewCustomerModal}
        onClose={() => {
          setShowNewCustomerModal(false)
          setPendingCustomer(null)
        }}
        customerName={pendingCustomer?.name || ''}
        customerId={pendingCustomer?.id || ''}
        initialLocation={pendingCustomer?.location || ''}
        onCustomerCreated={async (customer) => {
          console.log('Customer created:', customer)
          
          // Update orders in database with customer location
          const { error: updateError } = await supabase
            .from('pending_orders')
            .update({
              latitude: customer.latitude,
              longitude: customer.longitude,
              location: customer.address,
              location_group: customer.zone,
              needs_customer_setup: false
            })
            .eq('customer_id', customer.customer_id)
          
          if (updateError) {
            console.error('Error updating orders:', updateError)
            toast.error('Failed to update orders with customer location')
            return
          }
          
          // Reload orders to update state
          await loadPendingOrders()
          
          // Get remaining customers from stored list
          const allPending = window.pendingCustomers || []
          const currentIndex = allPending.findIndex(c => c.id === customer.customer_id)
          const remainingCustomers = allPending.slice(currentIndex + 1)
          
          if (remainingCustomers.length > 0) {
            // Continue to next customer
            setPendingCustomer(remainingCustomers[0])
            toast.success(`Customer ${customer.customer_name} added. ${remainingCustomers.length} more to go.`)
          } else {
            // All customers done
            setShowNewCustomerModal(false)
            setPendingCustomer(null)
            window.pendingCustomers = []
            toast.success('All customers set up! Ready for auto-assignment.')
          }
        }}
      />

      <RouteEditModal
        isOpen={showRouteModal}
        onClose={() => setShowRouteModal(false)}
        stopPoints={stopPoints || []}
        customStopPoints={customStopPoints || []}
        availableStopPoints={availableStopPoints || []}
        onReorder={(newOrder) => {
          console.log('Reordering stop points:', newOrder)
          setStopPoints(newOrder.stopPoints || [])
          setCustomStopPoints(newOrder.customStopPoints || [])
          setIsManuallyOrdered(true)
          setShowRouteModal(false)
        }}
        onForceRecalculate={() => {
          console.log('Force recalculating route')
          setIsManuallyOrdered(false)
          setShowRouteModal(false)
        }}
      />
      <Dialog open={showVehicleDetailsModal} onOpenChange={setShowVehicleDetailsModal}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle>
                {selectedVehicleForDetails?.vehicle.registration_number} - Route Planning
              </DialogTitle>
              <Button
                onClick={async () => {
                  if (!selectedVehicleForDetails) return
                  setIsReoptimizing(true)
                  try {
                    const scheduledDate = selectedDate === 'today' ? new Date().toISOString().split('T')[0] : 
                                         selectedDate === 'tomorrow' ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] : 
                                         new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().split('T')[0]
                    
                    // Update delivery sequences in database
                    for (let idx = 0; idx < selectedVehicleForDetails.assignedOrders.length; idx++) {
                      const order = selectedVehicleForDetails.assignedOrders[idx]
                      await supabase.from('pending_orders').update({
                        delivery_sequence: idx + 1,
                        assigned_vehicle_id: selectedVehicleForDetails.vehicle.id,
                        scheduled_date: scheduledDate
                      }).eq('id', order.id)
                    }
                    
                    const DEPOT_LAT = -33.9249
                    const DEPOT_LON = 18.6369
                    const validOrders = selectedVehicleForDetails.assignedOrders.filter(o => o.latitude && o.longitude)
                    
                    let optimizedOrders = selectedVehicleForDetails.assignedOrders
                    let routeGeometry = null
                    let distance = 0
                    let duration = 0
                    
                    if (validOrders.length > 0) {
                      const geoapifyKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY
                      if (geoapifyKey) {
                        const waypoints = validOrders.map(o => ({ lat: o.latitude, lon: o.longitude }))
                        
                        const response = await fetch(
                          `https://api.geoapify.com/v1/routeplanner?apiKey=${geoapifyKey}`,
                          {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              mode: 'truck',
                              waypoints: [
                                { lat: DEPOT_LAT, lon: DEPOT_LON },
                                ...waypoints,
                                { lat: DEPOT_LAT, lon: DEPOT_LON }
                              ],
                              details: ['route_details']
                            })
                          }
                        )
                        
                        if (response.ok) {
                          const data = await response.json()
                          if (data.features?.[0]) {
                            const feature = data.features[0]
                            routeGeometry = feature.geometry.coordinates
                            distance = Math.round((feature.properties.distance || 0) / 1000)
                            duration = Math.round((feature.properties.time || 0) / 1000 / 60)
                            optimizedOrders = validOrders
                          }
                        }
                      }
                    }
                    
                    // Store route geometry
                    if (routeGeometry) {
                      await supabase.from('vehicle_routes').upsert({
                        vehicle_id: selectedVehicleForDetails.vehicle.id,
                        scheduled_date: scheduledDate,
                        route_geometry: routeGeometry,
                        distance: distance * 1000,
                        duration: duration * 60,
                        updated_at: new Date().toISOString()
                      }, { onConflict: 'vehicle_id,scheduled_date' })
                    }
                    
                    // Create updated assignment object
                    const updatedAssignment = {
                      ...selectedVehicleForDetails,
                      assignedOrders: optimizedOrders,
                      routeDistance: distance,
                      routeDuration: duration,
                      optimizedRoute: routeGeometry ? { geometry: routeGeometry, distance, duration } : null
                    }
                    
                    // Update modal state
                    setSelectedVehicleForDetails(updatedAssignment)
                    
                    // Update the appropriate day's assignments
                    let updatedDayAssignments
                    if (selectedDate === 'today') {
                      updatedDayAssignments = todayAssignments.map(a => 
                        a.vehicle.id === selectedVehicleForDetails.vehicle.id ? updatedAssignment : a
                      )
                      setTodayAssignments(updatedDayAssignments)
                    } else if (selectedDate === 'tomorrow') {
                      updatedDayAssignments = tomorrowAssignments.map(a => 
                        a.vehicle.id === selectedVehicleForDetails.vehicle.id ? updatedAssignment : a
                      )
                      setTomorrowAssignments(updatedDayAssignments)
                    } else if (selectedDate === 'dayafter') {
                      updatedDayAssignments = dayAfterAssignments.map(a => 
                        a.vehicle.id === selectedVehicleForDetails.vehicle.id ? updatedAssignment : a
                      )
                      setDayAfterAssignments(updatedDayAssignments)
                    }
                    
                    // Also update vehicleAssignments for immediate UI feedback
                    const updatedVehicleAssignments = vehicleAssignments.map(a => 
                      a.vehicle.id === selectedVehicleForDetails.vehicle.id ? updatedAssignment : a
                    )
                    setVehicleAssignments(updatedVehicleAssignments)
                    
                    // Reload assignments from database to sync UI
                    await loadAssignmentsFromDatabase()
                    
                    setShowVehicleDetailsModal(false)
                    toast.success('Changes saved and route optimized')
                  } catch (error) {
                    console.error('Error saving changes:', error)
                    toast.error('Failed to save changes')
                  } finally {
                    setIsReoptimizing(false)
                  }
                }}
                disabled={isReoptimizing}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isReoptimizing ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </DialogHeader>
          {selectedVehicleForDetails && (
            <div className="space-y-6">
              <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Destination</p>
                  <p className="font-semibold">{selectedVehicleForDetails.destinationGroup || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Utilization</p>
                  <p className="font-semibold">{selectedVehicleForDetails.utilization.toFixed(0)}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Loaded Weight</p>
                  <p className="font-semibold">{selectedVehicleForDetails.totalWeight}kg / {selectedVehicleForDetails.capacity}kg</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Delivery Stops</p>
                  <p className="font-semibold">{selectedVehicleForDetails.assignedOrders.length}</p>
                </div>
              </div>

              {/* Route Map */}
              {selectedVehicleForDetails.assignedOrders.length > 0 && (() => {
                const depot = { lat: -33.9249, lng: 18.6369 }
                const stops = selectedVehicleForDetails.assignedOrders
                  .filter(order => order.latitude && order.longitude)
                  .map(order => ({
                    name: order.customerName || order.customer_name,
                    lat: order.latitude,
                    lng: order.longitude
                  }))

                return stops.length > 0 ? (
                  <div className="border rounded-lg p-4 bg-white">
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <Route className="h-5 w-5" />
                      Delivery Route Map
                    </h4>
                    <VehicleRouteMap
                      geometry={selectedVehicleForDetails.optimizedRoute?.geometry}
                      stops={stops}
                      vehicleName={selectedVehicleForDetails.vehicle.registration_number}
                      depot={depot}
                    />
                  </div>
                ) : null
              })()}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                      </div>
                      Loaded Orders
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">{selectedVehicleForDetails.assignedOrders.length}</span>
                    </h4>
                    {isReoptimizing && (
                      <span className="text-xs text-blue-600 animate-pulse flex items-center gap-1">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                        Optimizing...
                      </span>
                    )}
                  </div>
                  <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {selectedVehicleForDetails.assignedOrders.map((order, idx) => (
                      <div 
                        key={idx} 
                        className={`group relative bg-white border rounded-lg hover:shadow-md transition-all cursor-move ${
                          draggedOverIndex === idx ? 'border-blue-400 shadow-lg ring-2 ring-blue-200' : 'border-slate-200 hover:border-slate-300'
                        }`}
                        draggable
                        onDragStart={() => handleOrderDragStart(order, idx)}
                        onDragOver={(e) => handleOrderDragOver(e, idx)}
                        onDragLeave={() => setDraggedOverIndex(null)}
                        onDrop={() => handleOrderReorder(idx)}
                      >
                        <div className="flex items-center gap-3 p-3">
                          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                            {idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="font-semibold text-sm text-slate-800 truncate">{order.customerName || order.customer_name}</p>
                              <span className="flex-shrink-0 px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-medium">
                                {Math.round(order.totalWeight || order.total_weight)}kg
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
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    Recommended Orders ({selectedVehicleForDetails?.recommendedOrders?.length || 0})
                  </h4>
                  <div className="space-y-2 max-h-80 overflow-y-auto p-3 border-2 border-dashed border-blue-200 rounded-lg bg-blue-50/30">
                    {selectedVehicleForDetails?.recommendedOrders?.map((order, idx) => (
                      <div key={idx} className="p-3 border rounded bg-blue-100 border-blue-300 cursor-move hover:shadow-md transition-shadow" draggable>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{order.customer_name}</p>
                            <p className="text-xs text-gray-600">Trip: {order.trip_id}</p>
                            <p className="text-xs text-gray-600 truncate">{order.location}</p>
                          </div>
                          <div className="text-right ml-2">
                            <p className="text-sm font-semibold">{Math.round(order.total_weight)}kg</p>
                            {(order.drums > 0) && (<p className="text-xs text-gray-600">{order.drums} drums</p>)}
                          </div>
                        </div>
                      </div>
                    )) || <p className="text-center text-gray-500 py-4">No recommended orders</p>}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Route className="h-4 w-4 text-purple-600" />
                    Route Details
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-medium mb-2 text-sm">Delivery Sequence:</h5>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {selectedVehicleForDetails.assignedOrders.map((order, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs p-2 bg-gray-50 rounded">
                            <span className="w-5 h-5 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                              {idx + 1}
                            </span>
                            <div className="flex-1">
                              <p className="font-medium">{order.customerName || order.customer_name}</p>
                              <p className="text-xs text-gray-600 truncate">{order.location}</p>
                            </div>
                            <span className="text-xs font-medium">{Math.round(order.totalWeight || order.total_weight)}kg</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium mb-2 text-sm">Route Summary:</h5>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span>Total Stops:</span>
                          <span className="font-medium">{selectedVehicleForDetails.assignedOrders.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Weight:</span>
                          <span className="font-medium">{Math.round(selectedVehicleForDetails.totalWeight)}kg</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Vehicle Utilization:</span>
                          <span className={`font-medium ${selectedVehicleForDetails.utilization > 90 ? 'text-red-600' :
                            selectedVehicleForDetails.utilization > 75 ? 'text-yellow-600' :
                              'text-green-600'
                            }`}>
                            {selectedVehicleForDetails.utilization.toFixed(0)}%
                          </span>
                        </div>
                        {(selectedVehicleForDetails.routeDistance || selectedVehicleForDetails.optimizedRoute) && (
                          <>
                            <div className="flex justify-between">
                              <span>Route Distance:</span>
                              <span className="font-medium">{selectedVehicleForDetails.routeDistance || Math.round((selectedVehicleForDetails.optimizedRoute?.distance || 0) / 1000)}km</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Est. Duration:</span>
                              <span className="font-medium">{selectedVehicleForDetails.routeDuration ? `${Math.floor(selectedVehicleForDetails.routeDuration / 60)}h ${selectedVehicleForDetails.routeDuration % 60}m` : `${Math.round((selectedVehicleForDetails.optimizedRoute?.duration || 0) / 60)}min`}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Route Status:</span>
                              <span className="font-medium text-green-600 flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Optimized
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                      <AlertTriangle className="h-4 w-4 text-slate-600" />
                    </div>
                    Available Orders
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">{unassignedOrders.length}</span>
                  </h4>
                  <span className="text-xs text-slate-500">Drop here to unassign</span>
                </div>
                <div 
                  className="min-h-[120px] max-h-60 overflow-y-auto p-4 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50/50 transition-colors hover:border-slate-400 hover:bg-slate-100/50"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleOrderDrop('unassigned')}
                >
                  {unassignedOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center mb-3">
                        <AlertTriangle className="h-6 w-6 text-slate-400" />
                      </div>
                      <p className="text-sm text-slate-500 font-medium">No unassigned orders</p>
                      <p className="text-xs text-slate-400 mt-1">Drag orders here to remove from route</p>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {unassignedOrders.map((order, idx) => (
                        <div key={idx} className="bg-white border border-slate-200 rounded-lg p-3 hover:shadow-sm transition-shadow">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm text-slate-800 truncate">{order.customerName || order.customer_name}</p>
                              <p className="text-xs text-slate-500 truncate">{order.location}</p>
                            </div>
                            <span className="flex-shrink-0 ml-3 px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-medium">
                              {Math.round(order.totalWeight || order.total_weight)}kg
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>


    </div>
        
  )
}
