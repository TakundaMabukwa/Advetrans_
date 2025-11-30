'use client'

// next
import { useRouter } from 'next/navigation'

// components

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Truck,
  Edit,
  Trash2,
  Wrench,
  Calendar,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react'
import { DataTable } from '@/components/ui/data-table'

// context
import { useGlobalContext } from '@/context/global-context/context'

// components
import DetailActionBar from '@/components/layout/detail-action-bar'
import DetailCard from '@/components/ui/detail-card'

// Function to get status badge
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
    case 'in-use':
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

export default function VehicleDetails({ id }) {
  const router = useRouter()
  const { vehicles, cost_centres } = useGlobalContext()
  // Find the vehicle with the matching ID
  const vehicle = vehicles.data.find((v) => v.id === id) || {
    id: 'Not Found',
    type: 'Unknown',
    model: 'Vehicle Not Found',
    regNumber: 'Unknown',
    status: 'unknown',
  }

  // Column definitions for maintenance history
  const maintenanceColumns = [
    {
      accessorKey: 'date',
      header: 'Date',
    },
    {
      accessorKey: 'type',
      header: 'Type',
    },
    {
      accessorKey: 'description',
      header: 'Description',
    },
    {
      accessorKey: 'cost',
      header: 'Cost',
    },
  ]

  // Column definitions for fuel history
  const fuelColumns = [
    {
      accessorKey: 'date',
      header: 'Date',
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
    },
    {
      accessorKey: 'cost',
      header: 'Cost',
    },
    {
      accessorKey: 'odometer',
      header: 'Odometer',
    },
  ]

  // Column definitions for trip history
  const tripColumns = [
    {
      accessorKey: 'id',
      header: 'Trip ID',
    },
    {
      accessorKey: 'date',
      header: 'Date',
    },
    {
      accessorKey: 'route',
      header: 'Route',
    },
    {
      accessorKey: 'driver',
      header: 'Driver',
    },
    {
      accessorKey: 'distance',
      header: 'Distance',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge
          variant={
            row.getValue('status') === 'completed' ? 'success' : 'secondary'
          }
        >
          {row.getValue('status')}
        </Badge>
      ),
    },
  ]

  const tabs = [
    {
      value: 'maintenance',
      title: `Maintenance History`,
      description: 'Record of all maintenance activities for this vehicle',
      columns: maintenanceColumns,
      data: vehicle.maintenanceHistory || [],
      filterColumn: 'name',
      filterPlaceholder: 'Search maintenance records...',
    },
    {
      value: 'fuel',
      title: `Fuel History`,
      description: 'Record of all fuel purchases for this vehicle',
      columns: fuelColumns,
      data: vehicle.fuelHistory || [],
      filterColumn: 'model',
      filterPlaceholder: 'Search fuel records...',
    },
    {
      value: 'trips',
      title: `Trip History`,
      description: 'Record of all trips made by this vehicle',
      columns: tripColumns,
      data: vehicle.tripHistory || [],
      filterColumn: 'id',
      filterPlaceholder: 'Search trips records...',
    },
  ]

  const vehicle_information = [
    { label: 'ID', value: vehicle.id },
    { label: 'Type', value: vehicle.type },
    { label: 'Make', value: vehicle.model },
    { label: 'Model', value: vehicle.manufacturer },
    { label: 'Registration Number', value: vehicle.regNumber },
    { label: 'License Plate', value: vehicle.licensePlate || 'N/A' },
    { label: 'VIN', value: vehicle.vin || 'N/A' },
    { label: 'Engine Number', value: vehicle.engineNumber || 'N/A' },
    { label: 'Series', value: vehicle.seriesName || 'N/A' },
    { label: 'Category', value: vehicle.vehicleCategory || 'N/A' },
    { label: 'Year', value: vehicle.year || 'N/A' },
    { label: 'Color', value: vehicle.color || 'N/A' },
    { label: 'Capacity', value: vehicle.capacity || 'N/A' },
    { label: 'Fuel Type', value: vehicle.fuelType || 'N/A' },
    { label: 'Transmission', value: vehicle.transmission || 'N/A' },
    { label: 'Status', value: getStatusBadge(vehicle.status) },
    {
      label: 'Cost Centre',
      value:
        cost_centres.data.find((cc) => cc.id === vehicle.costCentre)?.name ||
        'N/A',
    },
  ]

  return (
    <div className="space-y-6">
      <DetailActionBar
        id={id}
        title={vehicle?.regNumber}
        description={`${vehicle.manufacturer || ''} ${vehicle.model || ''}`}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <DetailCard
          title={'Vehicle Information'}
          description={'Detailed information about this vehicle'}
        >
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {vehicle_information.map((info) => (
              <div key={info.label}>
                <dt className="text-sm font-medium text-gray-500">
                  {info.label}
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{info.value}</dd>
              </div>
            ))}
          </dl>
        </DetailCard>

        <DetailCard
          title={'Current Status'}
          description={'Current operational status and metrics'}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col rounded-lg bg-blue-50 p-4 dark:bg-blue-900">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Current Driver
                </span>
                <span className="mt-1 text-lg font-medium">
                  {vehicle.currentDriver || 'None'}
                </span>
              </div>
              <div className="flex flex-col rounded-lg bg-green-50 p-4 dark:bg-green-900">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Assigned To
                </span>
                <span className="mt-1 text-lg font-medium">
                  {vehicle.assignedTo || 'Unassigned'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Odometer
                </span>
                <span className="mt-1 text-lg font-medium">
                  {vehicle.odometer || 'N/A'}
                </span>
              </div>
              <div className="flex flex-col rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Fuel Efficiency
                </span>
                <span className="mt-1 text-lg font-medium">
                  {vehicle.fuelEfficiency || 'N/A'}
                </span>
              </div>
            </div>

            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-500" />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Important Dates
                </span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-xs text-gray-500">Purchase Date</dt>
                  <dd className="text-sm font-medium">
                    {vehicle.purchaseDate || 'N/A'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">Last Service</dt>
                  <dd className="text-sm font-medium">
                    {vehicle.lastService || 'N/A'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">Insurance Expiry</dt>
                  <dd className="text-sm font-medium">
                    {vehicle.insuranceExpiry || 'N/A'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">Next Service Due</dt>
                  <dd className="text-sm font-medium">
                    {vehicle.lastService
                      ? new Date(
                          new Date(vehicle.lastService).setMonth(
                            new Date(vehicle.lastService).getMonth() + 3
                          )
                        )
                          .toISOString()
                          .split('T')[0]
                      : 'N/A'}
                  </dd>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-gray-500" />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Specifications
                </span>
              </div>
              <div className="mt-2">
                <p className="text-sm">
                  {vehicle.dimensions || 'Dimensions not available'}
                </p>
                <p className="text-sm">
                  Max Speed: {vehicle.maxSpeed || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </DetailCard>
      </div>

      <Tabs defaultValue="maintenance">
        <TabsList className="grid w-full grid-cols-3 gap-6">
          {tabs.map((trigger, id) => (
            <TabsTrigger key={id} value={trigger.value}>
              <h6 className="capitalize">{`${trigger.value} (${trigger.data.length})`}</h6>
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="space-y-4">
            <DetailCard title={tab.title} description={tab.description}>
              <DataTable
                columns={tab.columns}
                data={tab.data}
                filterColumn={tab.filterColumn}
                filterPlaceholder={tab.filterPlaceholder}
              />
            </DetailCard>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
