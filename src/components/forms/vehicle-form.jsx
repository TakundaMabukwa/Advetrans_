'use client'

// react
import { useState } from 'react'

// components
import { Button } from '@/components/ui/button'
import { CardDescription, CardTitle } from '@/components/ui/card'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'

// icons
import {
  Save,
  Truck,
  CheckCircle,
  Wrench,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react'

// context
import { useGlobalContext } from '@/context/global-context/context'
import * as api from '@/context/vehicles-context/api'
import DetailCard from '@/components/ui/detail-card'
import { Separator } from '@/components/ui/separator'
import DynamicInput from '@/components/ui/dynamic-input'

// Function to get status badge for preview
const getStatusBadge = (status) => {
  switch (status) {
    case 'available':
      return (
        <Badge
          variant="outline"
          className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-800"
        >
          <CheckCircle className="h-3 w-3 mr-1" /> Available
        </Badge>
      )
    case 'on-trip':
      return (
        <Badge className="bg-blue-500 hover:bg-blue-600">
          <Truck className="h-3 w-3 mr-1" /> In Use
        </Badge>
      )
    case 'maintenance':
      return (
        <Badge
          variant="outline"
          className="bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900 dark:text-amber-200 dark:border-amber-800"
        >
          <Wrench className="h-3 w-3 mr-1" /> Maintenance
        </Badge>
      )
    case 'inactive':
      return (
        <Badge variant="destructive">
          <AlertTriangle className="h-3 w-3 mr-1" /> Inactive
        </Badge>
      )
    default:
      return <Badge>{status}</Badge>
  }
}

const VehicleForm = ({ onCancel, id }) => {
  const { vehicles, cost_centres, vehiclesDispatch } = useGlobalContext()
  const costCentres = cost_centres?.data
  const vehicle = vehicles?.data?.find((v) => v.id === id)

  const [formData, setFormData] = useState({
    id: vehicle?.id || '',
    type: vehicle?.type || '',
    regNumber: vehicle?.regNumber || '',
    licensePlate: vehicle?.licensePlate || '',
    vin: vehicle?.vin || '',
    engineNumber: vehicle?.engineNumber || '',
    vehicleCategory: vehicle?.vehicleCategory || '',
    model: vehicle?.model || '',
    seriesName: vehicle?.seriesName || '',
    vehicleDescription: vehicle?.vehicleDescription || '',
    tare: vehicle?.tare || '',
    registrationDate: vehicle?.registrationDate || '',

    capacity: vehicle?.capacity || '',
    fuelType: vehicle?.fuelType || 'Diesel',
    status: vehicle?.status || 'available', // don't need
    width: vehicle?.width || '',
    height: vehicle?.height || '',
    length: vehicle?.length || '',
    transmission: vehicle?.transmission || 'manual',
    costCentre: vehicle?.costCentre || '',
    purchaseDate: vehicle?.purchaseDate || '',
    priority: vehicle?.priority || '',

    licenceExpiryDate: vehicle?.licenceExpiryDate || '',
    lastService: vehicle?.lastService || '',
    serviceIntervalsKM: vehicle?.serviceIntervalsKM || '',
    serviceIntervalsMonths: vehicle?.serviceIntervalsMonths || '',

    manufacturer: vehicle?.manufacturer || '',
    year: vehicle?.year || new Date().getFullYear().toString(),
    color: vehicle?.color || '',
    insuranceExpiry: vehicle?.insuranceExpiry || '',

    odometer: vehicle?.odometer || '',
    fuelEfficiency: vehicle?.fuelEfficiency || '',
    dimensions: vehicle?.dimensions || '',
    maxSpeed: vehicle?.maxSpeed || '',
    currentDriver: vehicle?.currentDriver || '',
    assignedTo: vehicle?.assignedTo || '',
    currentTripId: vehicle?.currentTripId || null,
    lastTripId: vehicle?.lastTripId || null,

    trackerProvider: vehicle?.trackerProvider || '',
    trackerDeviceId: vehicle?.trackerDeviceId || '',
  })

  const [currentTab, setCurrentTab] = useState(0)

  const nextStep = () => {
    if (currentTab < 2) {
      const next = currentTab + 1
      setCurrentTab(next)
    }
  }

  const prevStep = () => {
    if (currentTab > 0) {
      const prev = currentTab - 1
      setCurrentTab(prev)
    }
  }

  const paginationButtons = [
    {
      type: 'button',
      variant: 'outline',
      onClick: (index) => prevStep(index),
      name: 'Back',
    },
    {
      type: 'button',
      onClick: (index) => nextStep(index),
      name: 'Next',
    },
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const onSubmit = (data) => {
    console.log('id :>> ', id)
    api.upsertVehicle(id, data, vehiclesDispatch)
    onCancel()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const tabs = [
    { name: 'Licence Information', value: '0' },
    { name: 'Additional Details', value: '1' },
    { name: 'Current Status', value: '2' },
  ]

  const licence_inputs = [
    {
      htmlFor: 'id',
      label: 'ID',
      value: formData.id,
      required: false,
      readOnly: true,
    },
    {
      type: 'select',
      htmlFor: 'type',
      label: 'Type *',
      placeholder: 'Select type',
      value: formData.type,
      required: true,
      readOnly: false,
      options: [
        { value: 'Vehicle', label: 'Vehicle' },
        { value: 'Trailer', label: 'Trailer' },
      ],
    },
    {
      htmlFor: 'regNumber',
      label: 'Registration Number *',
      value: formData.regNumber,
      placeholder: 'e.g., CA 123-456',
      required: true,
      readOnly: false,
    },
    {
      htmlFor: 'licensePlate',
      label: 'License Number *',
      value: formData.licensePlate,
      placeholder: 'e.g., CA123456',
      required: true,
      readOnly: false,
    },
    {
      htmlFor: 'vin',
      label: 'VIN Number *',
      value: formData.vin,
      placeholder: 'e.g., 1HGBH41JXMN109186',
      required: true,
      readOnly: false,
    },
    {
      htmlFor: 'engineNumber',
      label: 'Engine Number *',
      value: formData.engineNumber,
      placeholder: 'e.g., ABC123456789',
      required: true,
      readOnly: false,
    },
    {
      htmlFor: 'model',
      label: 'Make *',
      value: formData.model,
      placeholder: 'e.g., Toyota',
      required: true,
      readOnly: false,
    },
    {
      htmlFor: 'manufacturer',
      label: 'Model/Manufacturer *',
      value: formData.manufacturer,
      placeholder: 'e.g., Hilux',
      required: true,
      readOnly: false,
    },
    {
      htmlFor: 'seriesName',
      label: 'Series Name *',
      value: formData.seriesName,
      placeholder: 'e.g., SR5',
      required: true,
      readOnly: false,
    },
    {
      htmlFor: 'vehicleCategory',
      label: 'Vehicle Category *',
      value: formData.vehicleCategory,
      placeholder: 'e.g., Light Commercial',
      required: true,
      readOnly: false,
    },
    {
      htmlFor: 'vehicleDescription',
      label: 'Vehicle Description *',
      value: formData.vehicleDescription,
      placeholder: 'e.g., Double cab bakkie',
      required: true,
      readOnly: false,
    },
    {
      htmlFor: 'tare',
      label: 'Tare *',
      value: formData.tare,
      placeholder: 'e.g., 1850 kg',
      required: true,
      readOnly: false,
    },

    {
      htmlFor: 'year',
      label: 'Manufacture Date *',
      type: 'date',
      value: formData.year,
      placeholder: 'Select manufacture date',
      required: true,
      readOnly: false,
    },
    {
      htmlFor: 'registrationDate',
      label: 'Registration Date *',
      type: 'date',
      value: formData.registrationDate,
      placeholder: 'Select registration date',
      required: true,
      readOnly: false,
    },
  ]

  const additional_information = [
    {
      type: 'select',
      htmlFor: 'costCentre',
      label: 'Cost Centre *',
      placeholder: 'Select cost centre',
      value: formData.costCentre,
      required: true,

      options: costCentres?.map((cc) => {
        return { value: cc.name, label: cc.name }
      }),
    },
    {
      htmlFor: 'color',
      label: 'Color *',
      value: formData.color,
      placeholder: 'e.g., White',
      required: true,
      readOnly: false,
    },
    {
      type: 'select',
      htmlFor: 'fuelType',
      label: 'Fuel Type *',
      placeholder: 'Select fuel type',
      value: formData.fuelType,
      required: true,
      readOnly: false,
      options: [
        { value: 'Diesel', label: 'Diesel' },
        { value: 'Petrol', label: 'Petrol' },
        { value: 'Electric', label: 'Electric' },
        { value: 'Hybrid', label: 'Hybrid' },
      ],
    },

    {
      htmlFor: 'capacity',
      label: 'Fuel Tank Size *',
      value: formData.capacity,
      placeholder: 'e.g., 80L',
      required: true,
    },
    {
      htmlFor: 'transmission',
      label: 'Transmission *',
      placeholder: 'Select transmission type',
      value: formData.transmission,
      type: 'select',
      required: true,
      options: [
        { value: 'Manual', label: 'Manual' },
        { value: 'Automatic', label: 'Automatic' },
      ],
    },
    {
      htmlFor: 'length',
      label: 'Length *',
      value: formData.length,
      placeholder: 'e.g., 5.2m',
      required: true,
    },
    {
      htmlFor: 'height',
      label: 'Height *',
      value: formData.height,
      placeholder: 'e.g., 2.1m',
      required: true,
    },
    {
      htmlFor: 'width',
      label: 'Width *',
      value: formData.width,
      placeholder: 'e.g., 1.8m',
      required: true,
    },
    {
      htmlFor: 'odometer',
      label: 'Odometer Reading *',
      value: formData.odometer,
      placeholder: 'e.g., 125,000 km',
      required: true,
    },
    {
      htmlFor: 'priority',
      label: 'Vehicle Priority',
      value: formData.priority,
      placeholder: 'e.g., High, Medium, Low',
      required: false,
    },
  ]

  const maintenance_information = [
    {
      htmlFor: 'licenceExpiryDate',
      label: 'Licence Expiry Date *',
      type: 'date',
      value: formData.licenceExpiryDate,
      placeholder: 'Select expiry date',
      required: true,
      readOnly: false,
    },
    {
      htmlFor: 'lastService',
      label: 'Last Service Date',
      value: formData.lastService,
      type: 'date',
      placeholder: 'Select last service date',
      required: false,
    },
    {
      htmlFor: 'serviceIntervalsKM',
      label: 'Service Intervals (KM)',
      value: formData.serviceIntervalsKM,
      type: 'number',
      placeholder: 'e.g., 15000',
      required: false,
    },
    {
      htmlFor: 'serviceIntervalsMonths',
      label: 'Service Intervals (Months)',
      value: formData.serviceIntervalsMonths,
      type: 'number',
      placeholder: 'e.g., 12',
      required: false,
    },
  ]

  const tracker_information = [
    {
      htmlFor: 'trackerProvider',
      label: 'Tracker Provider',
      value: formData.trackerProvider,
      placeholder: 'e.g., Tracker SA',
      required: true,
    },
    {
      htmlFor: 'trackerDeviceId',
      label: 'Tracker Device ID',
      value: formData.trackerDeviceId,
      placeholder: 'e.g., 1234567890',
      required: true,
    },
  ]

  const insurance_information = []

  const current_status = [
    {
      htmlFor: 'currentDriver',
      label: 'Current Driver',
      value: formData.currentDriver,
      readOnly: true,
    },
    {
      htmlFor: 'assignedTo',
      label: 'Current Client',
      value: formData.assignedTo,
      readOnly: true,
    },
    {
      htmlFor: 'currentTripId',
      label: 'Current Trip ID',
      value: formData.currentTripId || 'None',
      readOnly: true,
    },
    {
      htmlFor: 'lastTripId',
      label: 'Last Trip ID',
      value: formData.lastTripId || 'None',
      readOnly: true,
    },
    {
      htmlFor: 'status',
      label: 'Current Status',
      placeholder: 'Select current status',
      value: formData.status,
      type: 'select',
      required: false,
      options: [
        { value: 'available', label: 'Available' },
        { value: 'assigned', label: 'Assigned' },
        { value: 'on-trip', label: 'On A Trip' },
        { value: 'maintenance', label: 'Maintenance' },
        { value: 'inactive', label: 'Inactive' },
      ],
    },
  ]

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {vehicle?.id ? `Edit Vehicle` : 'Add New Vehicle'}
            </h2>
            <p className="text-muted-foreground">
              {vehicle?.id
                ? `${vehicle.model} • ${vehicle.type} • ${vehicle.regNumber}`
                : 'Enter vehicle details'}
            </p>
          </div>
        </div>

        <Tabs
          value={tabs[currentTab]?.value}
          onValueChange={(value) => {
            const index = tabs.findIndex((tab) => tab.value === value)
            setCurrentTab(index)
          }}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 gap-6">
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

          <TabsContent value={tabs[0].value} className="space-y-4">
            <DetailCard
              title={'Vehicle Information'}
              description={'Basic information about this vehicle'}
            >
              <DynamicInput
                inputs={licence_inputs}
                handleSelectChange={handleSelectChange}
                handleChange={handleChange}
              />
            </DetailCard>
          </TabsContent>

          <TabsContent value={tabs[1].value} className="space-y-4">
            <DetailCard
              title={'Additional Information'}
              description={'Technical specifications and documentation'}
            >
              <DynamicInput
                inputs={additional_information}
                handleSelectChange={handleSelectChange}
                handleChange={handleChange}
              />

              <Separator className="my-4 space-y-1" />

              <div className="mb-6">
                <CardTitle>Maintenance Information</CardTitle>
                <CardDescription>
                  Service information about the vehicle
                </CardDescription>
              </div>

              <DynamicInput
                inputs={maintenance_information}
                handleSelectChange={handleSelectChange}
                handleChange={handleChange}
              />

              <Separator className="my-4 space-y-1" />
              <div className="mb-6">
                <CardTitle>Vehicle Tracking information</CardTitle>
                <CardDescription>
                  Tracker information for the vehicle
                </CardDescription>
              </div>

              <DynamicInput
                inputs={tracker_information}
                handleSelectChange={handleSelectChange}
                handleChange={handleChange}
              />
            </DetailCard>
          </TabsContent>

          <TabsContent value={tabs[2].value} className="space-y-4">
            <DetailCard
              title={'Current Status'}
              description={'Current operational status and assignments'}
            >
              <DynamicInput
                inputs={current_status}
                handleSelectChange={handleSelectChange}
                handleChange={handleChange}
              />
            </DetailCard>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between gap-2 ">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <div className="items-center space-x-2">
            <Button
              type="button"
              variant="outline"
              className={currentTab == 0 ? 'shadow-none' : 'shadow'}
              disabled={currentTab == 0}
              onClick={prevStep}
            >
              <ChevronLeft />
            </Button>
            <Button
              variant="outline"
              type="button"
              className={currentTab == 2 ? 'shadow-none' : 'shadow'}
              disabled={currentTab == 2}
              onClick={nextStep}
            >
              <ChevronRight />
            </Button>
          </div>
          <Button type="submit" disabled={currentTab !== 2}>
            <Save className="mr-2 h-4 w-4" /> Save Vehicle
          </Button>
        </div>
      </div>
    </form>
  )
}

export default VehicleForm
